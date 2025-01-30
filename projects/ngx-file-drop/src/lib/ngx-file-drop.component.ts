import { Component, ElementRef, Input, NgZone, OnDestroy, Renderer2, TemplateRef, inject, input, output, contentChild, viewChild } from '@angular/core';
import { Subscription, timer } from 'rxjs';

import { NgxFileDropEntry } from './ngx-file-drop-entry';
import { FileSystemDirectoryEntry, FileSystemEntry, FileSystemFileEntry } from './dom.types';
import { NgxFileDropContentTemplateDirective } from './ngx-templates.directive';

@Component({
    selector: 'ngx-file-drop',
    templateUrl: './ngx-file-drop.component.html',
    styleUrls: ['./ngx-file-drop.component.scss'],
    standalone: false
})
export class NgxFileDropComponent implements OnDestroy {
  private zone = inject(NgZone);
  private renderer = inject(Renderer2);

  public accept = input<string>('*');

  public directory = input<boolean>(false);

  public multiple = input<boolean>(true);

  public dropZoneLabel = input<string>('');

  public dropZoneClassName = input<string>('ngx-file-drop__drop-zone');

  public useDragEnter = input<boolean>(false);

  public contentClassName = input<string>('ngx-file-drop__content');

  public showBrowseBtn = input<boolean>(false);

  public browseBtnClassName = input<string>('btn btn-primary btn-xs ngx-file-drop__browse-btn');

  public browseBtnLabel = input<string>('Browse files');

  public readonly onFileDrop = output<NgxFileDropEntry[]>();

  public readonly onFileOver = output<any>();

  public readonly onFileLeave = output<any>();

  // custom templates
  readonly contentTemplate = contentChild(NgxFileDropContentTemplateDirective, { read: TemplateRef });

  readonly fileSelector = viewChild<ElementRef>('fileSelector');

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

  constructor() {
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
    const useDragEnter = this.useDragEnter();
    if (useDragEnter) {
      this.preventAndStop(event);
      if (event.dataTransfer) {
        event.dataTransfer.dropEffect = 'copy';
      }
    } else if (!this.isDropzoneDisabled() && !useDragEnter && event.dataTransfer) {
      if (!this.isDraggingOverDropZone) {
        this.isDraggingOverDropZone = true;
        this.onFileOver.emit(event);
      }
      this.preventAndStop(event);
      event.dataTransfer.dropEffect = 'copy';
    }
  }

  public onDragEnter(event: Event): void {
    if (!this.isDropzoneDisabled() && this.useDragEnter()) {
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

  public dropFiles(event: DragEvent): void {
    if (this.isDropzoneDisabled()) {
      return;
    }
    this.isDraggingOverDropZone = false;
    if (event.dataTransfer) {
      let items: FileList | DataTransferItemList;
      if (event.dataTransfer.items) {
        items = event.dataTransfer.items;
      } else {
        items = event.dataTransfer.files;
      }
      this.preventAndStop(event);
      this.checkFiles(items);
    }
  }

  public openFileSelector = (event?: MouseEvent): void => {
    const fileSelector = this.fileSelector();
    if (fileSelector && fileSelector.nativeElement) {
      (fileSelector.nativeElement as HTMLInputElement).click();
    }
  };

  /**
   * Processes the change event of the file input and adds the given files.
   * @param Event event
   */
  public uploadFiles(event: Event): void {
    if (this.isDropzoneDisabled()) {
      return;
    }
    if (event.target) {
      const items = (event.target as HTMLInputElement).files || ([] as any);
      this.checkFiles(items);
      this.resetFileInput();
    }
  }

  private getFakeDropEntry(file: File): NgxFileDropEntry {
    const fakeFileEntry: FileSystemFileEntry = {
      name: file.name,
      isDirectory: false,
      isFile: true,
      file: <T>(callback: (filea: File) => T) => callback(file),
    };
    return new NgxFileDropEntry(fakeFileEntry.name, fakeFileEntry);
  }

  private checkFile(item: DataTransferItem | File): void {
    if (!item) {
      return;
    }
    // if ("getAsFile" in item) {
    //   const file = item.getAsFile();
    //   if (file) {
    //     this.addToQueue(
    //       this.getFakeDropEntry(file)
    //     );
    //     return;
    //   }
    // }
    if ("webkitGetAsEntry" in item) {
      let entry = item.webkitGetAsEntry();
      if (entry) {
        if (entry.isFile) {
          const toUpload: NgxFileDropEntry = new NgxFileDropEntry(entry.name, entry);
          this.addToQueue(toUpload);

        } else if (entry.isDirectory) {
          this.traverseFileTree(entry, entry.name);
        }
        return;
      }
    }
    this.addToQueue(this.getFakeDropEntry((item as File)));
  }

  private checkFiles(items: FileList | DataTransferItemList): void {
    for (let i = 0; i < items.length; i++) {
      this.checkFile(items[i]);
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

  private traverseFileTree(item: FileSystemEntry, path: string): void {
    if (item.isFile) {
      const toUpload: NgxFileDropEntry = new NgxFileDropEntry(path, item);
      this.files.push(toUpload);

    } else {
      path = path + '/';
      const dirReader = (item as FileSystemDirectoryEntry).createReader();
      let entries: FileSystemEntry[] = [];

      const readEntries = () => {
        this.numOfActiveReadEntries++;
        dirReader.readEntries((result) => {
          if (!result.length) {
            // add empty folders
            if (entries.length === 0) {
              const toUpload: NgxFileDropEntry = new NgxFileDropEntry(path, item);
              this.zone.run(() => {
                this.addToQueue(toUpload);
              });

            } else {
              for (let i = 0; i < entries.length; i++) {
                this.zone.run(() => {
                  this.traverseFileTree(entries[i], path + entries[i].name);
                });
              }
            }

          } else {
            // continue with the reading
            entries = entries.concat(result);
            readEntries();
          }

          this.numOfActiveReadEntries--;
        });
      };

      readEntries();
    }
  }

  /**
   * Clears any added files from the file input element so the same file can subsequently be added multiple times.
   */
  private resetFileInput(): void {
    const fileSelector = this.fileSelector();
    if (fileSelector && fileSelector.nativeElement) {
      const fileInputEl = fileSelector.nativeElement as HTMLInputElement;
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
