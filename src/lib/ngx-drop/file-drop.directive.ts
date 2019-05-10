import {
  Directive,
  ElementRef,
  EventEmitter,
  HostListener,
  Input,
  NgZone,
  OnDestroy,
  Output,
  Renderer2,
  ContentChild,
  AfterContentInit
} from '@angular/core';
import { Subscription, timer } from 'rxjs';
import {
  FileSystemDirectoryEntry,
  FileSystemEntry,
  FileSystemFileEntry
} from './dom.types';
import { UploadEvent } from './upload-event.model';
import { UploadFile } from './upload-file.model';
import { FileSelector } from '../ngx-file-selector/file-drop-selector.component';
@Directive({
  selector: '[fdFileDrop]'
})
export class FileDropDirective implements AfterContentInit, OnDestroy {
  @Input('fdAccept')
  public accept: string = '*';

  @Input('fdDropZoneClassName')
  public dropZoneClassName: string = 'ngx-file-drop__drop-zone';

  public get disabled(): boolean {
    return this._disabled;
  }
  @Input('fdDisabled')
  public set disabled(value: boolean) {
    this._disabled = value != null && `${value}` !== 'false';
  }

  @Output('fdOnFileDrop')
  public onFileDrop: EventEmitter<UploadEvent> = new EventEmitter<
    UploadEvent
  >();
  @Output('fdOnFileOver')
  public onFileOver: EventEmitter<any> = new EventEmitter<any>();
  @Output('fdOnFileLeave')
  public onFileLeave: EventEmitter<any> = new EventEmitter<any>();

  @ContentChild(FileSelector)
  fileSelector?: FileSelector;

  private _isDraggingOverDropZone = false;
  get isDraggingOverDropZone() {
    return this._isDraggingOverDropZone;
  }
  set isDraggingOverDropZone(value: boolean) {
    this._isDraggingOverDropZone = value;

    if (value === true) {
      this.renderer.addClass(
        this.element.nativeElement,
        this.dropZoneClassName
      );
    } else {
      this.renderer.removeClass(
        this.element.nativeElement,
        this.dropZoneClassName
      );
    }
  }

  private globalDraggingInProgress: boolean = false;
  private globalDragStartListener: () => void;
  private globalDragEndListener: () => void;

  private files: UploadFile[] = [];
  private numOfActiveReadEntries: number = 0;

  private dropEventTimerSubscription: Subscription | null = null;

  private _disabled: boolean = false;

  constructor(
    private zone: NgZone,
    private renderer: Renderer2,
    private element: ElementRef
  ) {
    this.globalDragStartListener = this.renderer.listen(
      'document',
      'dragstart',
      () => {
        this.globalDraggingInProgress = true;
      }
    );
    this.globalDragEndListener = this.renderer.listen(
      'document',
      'dragend',
      () => {
        this.globalDraggingInProgress = false;
      }
    );
  }

  // subscribe to the file selector input changes if the file selector exists.
  ngAfterContentInit(): void {
    if (this.fileSelector) {
      this.fileSelector.onFileInputChange.subscribe((c: Event) =>
        this.uploadFiles(c)
      );
    }
  }

  public ngOnDestroy(): void {
    if (this.dropEventTimerSubscription) {
      this.dropEventTimerSubscription.unsubscribe();
      this.dropEventTimerSubscription = null;
    }
    this.globalDragStartListener();
    this.globalDragEndListener();
    this.files = [];
    if (this.fileSelector) {
      this.fileSelector.onFileInputChange.unsubscribe();
    }
  }

  @HostListener('dragover', ['$event'])
  public onDragOver(event: Event): void {
    if (!this.isDropzoneDisabled()) {
      if (!this.isDraggingOverDropZone) {
        this.isDraggingOverDropZone = true;
        this.onFileOver.emit(event);
      }
      this.preventAndStop(event);
    }
  }

