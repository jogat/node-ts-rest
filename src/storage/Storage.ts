import { config } from "@config/index";
import { StorageManager } from "@storage/StorageManager";

export const Storage = new StorageManager(config.storage);
