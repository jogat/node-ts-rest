import { Request, Response } from "express";
import { Controller } from "@http/controllers/Controller";
import { Storage } from "@storage";

export class UploadController extends Controller {
  storeAvatar = async (req: Request, res: Response) => {
    const avatar = req.uploadedFile("avatar");

    if (!avatar) {
      throw new Error("Avatar upload was not validated.");
    }

    const path = await avatar.store("avatars", "public");

    return this.created(res, {
      path,
      url: Storage.disk("public").url(path),
    });
  };
}
