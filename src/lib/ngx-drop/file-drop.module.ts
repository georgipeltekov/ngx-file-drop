import { NgModule } from '@angular/core';
import {FileComponent} from './file-drop.component';

@NgModule({
  declarations: [
    FileComponent,
  ],
  exports: [FileComponent],
  imports: [],
  providers: [],
  bootstrap: [FileComponent],
})
export class FileDropModule {}
