[![npm](https://img.shields.io/npm/v/ngx-file-drop.svg?style=flat-square)](https://www.npmjs.com/package/ngx-file-drop) [![npm downloads](https://img.shields.io/npm/dm/ngx-file-drop.svg)](https://www.npmjs.com/package/ngx-file-drop) [![Travis](https://img.shields.io/travis/georgipeltekov/ngx-file-drop.svg?style=flat-square)](https://travis-ci.org/georgipeltekov/ngx-file-drop) [![MIT licensed](https://img.shields.io/badge/license-MIT-blue.svg?style=flat-square)](https://github.com/georgipeltekov/ngx-file-drop/blob/master/LICENSE)

## Overview

An Angular module for simple desktop file and folder drag and drop. This library does not need rxjs-compat.

For previous Angular support please use older versions.

This library relies on HTML 5 File API thus IE is not supported

## DEMO
You can check the [DEMO](https://georgipeltekov.github.io/) of the library 

## Installation

```bash
npm install ngx-file-drop --save
```

## Usage


### Importing The 'ngx-file-drop' Module

```TypeScript
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

import { AppComponent } from './app.component';
import { NgxFileDropModule } from 'ngx-file-drop';


@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpClientModule,
    NgxFileDropModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }

```

### Enabling File Drag


```TypeScript
import { Component } from '@angular/core';
import { NgxFileDropEntry, FileSystemFileEntry, FileSystemDirectoryEntry } from 'ngx-file-drop';

@Component({
  selector: 'demo-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {

  public files: NgxFileDropEntry[] = [];

  public dropped(files: NgxFileDropEntry[]) {
    this.files = files;
    for (const droppedFile of files) {

      // Is it a file?
      if (droppedFile.fileEntry.isFile) {
        const fileEntry = droppedFile.fileEntry as FileSystemFileEntry;
        fileEntry.file((file: File) => {

          // Here you can access the real file
          console.log(droppedFile.relativePath, file);

          /**
          // You could upload it like this:
          const formData = new FormData()
          formData.append('logo', file, relativePath)

          // Headers
          const headers = new HttpHeaders({
            'security-token': 'mytoken'
          })

          this.http.post('https://mybackend.com/api/upload/sanitize-and-save-logo', formData, { headers: headers, responseType: 'blob' })
          .subscribe(data => {
            // Sanitized logo returned from backend
          })
          **/

        });
      } else {
        // It was a directory (empty directories are added, otherwise only files)
        const fileEntry = droppedFile.fileEntry as FileSystemDirectoryEntry;
        console.log(droppedFile.relativePath, fileEntry);
      }
    }
  }

  public fileOver(event){
    console.log(event);
  }

  public fileLeave(event){
    console.log(event);
  }
}


```
```HTML
<div class="center">
    <ngx-file-drop dropZoneLabel="Drop files here" (onFileDrop)="dropped($event)" 
    (onFileOver)="fileOver($event)" (onFileLeave)="fileLeave($event)">
        <ng-template ngx-file-drop-content-tmp let-openFileSelector="openFileSelector">
          Optional custom content that replaces the the entire default content.
          <button type="button" (click)="openFileSelector()">Browse Files</button>
        </ng-template>
    </ngx-file-drop>
    <div class="upload-table">
        <table class="table">
            <thead>
                <tr>
                    <th>Name</th>
                </tr>
            </thead>
            <tbody class="upload-name-style">
                <tr *ngFor="let item of files; let i=index">
                    <td><strong>{{ item.relativePath }}</strong></td>
                </tr>
            </tbody>
        </table>
    </div>
</div>
```

## Parameters

Name  | Description | Example | 
------------- | ------------- | -------------
(onFileDrop)  | On drop function called after the files are read | (onFileDrop)="dropped($event)"
(onFileOver)  | On drop over function| (onFileOver)="fileOver($event)"
(onFileLeave)  | On drop leave function| (onFileLeave)="fileLeave($event)"
accept  | String of accepted formats | accept=".png"
directory  | Whether directories are accepted | directory="true"
dropZoneLabel  | Text to be displayed inside the drop box | dropZoneLabel="Drop files here"
dropZoneClassName  | Custom style class name(s) to be used on the "drop-zone" area | dropZoneClassName="my-style"
contentClassName  | Custom style class name(s) to be used for the content area | contentClassName="my-style"
\[disabled\]  | Conditionally disable the dropzone  | \[disabled\]="condition"
\[showBrowseBtn\]  | Whether browse file button should be shown  | \[showBrowseBtn\]="true"
browseBtnClassName | Custom style class name(s) to be used for the button | browseBtnClassName="my-style"
browseBtnLabel  | The label of the browse file button  | browseBtnLabel="Browse files"
multiple  | Whether multiple or single files are accepted  | multiple="true"
useDragEnter  | Use dragenter event instead of dragover  | useDragEnter="true"

## License

[MIT](/LICENSE)

## Change Log

[CHANGELOG](/CHANGELOG.md)

## Donate Crypto
* Bitcoin: 18yJcRSyY7J9K7kHrkNQ2JspLfSgLKWUnh
* Ethereum: 0xdF1E80c91599CA6d4a8745888e658f45B86b0FEd


