import { Directive, TemplateRef, inject } from '@angular/core';

@Directive({
    selector: '[ngx-file-drop-content-tmp]',
    standalone: false
})
export class NgxFileDropContentTemplateDirective {
  template = inject<TemplateRef<any>>(TemplateRef);
}
