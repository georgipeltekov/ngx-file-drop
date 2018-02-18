[![npm](https://img.shields.io/npm/v/ngx-file-drop.svg?style=flat-square)](https://www.npmjs.com/package/ngx-file-drop) [![npm downloads](https://img.shields.io/npm/dm/ngx-file-drop.svg)](https://www.npmjs.com/package/ngx-file-drop) [![Travis](https://img.shields.io/travis/georgipeltekov/ngx-file-drop.svg?style=flat-square)](https://travis-ci.org/georgipeltekov/ngx-file-drop) [![MIT licensed](https://img.shields.io/badge/license-MIT-blue.svg?style=flat-square)](https://github.com/georgipeltekov/ngx-file-drop/blob/master/LICENSE)

## Overview

An Angular 4 & 5 module for simple desktop file and folder drag and drop

## DEMO
You can check the [DEMO](https://georgipeltekov.github.io/) of the library 

## Installation

```bash
npm install ngx-file-drop --save
```

## Usage

Simple usage example can be found in the sandbox folder


### Importing The 'ngx-file-drop' Module

```TypeScript
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

import { AppComponent } from './app.component';
import { FileDropModule } from 'ngx-file-drop';


@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpClientModule,
    FileDropModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }

```

### Enabling File Drag


```TypeScript
import { Component } from '@angular/core';
import { UploadEvent, UploadFile } from 'ngx-file-drop';

@Component({
  selector: 'demo-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {

  public files: UploadFile[] = [];

  public dropped(event: UploadEvent) {
    this.files = event.files;
    for (const file of event.files) {
      file.fileEntry.file(info => {
        console.log(info);
      });
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
    <file-drop headertext="Drop files here" (onFileDrop)="dropped($event)" 
    (onFileOver)="fileOver($event)" (onFileLeave)="fileLeave($event)">
        <span>optional content (don't set headertext then)</span>
    </file-drop>
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
(onFileLeave)  | On drop leave function| (onFileOver)="fileLeave($event)"
headertext  | Text to be displayed inside the drop box | headertext="Drop files here"
customstyle  | Custom style class name to be used | customstyle="my-style"

## License

[MIT](/LICENSE)

## Change Log

[CHANGELOG](/CHANGELOG.md)

## Donate Crypto
* Ethereum: 0x22d557543ba1f8ac1dadc4eec5ea1b9ae03e0da8
* Ripple: rJeJTHNyDkqurBBAAUzo4xhJyQo9mhTCJH


