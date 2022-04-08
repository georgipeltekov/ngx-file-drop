import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { NgxToggleModule } from '@bobbyg603/ngx-toggle';
import { NgxFileDropModule } from 'ngx-file-drop';
import { AppComponent } from './app.component';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    NgxFileDropModule,
    NgxToggleModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
