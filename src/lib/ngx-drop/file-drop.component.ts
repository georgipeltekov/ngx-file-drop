import { Component, Input, Output, EventEmitter } from '@angular/core';

import { UploadEvent } from './upload-event.model';

@Component({
  selector: 'file-drop',
  templateUrl: './file-drop.component.html',
  styleUrls: ['./file-drop.component.scss']
})
export class FileComponent {
  @Input()
  public accept: string = '*';

  @Input()
  public multiple: boolean = true;

  @Input()
  public dropZoneLabel: string = '';

  @Input()
  public dropZoneClassName: string = 'ngx-file-drop__drop-zone';

  @Input()
  public dropZoneFileOverClassName: string = 'ngx-file-drop__drop-zone--over';

  @Input()
  public contentClassName: string = 'ngx-file-drop__content';

  @Input()
  public disabled = false;

  @Input()
  public showBrowseBtn: boolean = false;
  @Input()
  public browseBtnClassName: string =
    'btn btn-primary btn-xs ngx-file-drop__browse-btn';

  @Input()
  public browseBtnLabel: string = 'Browse files';

  @Output()
  public onFileDrop: EventEmitter<UploadEvent> = new EventEmitter<
    UploadEvent
  >();
  @Output()
  public onFileOver: EventEmitter<any> = new EventEmitter<any>();
  @Output()
  public onFileLeave: EventEmitter<any> = new EventEmitter<any>();
}
