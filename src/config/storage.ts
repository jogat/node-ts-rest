import path from "path";

export type StorageDiskDriver = "local";
export type StorageVisibility = "private" | "public";

export type StorageDiskConfig = {
  driver: StorageDiskDriver;
  root: string;
  visibility: StorageVisibility;
  url?: string;
};

export type StorageConfig = {
  default: string;
  upload: {
    maxFileSize: number;
    avatar: {
      mimeTypes: string[];
      extensions: string[];
    };
  };
  disks: Record<string, StorageDiskConfig>;
};

const storageRoot = path.resolve(process.cwd(), "storage", "app");

export const storageConfig: StorageConfig = {
  default: process.env.STORAGE_DISK || "local",
  upload: {
    maxFileSize: Number(process.env.UPLOAD_MAX_FILE_SIZE || 2 * 1024 * 1024),
    avatar: {
      mimeTypes: ["image/jpeg", "image/png"],
      extensions: ["jpeg", "jpg", "png"],
    },
  },
  disks: {
    local: {
      driver: "local",
      root: process.env.STORAGE_LOCAL_ROOT || path.join(storageRoot, "private"),
      visibility: "private",
    },
    public: {
      driver: "local",
      root: process.env.STORAGE_PUBLIC_ROOT || path.join(storageRoot, "public"),
      visibility: "public",
      url: process.env.STORAGE_PUBLIC_URL || "/storage",
    },
  },
};
