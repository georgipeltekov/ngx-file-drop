import {
  Component,
  Input,
  Output,
  EventEmitter,
  NgZone,
  OnDestroy,
  Renderer2,
  ViewChild,
  ElementRef
} from '@angular/core';
import { timer, Subscription } from 'rxjs';

import { UploadFile } from './upload-file.model';
import { UploadEvent } from './upload-event.model';
import { FileSystemFileEntry, FileSystemEntry, FileSystemDirectoryEntry } from './dom.types';

@Component({
  selector: 'file-drop',
  templateUrl: './file-drop.component.html',
  styleUrls: ['./file-drop.component.scss'],
})
export class FileComponent implements OnDestroy {

  @Input()
  public accept: string = '*';

  @Input()
  public dropZoneLabel: string = '';
  /** @deprecated Will be removed in the next major version. Use `dropZoneLabel` instead. */
  public get headertext(): string { return this.dropZoneLabel; }
  /** @deprecated Will be removed in the next major version. Use `dropZoneLabel` instead. */
  @Input()
  public set headertext(value: string) {
    this.dropZoneLabel = value;
  }

  @Input()
  public dropZoneClassName: string = 'ngx-file-drop__drop-zone';
  /** @deprecated Will be removed in the next major version. Use `dropZoneClassName` instead. */
  public get customstyle(): string { return this.dropZoneClassName; }
  /** @deprecated Will be removed in the next major version. Use `dropZoneClassName` instead. */
  @Input()
  public set customstyle(value: string) {
    this.dropZoneClassName = value;
  }

  @Input()
  public contentClassName: string = 'ngx-file-drop__content';
  /** @deprecated Will be removed in the next major version. Use `contentClassName` instead. */
  public get customContentStyle(): string { return this.contentClassName; }
  /** @deprecated Will be removed in the next major version. Use `contentClassName` instead. */
  @Input()
  public set customContentStyle(value: string) {
    this.contentClassName = value;
  }

  public get disabled(): boolean { return this._disabled; }
  @Input()
  public set disabled(value: boolean) {
    this._disabled = (value != null && `${value}` !== 'false');
  }
  /** @deprecated Will be removed in the next major version. Use `disabled` instead. */
  public get disableIf(): boolean { return this.disabled; }
  /** @deprecated Will be removed in the next major version. Use `disabled` instead. */
  @Input()
  public set disableIf(value: boolean) {
    this.disabled = value;
  }

  @Input()
  public showBrowseBtn: boolean = false;
  @Input()
  public browseBtnClassName: string = 'btn btn-primary btn-xs ngx-file-drop__browse-btn';
  /** @deprecated Will be removed in the next major version. Use `browseBtnClassName` instead. */
  public get customBtnStyling(): string { return this.browseBtnClassName; }
  /** @deprecated Will be removed in the next major version. Use `browseBtnClassName` instead. */
  @Input()
  public set customBtnStyling(value: string) {
    this.browseBtnClassName = value;
  }

  @Input()
  public browseBtnLabel: string = 'Browse files';

  @Output()
  public onFileDrop: EventEmitter<UploadEvent> = new EventEmitter<UploadEvent>();
  @Output()
  public onFileOver: EventEmitter<any> = new EventEmitter<any>();
  @Output()
  public onFileLeave: EventEmitter<any> = new EventEmitter<any>();

  @ViewChild('fileSelector')
  public fileSelector: ElementRef;

  public isDraggingOverDropZone: boolean = false;

  private globalDraggingInProgress: boolean = false;
  private globalDragStartListener: () => void;
  private globalDragEndListener: () => void;

  private files: UploadFile[] = [];
  private numOfActiveReadEntries: number = 0;

  private helperFormEl: HTMLFormElement | null = null;
  private fileInputPlaceholderEl: HTMLDivElement | null = null;

  private dropEventTimerSubscription: Subscription | null = null;

  private _disabled: boolean = false;

  constructor(
    private zone: NgZone,
    private renderer: Renderer2
  ) {
    this.globalDragStartListener = this.renderer.listen('document', 'dragstart', (evt: Event) => {
      this.globalDraggingInProgress = true;
    });
    this.globalDragEndListener = this.renderer.listen('document', 'dragend', (evt: Event) => {
      this.globalDraggingInProgress = false;
    });
  }

