import { UploadFile } from './upload-file.model';

export class UploadEvent {
    constructor(
        public files: UploadFile[]) {
    }
}
