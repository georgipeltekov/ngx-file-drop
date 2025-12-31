import { Directive, TemplateRef } from '@angular/core';

@Directive({
    selector: '[ngx-file-drop-content-tmp]',
    standalone: false
})
export class NgxFileDropContentTemplateDirective {
  constructor(public template: TemplateRef<any>) { }
}
