export type FileContents = Buffer | string;

export interface Disk {
  put(filePath: string, contents: FileContents): Promise<string>;
  get(filePath: string): Promise<Buffer>;
  exists(filePath: string): Promise<boolean>;
  delete(filePath: string): Promise<void>;
  url(filePath: string): string;
}
