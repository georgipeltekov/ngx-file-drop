import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FileComponent } from './file-drop.component';
import { FileDropDirective } from './file-drop.directive';
import { FileSelector } from '../ngx-file-selector/file-drop-selector.component';

@NgModule({
  declarations: [FileDropDirective, FileComponent, FileSelector],
  exports: [FileDropDirective, FileComponent, FileSelector],
  imports: [CommonModule],
  providers: [],
  bootstrap: [FileComponent]
})
export class FileDropModule {}