  public ngOnDestroy(): void {
    if (this.dropEventTimerSubscription) {
      this.dropEventTimerSubscription.unsubscribe();
      this.dropEventTimerSubscription = null;
    }
    this.globalDragStartListener();
    this.globalDragEndListener();
    this.files = [];
    this.helperFormEl = null;
    this.fileInputPlaceholderEl = null;
  }

  public onDragOver(event: Event): void {
    if (!this.isDropzoneDisabled()) {
      if (!this.isDraggingOverDropZone) {
        this.isDraggingOverDropZone = true;
        this.onFileOver.emit(event);
      }
      this.preventAndStop(event);
    }
  }

  public onDragLeave(event: Event): void {
    if (!this.isDropzoneDisabled()) {
      if (this.isDraggingOverDropZone) {
        this.isDraggingOverDropZone = false;
        this.onFileLeave.emit(event);
      }
      this.preventAndStop(event);
    }
  }

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

  public onBrowseButtonClick(event: MouseEvent): void {
    if (this.fileSelector && this.fileSelector.nativeElement) {
      (this.fileSelector.nativeElement as HTMLInputElement).click();
    }
  }

  /**
   * Processes the change event of the file input and adds the given files.
   * @param {Event} event
   */
  public uploadFiles(event: Event): void {
    if (!this.isDropzoneDisabled()) {
      if (event.target) {
        const items = (event.target as HTMLInputElement).files || ([] as any);
        this.checkFiles(items);
        this.resetFileInput();
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
            },
          };
          const toUpload: UploadFile = new UploadFile(fakeFileEntry.name, fakeFileEntry);
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
    this.dropEventTimerSubscription = timer(200, 200)
      .subscribe(() => {
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
        dirReader.readEntries((result) => {
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

  /**
   * Clears any added files from the file input element so the same file can subsequently be added multiple times.
   */
  private resetFileInput(): void {
    if (this.fileSelector && this.fileSelector.nativeElement) {
      const fileInputEl = this.fileSelector.nativeElement as HTMLInputElement;
      const fileInputContainerEl = fileInputEl.parentElement;
      const helperFormEl = this.getHelperFormElement();
      const fileInputPlaceholderEl = this.getFileInputPlaceholderElement();

      // Just a quick check so we do not mess up the DOM (will never happen though).
      if (fileInputContainerEl !== helperFormEl) {
        // Insert the form input placeholder in the DOM before the form input element.
        this.renderer.insertBefore(fileInputContainerEl, fileInputPlaceholderEl, fileInputEl);
        // Add the form input as child of the temporary form element, removing the form input from the DOM.
        this.renderer.appendChild(helperFormEl, fileInputEl);
        // Reset the form, thus clearing the input element of any files.
        helperFormEl.reset();
        // Add the file input back to the DOM in place of the file input placeholder element.
        this.renderer.insertBefore(fileInputContainerEl, fileInputEl, fileInputPlaceholderEl);
        // Remove the input placeholder from the DOM
        this.renderer.removeChild(fileInputContainerEl, fileInputPlaceholderEl);
      }
    }
  }

  /**
   * Get a cached HTML form element as a helper element to clear the file input element.
   */
  private getHelperFormElement(): HTMLFormElement {
    if (!this.helperFormEl) {
      this.helperFormEl = this.renderer.createElement('form') as HTMLFormElement;
    }

    return this.helperFormEl;
  }

  /**
   * Get a cached HTML div element to be used as placeholder for the file input element when clearing said element.
   */
  private getFileInputPlaceholderElement(): HTMLDivElement {
    if (!this.fileInputPlaceholderEl) {
      this.fileInputPlaceholderEl = this.renderer.createElement('div') as HTMLDivElement;
    }

    return this.fileInputPlaceholderEl;
  }

  private canGetAsEntry(item: any): item is DataTransferItem {
    return !!item.webkitGetAsEntry;
  }

  private isDropzoneDisabled(): boolean {
    return (this.globalDraggingInProgress || this.disabled);
  }

  private addToQueue(item: UploadFile): void {
    this.files.push(item);
  }

  private preventAndStop(event: Event): void {
    event.stopPropagation();
    event.preventDefault();
  }
}
