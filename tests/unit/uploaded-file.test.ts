import fs from "fs/promises";
import { describe, expect, it } from "vitest";
import { UploadedFile } from "@http/requests";
import { Storage } from "@storage";

describe("UploadedFile", () => {
  it("stores uploaded files on a disk", async () => {
    const file = new UploadedFile({
      fieldname: "avatar",
      originalname: "avatar.png",
      encoding: "7bit",
      mimetype: "image/png",
      size: 4,
      buffer: Buffer.from("test"),
      destination: "",
      filename: "",
      path: "",
      stream: undefined as never,
    });

    const storedPath = await file.storeAs("test-uploads", "avatar.png", "public");

    expect(storedPath).toBe("test-uploads/avatar.png");
    expect(await Storage.disk("public").exists(storedPath)).toBe(true);
    expect((await Storage.disk("public").get(storedPath)).toString()).toBe("test");

    await Storage.disk("public").delete(storedPath);
    await fs.rm("storage/app/public/test-uploads", { recursive: true, force: true });
  });
});
