
## Overview

An Angular 4 module for simple desktop file and folder drag and drop

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
import { HttpModule } from '@angular/http';

import { AppComponent } from './app.component';
import { FileDropModule } from 'ngx-file-drop/lib/ngx-drop';


@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule,
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
import { UploadFile, UploadEvent } from 'ngx-file-drop/lib/ngx-drop';

@Component({
  selector: 'demo-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {

  public files: UploadFile[] = [];

  public dropped(event: UploadEvent) {  
    this.files = event.files;
    console.log(this.files);
  }
}

```
```HTML
<div class="center">
    <file-drop headertext="Drop files here" (onFileDrop)="dropped($event)"></file-drop>
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

## Paramenters

Name  | Description | Example | 
------------- | ------------- | -------------
(onFileDrop)  | On drop function called after the files are read | (onFileDrop)="dropped($event)"
headertext  | Text to be displayed inside the drop box | headertext="Drop files here"
customstyle  | Custom style class name to be used | customstyle="my-style"

## License

[MIT](/LICENSE)

## Change Log

### 1.0.3
* Update npm support

### 1.0.1
* Doc update
* Style changes

### 1.0.0
* Initial release