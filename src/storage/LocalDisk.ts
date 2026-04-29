import fs from "fs/promises";
import path from "path";
import type { Disk, FileContents } from "@storage/Disk";
import { PathTraversalException } from "@storage/PathTraversalException";

export type LocalDiskOptions = {
  root: string;
  url?: string;
};

export class LocalDisk implements Disk {
  private readonly root: string;

  constructor(private readonly options: LocalDiskOptions) {
    this.root = path.resolve(options.root);
  }

  async put(filePath: string, contents: FileContents): Promise<string> {
    const normalizedPath = this.normalizePath(filePath);
    const absolutePath = this.absolutePath(normalizedPath);

    await fs.mkdir(path.dirname(absolutePath), { recursive: true });
    await fs.writeFile(absolutePath, contents);

    return normalizedPath;
  }

  async get(filePath: string): Promise<Buffer> {
    return fs.readFile(this.absolutePath(this.normalizePath(filePath)));
  }

  async exists(filePath: string): Promise<boolean> {
    try {
      await fs.access(this.absolutePath(this.normalizePath(filePath)));
      return true;
    } catch {
      return false;
    }
  }

  async delete(filePath: string): Promise<void> {
    try {
      await fs.unlink(this.absolutePath(this.normalizePath(filePath)));
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== "ENOENT") {
        throw error;
      }
    }
  }

  url(filePath: string): string {
    if (!this.options.url) {
      throw new Error("This disk does not have a public URL configured.");
    }

    return `${this.options.url.replace(/\/$/, "")}/${this.normalizePath(filePath)}`;
  }

  private absolutePath(filePath: string): string {
    const absolutePath = path.resolve(this.root, filePath);

    if (absolutePath !== this.root && !absolutePath.startsWith(`${this.root}${path.sep}`)) {
      throw new PathTraversalException(filePath);
    }

    return absolutePath;
  }

  private normalizePath(filePath: string): string {
    const normalizedPath = filePath.replace(/\\/g, "/").replace(/^\/+/, "");
    const relativePath = path.posix.normalize(normalizedPath);

    if (!relativePath || relativePath === "." || relativePath.startsWith("../") || relativePath === ".." || path.isAbsolute(relativePath)) {
      throw new PathTraversalException(filePath);
    }

    return relativePath;
  }
}
