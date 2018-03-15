import { FileSystemEntry, FileSystemFileEntry, FileSystemDirectoryEntry } from './dom.types';

/**
 * fileEntry is an instance of {@link FileSystemFileEntry} or {@link FileSystemDirectoryEntry}.
 * Which one is it can be checked using {@link FileSystemEntry.isFile} or {@link FileSystemEntry.isDirectory}
 * properties of the given {@link FileSystemEntry}.
 */
export class UploadFile {
    constructor(
        public relativePath: string,
        public fileEntry: FileSystemEntry) {
    }
}
