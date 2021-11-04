
export interface FileSystemEntry {
  name: string,
  isDirectory: boolean
  isFile: boolean
}

export interface FileSystemEntryMetadata {
  modificationTime?: Date,
  size?: number
}

export interface FileSystemDirectoryReader {
  readEntries(
    successCallback: (result: FileSystemEntry[]) => void,
  ): void
}

export interface FileSystemFlags {
  create?: boolean
  exclusive?: boolean
}

export interface FileSystemDirectoryEntry extends FileSystemEntry {
  isDirectory: true
  isFile: false
  createReader(): FileSystemDirectoryReader
}

export interface FileSystemFileEntry extends FileSystemEntry {
  isDirectory: boolean,
  isFile: boolean
  file<T>(callback: (file: File) => T): T
}