  @HostListener('dragleave', ['$event'])
  public onDragLeave(event: Event): void {
    if (!this.isDropzoneDisabled()) {
      if (this.isDraggingOverDropZone) {
        this.isDraggingOverDropZone = false;
        this.onFileLeave.emit(event);
      }
      this.preventAndStop(event);
    }
  }

  @HostListener('drop', ['$event'])
  public dropFiles(event: DragEvent): void {
    if (!this.isDropzoneDisabled()) {
      this.isDraggingOverDropZone = false;
      if (event.dataTransfer) {
        event.dataTransfer.dropEffect = 'copy';
        let items: FileList | DataTransferItemList;
        if (event.dataTransfer.items) {
          items = event.dataTransfer.items;
        } else {
          items = event.dataTransfer.files;
        }
        this.preventAndStop(event);
        this.checkFiles(items);
      }
    }
  }

  /**
   * Processes the change event of the file input and adds the given files.
   * @param Event event
   */
  public uploadFiles(event: Event): void {
    if (!this.isDropzoneDisabled()) {
      if (event.target) {
        const items = (event.target as HTMLInputElement).files || ([] as any);
        this.checkFiles(items);
      }
    }
  }

  private checkFiles(items: FileList | DataTransferItemList): void {
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      let entry: FileSystemEntry | null = null;
      if (this.canGetAsEntry(item)) {
        entry = item.webkitGetAsEntry();
      }

      if (!entry) {
        if (item) {
          const fakeFileEntry: FileSystemFileEntry = {
            name: (item as File).name,
            isDirectory: false,
            isFile: true,
            file: (callback: (filea: File) => void): void => {
              callback(item as File);
            }
          };
          const toUpload: UploadFile = new UploadFile(
            fakeFileEntry.name,
            fakeFileEntry
          );
          this.addToQueue(toUpload);
        }
      } else {
        if (entry.isFile) {
          const toUpload: UploadFile = new UploadFile(entry.name, entry);
          this.addToQueue(toUpload);
        } else if (entry.isDirectory) {
          this.traverseFileTree(entry, entry.name);
        }
      }
    }

    if (this.dropEventTimerSubscription) {
      this.dropEventTimerSubscription.unsubscribe();
    }
    this.dropEventTimerSubscription = timer(200, 200).subscribe(() => {
      if (this.files.length > 0 && this.numOfActiveReadEntries === 0) {
        this.onFileDrop.emit(new UploadEvent(this.files));
        this.files = [];
      }
    });
  }

  private traverseFileTree(item: FileSystemEntry, path: string): void {
    if (item.isFile) {
      const toUpload: UploadFile = new UploadFile(path, item);
      this.files.push(toUpload);
    } else {
      path = path + '/';
      const dirReader = (item as FileSystemDirectoryEntry).createReader();
      let entries: FileSystemEntry[] = [];

      const readEntries = () => {
        this.numOfActiveReadEntries++;
        dirReader.readEntries(result => {
          if (!result.length) {
            // add empty folders
            if (entries.length === 0) {
              const toUpload: UploadFile = new UploadFile(path, item);
              this.zone.run(() => {
                this.addToQueue(toUpload);
              });
            } else {
              for (let i = 0; i < entries.length; i++) {
                this.zone.run(() => {
                  this.traverseFileTree(entries[i], path + entries[i].name);
                });
              }
            }
          } else {
            // continue with the reading
            entries = entries.concat(result);
            readEntries();
          }

          this.numOfActiveReadEntries--;
        });
      };

      readEntries();
    }
  }

  private canGetAsEntry(item: any): item is DataTransferItem {
    return !!item.webkitGetAsEntry;
  }

  private isDropzoneDisabled(): boolean {
    return this.globalDraggingInProgress || this.disabled;
  }

  private addToQueue(item: UploadFile): void {
    this.files.push(item);
  }

  private preventAndStop(event: Event): void {
    event.stopPropagation();
    event.preventDefault();
  }
}
