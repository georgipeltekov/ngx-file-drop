import { Component, Input, Output, EventEmitter } from '@angular/core';
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

  constructor() {
    if (!this.customstyle) {
      this.customstyle = "drop-zone";
    }
  }

  ngOnInit() {
    window.file = window.file || {};
    window.file.namespace = window.file.namespace || {};
    window.file.namespace.traverseFileTree = this.traverseFileTree.bind(this);
    window.file.namespace.addToQueue = this.addToQueue.bind(this);
    window.file.namespace.pushToStack = this.pushToStack.bind(this);
    window.file.namespace.popToStack = this.popToStack.bind(this);
  }

  allowDrop(event: any) {
    this.preventAndStop(event);
  }


  dropFiles(event: any) {

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
        this.subscription.unsubscribe();
      }
    });

  }

  private traverseFileTree(item, path) {

    if (item.isFile) {
      let toUpload: UploadFile = new UploadFile(path, item);
      this.files.push(toUpload);
      window.file.namespace.popToStack();
    } else {
      this.pushToStack(path);
      path = path + "/";
      var dirReader = item.createReader();
      let entries = dirReader.readEntries(function (entries) {

        //add empty folders
        if (entries.length == 0) {
          let toUpload: UploadFile = new UploadFile(path, item);
          window.file.namespace.addToQueue(toUpload);
        } else {
          for (var i = 0; i < entries.length; i++) {
            window.file.namespace.traverseFileTree(entries[i], path + entries[i].name);
          }
        }
        window.file.namespace.popToStack();
      });
    }


  }

  private addToQueue(item) {
    this.files.push(item);
  }

  pushToStack(str) {
    this.stack.push(str);
  }

  popToStack(str) {
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


