import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {FileComponent} from './file-drop.component';

@NgModule({
  declarations: [
    FileComponent,
  ],
  exports: [FileComponent],
  imports: [CommonModule],
  providers: [],
  bootstrap: [FileComponent],
})
export class FileDropModule {}
