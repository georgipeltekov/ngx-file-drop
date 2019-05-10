import {
  Component,
  Input,
  ViewChild,
  ElementRef,
  Renderer2,
  OnDestroy,
  Output,
  EventEmitter
} from '@angular/core';

@Component({
  selector: 'file-drop-selector',
  templateUrl: './file-drop-selector.component.html',
  styleUrls: ['./file-drop-selector.component.scss']
})
export class FileSelector implements OnDestroy {
  @Input()
  public accept: string = '*';

  @Input()
  public multiple: boolean = true;

  @Input()
  showBrowseBtn = false;

  @Input()
  public browseBtnClassName: string =
    'btn btn-primary btn-xs ngx-file-drop__browse-btn';

  @Input()
  public browseBtnLabel: string = 'Browse files';

  @Output()
  public onFileInputChange = new EventEmitter<Event>();

  @ViewChild('fileSelector')
  public fileSelector: ElementRef;

  private helperFormEl: HTMLFormElement | null = null;
  private fileInputPlaceholderEl: HTMLDivElement | null = null;

  constructor(private renderer: Renderer2) {}

  ngOnDestroy(): void {
    this.helperFormEl = null;
    this.fileInputPlaceholderEl = null;
  }

  public onBrowseButtonClick(event?: MouseEvent): void {
    if (this.fileSelector && this.fileSelector.nativeElement) {
      (this.fileSelector.nativeElement as HTMLInputElement).click();
    }
  }

  /**
   * Propogate the input changed event to be handled by the FileDropDirective.
   * @param Event event
   */
  public uploadFiles(event: Event): void {
    this.onFileInputChange.emit(event);
    this.resetFileInput();
  }

  /**
   * Clears any added files from the file input element so the same file can subsequently be added multiple times.
   */
  private resetFileInput(): void {
    if (this.fileSelector && this.fileSelector.nativeElement) {
      const fileInputEl = this.fileSelector.nativeElement as HTMLInputElement;
      const fileInputContainerEl = fileInputEl.parentElement;
      const helperFormEl = this.getHelperFormElement();
      const fileInputPlaceholderEl = this.getFileInputPlaceholderElement();

      // Just a quick check so we do not mess up the DOM (will never happen though).
      if (fileInputContainerEl !== helperFormEl) {
        // Insert the form input placeholder in the DOM before the form input element.
        this.renderer.insertBefore(
          fileInputContainerEl,
          fileInputPlaceholderEl,
          fileInputEl
        );
        // Add the form input as child of the temporary form element, removing the form input from the DOM.
        this.renderer.appendChild(helperFormEl, fileInputEl);
        // Reset the form, thus clearing the input element of any files.
        helperFormEl.reset();
        // Add the file input back to the DOM in place of the file input placeholder element.
        this.renderer.insertBefore(
          fileInputContainerEl,
          fileInputEl,
          fileInputPlaceholderEl
        );
        // Remove the input placeholder from the DOM
        this.renderer.removeChild(fileInputContainerEl, fileInputPlaceholderEl);
      }
    }
  }

  /**
   * Get a cached HTML form element as a helper element to clear the file input element.
   */
  private getHelperFormElement(): HTMLFormElement {
    if (!this.helperFormEl) {
      this.helperFormEl = this.renderer.createElement(
        'form'
      ) as HTMLFormElement;
    }

    return this.helperFormEl;
  }

  /**
   * Get a cached HTML div element to be used as placeholder for the file input element when clearing said element.
   */
  private getFileInputPlaceholderElement(): HTMLDivElement {
    if (!this.fileInputPlaceholderEl) {
      this.fileInputPlaceholderEl = this.renderer.createElement(
        'div'
      ) as HTMLDivElement;
    }

    return this.fileInputPlaceholderEl;
  }
}
