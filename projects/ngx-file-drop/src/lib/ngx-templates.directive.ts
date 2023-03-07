import { Directive, TemplateRef } from '@angular/core';

@Directive({ selector: '[ngx-file-drop-content-tmp]' })
export class NgxFileDropContentTemplateDirective {
  constructor(public template: TemplateRef<any>) { }
}
