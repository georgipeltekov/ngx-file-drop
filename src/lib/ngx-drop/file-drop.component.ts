import { Component, Input, Output, EventEmitter, NgZone, OnDestroy, Renderer } from '@angular/core';
import { timer, Subscription } from 'rxjs';

import { UploadFile } from './upload-file.model';
import { UploadEvent } from './upload-event.model';
import { FileSystemFileEntry, FileSystemEntryMetadata, FileSystemEntry, FileSystemDirectoryEntry } from './dom.types';

@Component({
  selector: 'file-drop',
  templateUrl: './file-drop.component.html',
  styleUrls: ['./file-drop.component.scss']
})


export class FileComponent implements OnDestroy {

  @Input()
  headertext: string = '';
  @Input()
  customstyle: string = null;
  @Input()
  disableIf: boolean = false;

  @Output()
  public onFileDrop: EventEmitter<UploadEvent> = new EventEmitter<UploadEvent>();
  @Output()
  public onFileOver: EventEmitter<any> = new EventEmitter<any>();
  @Output()
  public onFileLeave: EventEmitter<any> = new EventEmitter<any>();

  stack = [];
  files: UploadFile[] = [];
  subscription: Subscription;
  dragoverflag: boolean = false;

  globalDisable: boolean = false;
  globalStart: Function;
  globalEnd: Function;

  numOfActiveReadEntries = 0

  constructor(
    private zone: NgZone,
    private renderer: Renderer
  ) {
    if (!this.customstyle) {
      this.customstyle = 'drop-zone';
    }
    this.globalStart = this.renderer.listen('document', 'dragstart', (evt) => {
      this.globalDisable = true;
    });
    this.globalEnd = this.renderer.listen('document', 'dragend', (evt) => {
      this.globalDisable = false;
    });
  }

  public onDragOver(event: Event): void {
    if (!this.globalDisable && !this.disableIf) {
      if (!this.dragoverflag) {
        this.dragoverflag = true;
        this.onFileOver.emit(event);
      }
      this.preventAndStop(event);
    }
  }

  public onDragLeave(event: Event): void {
    if (!this.globalDisable && !this.disableIf) {
      if (this.dragoverflag) {
        this.dragoverflag = false;
        this.onFileLeave.emit(event);
      }
      this.preventAndStop(event);
    }
  }

  dropFiles(event: any) {
    if (!this.globalDisable && !this.disableIf) {
      this.dragoverflag = false;
      event.dataTransfer.dropEffect = 'copy';
      let length;
      if (event.dataTransfer.items) {
        length = event.dataTransfer.items.length;
      } else {
        length = event.dataTransfer.files.length;
      }

      for (let i = 0; i < length; i++) {
        let entry: FileSystemEntry;
        if (event.dataTransfer.items) {
          if (event.dataTransfer.items[i].webkitGetAsEntry) {
            entry = event.dataTransfer.items[i].webkitGetAsEntry();
          }
        } else {
          if (event.dataTransfer.files[i].webkitGetAsEntry) {
            entry = event.dataTransfer.files[i].webkitGetAsEntry();
          }
        }
        if (!entry) {
          const file: File = event.dataTransfer.files[i];
          if (file) {
            const fakeFileEntry: FileSystemFileEntry = {
              name: file.name,
              isDirectory: false,
              isFile: true,
              file: (callback: (filea: File) => void): void => {
                callback(file)
              }
            }
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

      this.preventAndStop(event);

      const timerObservable = timer(200, 200);
      this.subscription = timerObservable.subscribe(t => {
        if (this.files.length > 0 && this.numOfActiveReadEntries === 0) {
          this.onFileDrop.emit(new UploadEvent(this.files));
          this.files = [];
        }
      });
    }

  }

  private traverseFileTree(item: FileSystemEntry, path: string) {

    if (item.isFile) {
      const toUpload: UploadFile = new UploadFile(path, item);
      this.files.push(toUpload);
      this.zone.run(() => {
        this.popToStack();
      });
    } else {
      this.pushToStack(path);
      path = path + '/';
      const dirReader = (item as FileSystemDirectoryEntry).createReader();
      let entries = [];
      const thisObj = this;

      const readEntries = function () {
        thisObj.numOfActiveReadEntries++
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
              thisObj.popToStack();
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

  private addToQueue(item: UploadFile) {
    this.files.push(item);
  }

  pushToStack(str) {
    this.stack.push(str);
  }

  popToStack() {
    const value = this.stack.pop();
  }

  private clearQueue() {
    this.files = [];
  }

  private preventAndStop(event) {
    event.stopPropagation();
    event.preventDefault();
  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
    this.globalStart();
    this.globalEnd();
  }
}
