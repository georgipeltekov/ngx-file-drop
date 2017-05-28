import { Component, Input, Output, EventEmitter, NgZone } from '@angular/core';
import { Subscription } from 'rxjs/Rx';
import { TimerObservable } from "rxjs/observable/TimerObservable";

import { UploadFile } from './upload-file.model';
import { UploadEvent } from './upload-event.model';

@Component({
  selector: 'file-drop',
  templateUrl: './file-drop.component.html',
  styleUrls: ['./file-drop.component.scss']
})


export class FileComponent {

  @Input()
  headertext: string = "";
  @Input()
  customstyle: string = null;

  @Output()
  public onFileDrop: EventEmitter<UploadEvent> = new EventEmitter<UploadEvent>();

  private stack = [];
  private files: UploadFile[] = [];
  private subscription: Subscription;
  private dragoverflag: boolean = false;

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
      this.customstyle = "drop-zone";
    }
  }

  ngOnInit() {
  }

  allowDrop(event: any) {
    this.preventAndStop(event);
  }

  public onDragOver(event: Event): void {
    if (this.files.length == 0 || !this.dragoverflag) {
      this.dragoverflag = true;
      this.preventAndStop(event);
    }
  }

  public onDragLeave(event: Event): void {
    if (this.files.length != 0 || this.dragoverflag) {
      this.dragoverflag = false;
      this.preventAndStop(event);
    }
  }


  dropFiles(event: any) {
    this.dragoverflag = false;
    event.dataTransfer.dropEffect = "copy";
    var length = event.dataTransfer.items.length;
    for (var i = 0; i < length; i++) {
      var entry = event.dataTransfer.items[i].webkitGetAsEntry();
      entry.getme
      if (entry.isFile) {
        let toUpload: UploadFile = new UploadFile(entry.name, entry);
        this.addToQueue(toUpload);
      } else if (entry.isDirectory) {
        this.traverseFileTree(entry, entry.name);
      }
    }

    this.preventAndStop(event);

    let timer = TimerObservable.create(200, 200);
    this.subscription = timer.subscribe(t => {
      if (this.stack.length == 0) {
        this.onFileDrop.emit(new UploadEvent(this.files));
        this.files = [];
        this.subscription.unsubscribe();
      }
    });

  }

  private traverseFileTree(item, path) {

    if (item.isFile) {
      let toUpload: UploadFile = new UploadFile(path, item);
      this.files.push(toUpload);
      window['angularComponentRef'].zone.run(() => {
        window['angularComponentRef'].popToStack();
      });
    } else {
      this.pushToStack(path);
      path = path + "/";
      var dirReader = item.createReader();
      let entries = dirReader.readEntries(function (entries) {

        //add empty folders
        if (entries.length == 0) {
          let toUpload: UploadFile = new UploadFile(path, item);
          window['angularComponentRef'].zone.run(() => {
            window['angularComponentRef'].addToQueue(toUpload);
          });
        } else {
          for (var i = 0; i < entries.length; i++) {
            window['angularComponentRef'].zone.run(() => {
              window['angularComponentRef'].traverseFileTree(entries[i], path + entries[i].name);
            });
          }
        }
        window['angularComponentRef'].zone.run(() => {
          window['angularComponentRef'].popToStack();
        });
      });
    }


  }

  private addToQueue(item) {
    this.files.push(item);
  }

  pushToStack(str) {
    this.stack.push(str);
  }

  popToStack() {
    var value = this.stack.pop();
  }

  private clearQueue() {
    this.files = [];
  }

  private preventAndStop(event) {
    event.stopPropagation();
    event.preventDefault();
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
}


