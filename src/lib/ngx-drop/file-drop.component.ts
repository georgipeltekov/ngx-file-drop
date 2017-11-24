import { Component, Input, Output, EventEmitter, NgZone, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs/Rx';
import { TimerObservable } from 'rxjs/observable/TimerObservable';

import { UploadFile } from './upload-file.model';
import { UploadEvent } from './upload-event.model';

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

  constructor(private zone: NgZone) {
    window['angularComponentRef'] = {
      zone: this.zone,
      traverseFileTree: (item, path) => this.traverseFileTree(item, path),
      addToQueue: (item) => this.addToQueue(item),
      pushToStack: (str) => this.pushToStack(str),
      popToStack: () => this.popToStack(),
      component: this
    };
    if (!this.customstyle) {
      this.customstyle = 'drop-zone';
    }
  }


  public onDragOver(event: Event): void {
    if (!this.dragoverflag) {
      this.dragoverflag = true;
      this.onFileOver.emit(event);
    }
    this.preventAndStop(event);
  }

  public onDragLeave(event: Event): void {
    if (this.dragoverflag) {
      this.dragoverflag = false;
      this.onFileLeave.emit(event);
    }
    this.preventAndStop(event);
  }


  dropFiles(event: any) {
    this.dragoverflag = false;
    event.dataTransfer.dropEffect = 'copy';
    let length;
    if (event.dataTransfer.items) {
      length = event.dataTransfer.items.length;
    } else {
      length = event.dataTransfer.files.length;
    }

    for (let i = 0; i < length; i++) {
      let entry;
      if (event.dataTransfer.items) {
        if (event.dataTransfer.items[i].webkitGetAsEntry) {
          entry = event.dataTransfer.items[i].webkitGetAsEntry();
        }
      } else {
        if (event.dataTransfer.files[i].webkitGetAsEntry) {
          entry = event.dataTransfer.files[i].webkitGetAsEntry();
        }
      }
      if (entry === null) {
        continue;
      }
      
      if (entry.isFile) {
        const toUpload: UploadFile = new UploadFile(entry.name, entry);
        this.addToQueue(toUpload);
      } else if (entry.isDirectory) {
        this.traverseFileTree(entry, entry.name);
      }
    }

    this.preventAndStop(event);

    const timer = TimerObservable.create(200, 200);
    this.subscription = timer.subscribe(t => {
      if (this.stack.length === 0) {
        this.onFileDrop.emit(new UploadEvent(this.files));
        this.files = [];
        this.subscription.unsubscribe();
      }
    });

  }

  private traverseFileTree(item, path) {

    if (item.isFile) {
      const toUpload: UploadFile = new UploadFile(path, item);
      this.files.push(toUpload);
      window['angularComponentRef'].zone.run(() => {
        window['angularComponentRef'].popToStack();
      });
    } else {
      this.pushToStack(path);
      path = path + '/';
      const dirReader = item.createReader();
      let entries = [];

      const readEntries = function () {
        dirReader.readEntries(function (res) {
          if (!res.length) {
            // add empty folders
            if (entries.length === 0) {
              const toUpload: UploadFile = new UploadFile(path, item);
              window['angularComponentRef'].zone.run(() => {
                window['angularComponentRef'].addToQueue(toUpload);
              });
            } else {
              for (let i = 0; i < entries.length; i++) {
                window['angularComponentRef'].zone.run(() => {
                  window['angularComponentRef'].traverseFileTree(entries[i], path + entries[i].name);
                });
              }
            }
            window['angularComponentRef'].zone.run(() => {
              window['angularComponentRef'].popToStack();
            });
          } else {
            // continue with the reading
            entries = entries.concat(res);
            readEntries();
          }
        });
      };

      readEntries();
    }
  }


  private addToQueue(item) {
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
  }
}


