import {
  Component,
  ContentChild,
  ElementRef,
  EventEmitter,
  Input, OnDestroy,
  Output,
  Renderer2,
  TemplateRef,
  ViewChild
} from '@angular/core';
import { Subscription, timer } from 'rxjs';
import { FileSystemFileEntry } from './dom.types';
import { NgxFileDropEntry } from './ngx-file-drop-entry';
import { NgxFileDropContentTemplateDirective } from './ngx-templates.directive';

@Component({
  selector: 'ngx-file-drop',
  templateUrl: './ngx-file-drop.component.html',
  styleUrls: ['./ngx-file-drop.component.scss'],
})
export class NgxFileDropComponent implements OnDestroy {

  @Input()
  public accept: string = '*';

  @Input()
  public directory: boolean = false;

  @Input()
  public multiple: boolean = true;

  @Input()
  public dropZoneLabel: string = '';

  @Input()
  public dropZoneClassName: string = 'ngx-file-drop__drop-zone';

  @Input()
  public useDragEnter: boolean = false;

  @Input()
  public contentClassName: string = 'ngx-file-drop__content';

  @Input()
  public showBrowseBtn: boolean = false;

  @Input()
  public browseBtnClassName: string = 'btn btn-primary btn-xs ngx-file-drop__browse-btn';

  @Input()
  public browseBtnLabel: string = 'Browse files';

  @Output()
  public onFileDrop: EventEmitter<NgxFileDropEntry[]> = new EventEmitter();

  @Output()
  public onFileOver: EventEmitter<any> = new EventEmitter();

  @Output()
  public onFileLeave: EventEmitter<any> = new EventEmitter();

  // custom templates
  @ContentChild(NgxFileDropContentTemplateDirective, { read: TemplateRef }) contentTemplate: TemplateRef<any>;

  @ViewChild('fileSelector', { static: true })
  public fileSelector: ElementRef;

  public isDraggingOverDropZone: boolean = false;

  private globalDraggingInProgress: boolean = false;
  private readonly globalDragStartListener: () => void;
  private readonly globalDragEndListener: () => void;

  private files: NgxFileDropEntry[] = [];
  private numOfActiveReadEntries: number = 0;

  private helperFormEl: HTMLFormElement | null = null;
  private fileInputPlaceholderEl: HTMLDivElement | null = null;

  private dropEventTimerSubscription: Subscription | null = null;

  private _disabled: boolean = false;

  public get disabled(): boolean { return this._disabled; }

  @Input()
  public set disabled(value: boolean) {
    this._disabled = (value != null && `${value}` !== 'false');
  }

  constructor(
    private renderer: Renderer2
  ) {
    this.globalDragStartListener = this.renderer.listen('document', 'dragstart', (evt: Event) => {
      this.globalDraggingInProgress = true;
    });
    this.globalDragEndListener = this.renderer.listen('document', 'dragend', (evt: Event) => {
      this.globalDraggingInProgress = false;
    });
  }

  public ngOnDestroy(): void {
    if (this.dropEventTimerSubscription) {
      this.dropEventTimerSubscription.unsubscribe();
      this.dropEventTimerSubscription = null;
    }
    this.globalDragStartListener();
    this.globalDragEndListener();
    this.files = [];
    this.helperFormEl = null;
    this.fileInputPlaceholderEl = null;
  }

  public onDragOver(event: DragEvent): void {
    if (this.useDragEnter) {
      this.preventAndStop(event);
      if (event.dataTransfer) {
        event.dataTransfer.dropEffect = 'copy';
      }
    } else if (!this.isDropzoneDisabled() && !this.useDragEnter && event.dataTransfer) {
      if (!this.isDraggingOverDropZone) {
        this.isDraggingOverDropZone = true;
        this.onFileOver.emit(event);
      }
      this.preventAndStop(event);
      event.dataTransfer.dropEffect = 'copy';
    }
  }

  public onDragEnter(event: Event): void {
    if (!this.isDropzoneDisabled() && this.useDragEnter) {
      if (!this.isDraggingOverDropZone) {
        this.isDraggingOverDropZone = true;
        this.onFileOver.emit(event);
      }
      this.preventAndStop(event);
    }
  }

  public onDragLeave(event: Event): void {
    if (!this.isDropzoneDisabled()) {
      if (this.isDraggingOverDropZone) {
        this.isDraggingOverDropZone = false;
        this.onFileLeave.emit(event);
      }
      this.preventAndStop(event);
    }
  }

  public async dropFiles(event: DragEvent): Promise<void> {
    if (!this.isDropzoneDisabled()) {
      this.isDraggingOverDropZone = false;
      if (event.dataTransfer) {
        const items = event.dataTransfer.files;
        this.preventAndStop(event);
        await this.checkFiles(items);
      }
    }
  }

  public openFileSelector = (event?: MouseEvent): void => {
    if (this.fileSelector && this.fileSelector.nativeElement) {
      (this.fileSelector.nativeElement as HTMLInputElement).click();
    }
  };

  /**
   * Processes the change event of the file input and adds the given files.
   * @param Event event
   */
  public async uploadFiles(event: Event): Promise<void> {
    if (!this.isDropzoneDisabled()) {
      if (event.target) {
        const items = (event.target as HTMLInputElement).files || ([] as any);
        await this.checkFiles(items);
        this.resetFileInput();
      }
    }
  }

  private async checkFiles(items: FileList): Promise<void> {
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      const name = (item as File).name;
      let isDirectory = false;
      let isFile = false;
      try {
        await item.slice(0, 1).arrayBuffer();
        isFile = true;
      } catch {
        isDirectory = true;
      }

      const fakeFileEntry: FileSystemFileEntry = {
        name,
        isDirectory,
        isFile,
        file: <T>(callback: (filea: File) => T) => callback(item as File),
      };
      const toUpload: NgxFileDropEntry = new NgxFileDropEntry(fakeFileEntry.name, fakeFileEntry);
      this.addToQueue(toUpload);
    }

    if (this.dropEventTimerSubscription) {
      this.dropEventTimerSubscription.unsubscribe();
    }
    this.dropEventTimerSubscription = timer(200, 200)
      .subscribe(() => {
        if (this.files.length > 0 && this.numOfActiveReadEntries === 0) {
          const files = this.files;
          this.files = [];
          this.onFileDrop.emit(files);
        }
      });
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
        this.renderer.insertBefore(fileInputContainerEl, fileInputPlaceholderEl, fileInputEl);
        // Add the form input as child of the temporary form element, removing the form input from the DOM.
        this.renderer.appendChild(helperFormEl, fileInputEl);
        // Reset the form, thus clearing the input element of any files.
        helperFormEl.reset();
        // Add the file input back to the DOM in place of the file input placeholder element.
        this.renderer.insertBefore(fileInputContainerEl, fileInputEl, fileInputPlaceholderEl);
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
      this.helperFormEl = this.renderer.createElement('form') as HTMLFormElement;
    }

    return this.helperFormEl;
  }

  /**
   * Get a cached HTML div element to be used as placeholder for the file input element when clearing said element.
   */
  private getFileInputPlaceholderElement(): HTMLDivElement {
    if (!this.fileInputPlaceholderEl) {
      this.fileInputPlaceholderEl = this.renderer.createElement('div') as HTMLDivElement;
    }

    return this.fileInputPlaceholderEl;
  }

  private isDropzoneDisabled(): boolean {
    return (this.globalDraggingInProgress || this.disabled);
  }

  private addToQueue(item: NgxFileDropEntry): void {
    this.files.push(item);
  }

  private preventAndStop(event: Event): void {
    event.stopPropagation();
    event.preventDefault();
  }
}
