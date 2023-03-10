import { Component } from '@angular/core';
import { NgxFileDropEntry } from 'ngx-file-drop';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'ngx-file-drop-example';

  checked = true;
  entries: string[] = [];

  get className(): string {
    return !this.checked ? 'ngx-file-drop__drop-zone--disabled' : 'ngx-file-drop__drop-zone--enabled';
  }

  dropped(files: NgxFileDropEntry[]): void {
    this.entries = files.map(file => file.relativePath);
  }

  onChange(event: any): void {
    this.checked = event.target.checked;
  }
}
