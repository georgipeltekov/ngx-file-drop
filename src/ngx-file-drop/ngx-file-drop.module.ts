import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgxFileDropComponent } from './ngx-file-drop.component';
import { NgxFileDropContentTemplateDirective } from './ngx-templates.directive';

@NgModule({
  declarations: [
    NgxFileDropComponent,
    NgxFileDropContentTemplateDirective,
  ],
  imports: [
    CommonModule
  ],
  exports: [
    NgxFileDropComponent,
    NgxFileDropContentTemplateDirective,
  ],
  providers: [],
  bootstrap: [
    NgxFileDropComponent
  ],
})
export class NgxFileDropModule {}
