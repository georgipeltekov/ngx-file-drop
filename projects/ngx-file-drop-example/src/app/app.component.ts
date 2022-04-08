import { Component } from '@angular/core';
import { NgxFileDropEntry } from 'ngx-file-drop';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'ngx-file-drop-example';

  disabled = false;
  entries: string[] = [];

  dropped(files: NgxFileDropEntry[]): void {
    this.entries = files.map(file => file.relativePath);
  }
}
