import fs from "fs/promises";
import os from "os";
import path from "path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { LocalDisk, PathTraversalException, StorageManager } from "@storage";
import type { StorageConfig } from "@config/storage";

let root: string;

describe("LocalDisk", () => {
  beforeEach(async () => {
    root = await fs.mkdtemp(path.join(os.tmpdir(), "portfolio-storage-"));
  });

  afterEach(async () => {
    await fs.rm(root, { recursive: true, force: true });
  });

  it("writes, reads, checks, and deletes files", async () => {
    const disk = new LocalDisk({ root, url: "/storage" });

    const storedPath = await disk.put("reports/example.txt", "Hello");

    expect(storedPath).toBe("reports/example.txt");
    expect(await disk.exists("reports/example.txt")).toBe(true);
    expect((await disk.get("reports/example.txt")).toString()).toBe("Hello");
    expect(disk.url("reports/example.txt")).toBe("/storage/reports/example.txt");

    await disk.delete("reports/example.txt");

    expect(await disk.exists("reports/example.txt")).toBe(false);
  });

  it("rejects path traversal", async () => {
    const disk = new LocalDisk({ root });

    await expect(disk.put("../outside.txt", "Nope")).rejects.toBeInstanceOf(PathTraversalException);
    await expect(disk.get("../outside.txt")).rejects.toBeInstanceOf(PathTraversalException);
  });
});

describe("StorageManager", () => {
  beforeEach(async () => {
    root = await fs.mkdtemp(path.join(os.tmpdir(), "portfolio-storage-manager-"));
  });

  afterEach(async () => {
    await fs.rm(root, { recursive: true, force: true });
  });

  it("resolves default and named disks", async () => {
    const config: StorageConfig = {
      default: "local",
      upload: {
        maxFileSize: 2048,
        avatar: {
          mimeTypes: ["image/png"],
          extensions: ["png"],
        },
      },
      disks: {
        local: {
          driver: "local",
          root: path.join(root, "private"),
          visibility: "private",
        },
        public: {
          driver: "local",
          root: path.join(root, "public"),
          visibility: "public",
          url: "/storage",
        },
      },
    };
    const storage = new StorageManager(config);

    await storage.put("private.txt", "private");
    await storage.disk("public").put("public.txt", "public");

    expect((await storage.get("private.txt")).toString()).toBe("private");
    expect((await storage.disk("public").get("public.txt")).toString()).toBe("public");
    expect(storage.disk("public").url("public.txt")).toBe("/storage/public.txt");
  });
});
