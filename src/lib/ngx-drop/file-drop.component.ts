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
  styleUrls: ['./file-drop.component.scss']
})
export class FileComponent implements OnDestroy {

  @Input()
  public accept: string = '*'
  @Input()
  public headertext: string = '';
  @Input()
  public customstyle: string = 'drop-zone';
  @Input()
  public customContentStyle: string = 'content';
  @Input()
  public disableIf: boolean = false;
  @Input()
  public showBrowseBtn: boolean = false;
  @Input()
  public customBtnStyling: string = 'btn btn-primary btn-xs';
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

  stack: string[] = [];
  files: UploadFile[] = [];
  subscription: Subscription | null = null;
  dragoverflag: boolean = false;

  globalDisable: boolean = false;
  globalStart: Function;
  globalEnd: Function;

  numOfActiveReadEntries = 0;

  constructor(
    private zone: NgZone,
    private renderer: Renderer2
  ) {
    this.globalStart = this.renderer.listen('document', 'dragstart', (evt: Event) => {
      this.globalDisable = true;
    });
    this.globalEnd = this.renderer.listen('document', 'dragend', (evt: Event) => {
      this.globalDisable = false;
    });
  }

  public onDragOver(event: Event): void {
    if (!this.isDropzoneDisabled()) {
      if (!this.dragoverflag) {
        this.dragoverflag = true;
        this.onFileOver.emit(event);
      }
      this.preventAndStop(event);
    }
  }

  public onDragLeave(event: Event): void {
    if (!this.isDropzoneDisabled()) {
      if (this.dragoverflag) {
        this.dragoverflag = false;
        this.onFileLeave.emit(event);
      }
      this.preventAndStop(event);
    }
  }

  public dropFiles(event: DragEvent): void {
    if (!this.isDropzoneDisabled()) {
      this.dragoverflag = false;
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
              callback(item as File)
            }
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

    const timerObservable = timer(200, 200);
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
    this.subscription = timerObservable.subscribe(t => {
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
      this.zone.run(() => {
        this.popFromStack();
      });
    } else {
      this.pushToStack(path);
      path = path + '/';
      const dirReader = (item as FileSystemDirectoryEntry).createReader();
      let entries: FileSystemEntry[] = [];
      const thisObj = this;

      const readEntries = function () {
        thisObj.numOfActiveReadEntries++;
        dirReader.readEntries(function (res) {
          if (!res.length) {
            // add empty folders
            if (entries.length === 0) {
              const toUpload: UploadFile = new UploadFile(path, item);
              thisObj.zone.run(() => {
                thisObj.addToQueue(toUpload);
              });
            } else {
              for (let i = 0; i < entries.length; i++) {
                thisObj.zone.run(() => {
                  thisObj.traverseFileTree(entries[i], path + entries[i].name);
                });
              }
            }
            thisObj.zone.run(() => {
              thisObj.popFromStack();
            });
          } else {
            // continue with the reading
            entries = entries.concat(res);
            readEntries();
          }
          thisObj.numOfActiveReadEntries--
        });
      };

      readEntries();
    }
  }

  private canGetAsEntry(item: any): item is DataTransferItem {
    return !!item.webkitGetAsEntry;
  }

  private isDropzoneDisabled(): boolean {
    return (this.globalDisable || this.disableIf);
  }

  private addToQueue(item: UploadFile): void {
    this.files.push(item);
  }

  pushToStack(str: string): void {
    this.stack.push(str);
  }

  popFromStack(): string | undefined {
    return this.stack.pop();
  }

  private clearQueue(): void {
    this.files = [];
  }

  private preventAndStop(event: Event): void {
    event.stopPropagation();
    event.preventDefault();
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
      this.subscription = null;
    }
    this.globalStart();
    this.globalEnd();
  }
}
