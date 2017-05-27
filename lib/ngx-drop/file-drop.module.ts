import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import {FileComponent} from './file-drop.component';

@NgModule({
  declarations: [
    FileComponent,
  ],
  exports: [FileComponent],
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule
  ],
  providers: [],
  bootstrap: [FileComponent],
})
export class FileDropModule {}