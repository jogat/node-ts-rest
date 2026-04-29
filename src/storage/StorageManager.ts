import type { StorageConfig } from "@config/storage";
import type { Disk, FileContents } from "@storage/Disk";
import { LocalDisk } from "@storage/LocalDisk";

export class StorageManager implements Disk {
  private disks = new Map<string, Disk>();

  constructor(private readonly config: StorageConfig) {}

  disk(name = this.config.default): Disk {
    const existingDisk = this.disks.get(name);

    if (existingDisk) {
      return existingDisk;
    }

    const diskConfig = this.config.disks[name];

    if (!diskConfig) {
      throw new Error(`Storage disk "${name}" is not configured.`);
    }

    if (diskConfig.driver !== "local") {
      throw new Error(`Storage driver "${diskConfig.driver}" is not supported.`);
    }

    const disk = new LocalDisk({
      root: diskConfig.root,
      url: diskConfig.url,
    });

    this.disks.set(name, disk);

    return disk;
  }

  put(filePath: string, contents: FileContents): Promise<string> {
    return this.disk().put(filePath, contents);
  }

  get(filePath: string): Promise<Buffer> {
    return this.disk().get(filePath);
  }

  exists(filePath: string): Promise<boolean> {
    return this.disk().exists(filePath);
  }

  delete(filePath: string): Promise<void> {
    return this.disk().delete(filePath);
  }

  url(filePath: string): string {
    return this.disk().url(filePath);
  }
}
