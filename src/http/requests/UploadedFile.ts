import { randomUUID } from "crypto";
import path from "path";
import { Storage } from "@storage";

export class UploadedFile {
  readonly fieldName: string;
  readonly originalName: string;
  readonly mimeType: string;
  readonly size: number;

  constructor(private readonly file: Express.Multer.File) {
    this.fieldName = file.fieldname;
    this.originalName = file.originalname;
    this.mimeType = file.mimetype;
    this.size = file.size;
  }

  get extension(): string {
    return path.extname(this.originalName).replace(".", "").toLowerCase();
  }

  store(directory: string, disk = "local"): Promise<string> {
    return this.storeAs(directory, `${randomUUID()}.${this.extension}`, disk);
  }

  storeAs(directory: string, filename: string, disk = "local"): Promise<string> {
    const filePath = [directory.replace(/^\/+|\/+$/g, ""), filename].filter(Boolean).join("/");

    return Storage.disk(disk).put(filePath, this.file.buffer);
  }
}
