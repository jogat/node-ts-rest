import fs from "fs/promises";
import path from "path";
import request from "supertest";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { Server } from "../../src/app/Server";
import { accessTokenFactory, userFactory } from "../../src/database/factories";
import { closeDatabaseConnection, db } from "../../src/database/connection";
import { Storage } from "../../src/storage";

const app = new Server().getExpressApp();
const plainToken = "upload-token";
const authHeader = `Bearer ${plainToken}`;
const png = Buffer.from("89504e470d0a1a0a", "hex");

describe("Upload API routes", () => {
  beforeAll(async () => {
    await db.migrate.latest();
  });

  beforeEach(async () => {
    await db("personal_access_tokens").del();
    await db("users").del();
    await fs.rm("storage/app/public/avatars", { recursive: true, force: true });

    const user = await userFactory.create({
      name: "Upload User",
      email: "upload@example.com",
    });

    await accessTokenFactory.create({
      name: "Upload Feature Test",
    }, {
      user,
      plainTextToken: plainToken,
    });
  });

  afterAll(async () => {
    await fs.rm("storage/app/public/avatars", { recursive: true, force: true });
    await closeDatabaseConnection();
  });

  it("stores an authenticated avatar upload on the public disk", async () => {
    const response = await request(app)
      .post("/v1/uploads/avatar")
      .set("Authorization", authHeader)
      .attach("avatar", png, {
        filename: "avatar.png",
        contentType: "image/png",
      });

    expect(response.status).toBe(201);
    expect(response.body.data.path).toMatch(/^avatars\/.+\.png$/);
    expect(response.body.data.url).toBe(`/storage/${response.body.data.path}`);
    expect(await Storage.disk("public").exists(response.body.data.path)).toBe(true);
  });

  it("requires authentication", async () => {
    const response = await request(app)
      .post("/v1/uploads/avatar")
      .attach("avatar", png, {
        filename: "avatar.png",
        contentType: "image/png",
      });

    expect(response.status).toBe(401);
  });

  it("requires an avatar file", async () => {
    const response = await request(app).post("/v1/uploads/avatar").set("Authorization", authHeader);

    expect(response.status).toBe(422);
    expect(response.body).toEqual({
      message: "The given data was invalid.",
      status: 422,
      errors: {
        avatar: ["Avatar is required"],
      },
    });
  });

  it("rejects non-image avatar uploads", async () => {
    const response = await request(app)
      .post("/v1/uploads/avatar")
      .set("Authorization", authHeader)
      .attach("avatar", Buffer.from("hello"), {
        filename: "avatar.txt",
        contentType: "text/plain",
      });

    expect(response.status).toBe(422);
    expect(response.body.errors.avatar).toContain("Avatar must be an image");
    expect(response.body.errors.avatar).toContain("Avatar must be a file of type: jpeg, jpg, png");
  });

  it("rejects oversized avatar uploads", async () => {
    const response = await request(app)
      .post("/v1/uploads/avatar")
      .set("Authorization", authHeader)
      .attach("avatar", Buffer.alloc(2 * 1024 * 1024 + 1), {
        filename: "avatar.png",
        contentType: "image/png",
      });

    expect(response.status).toBe(422);
    expect(response.body.errors.avatar).toEqual(["Avatar may not be greater than 2048 kilobytes"]);
  });

  it("serves public disk files from /storage", async () => {
    await Storage.disk("public").put("avatars/public.txt", "public file");

    const response = await request(app).get(path.posix.join("/storage", "avatars", "public.txt"));

    expect(response.status).toBe(200);
    expect(response.text).toBe("public file");
  });
});
