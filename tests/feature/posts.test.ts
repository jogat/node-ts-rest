import request from "supertest";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { Server } from "../../src/app/Server";
import { closeDatabaseConnection, db } from "../../src/database/connection";

const app = new Server().getExpressApp();

describe("Post API routes", () => {
  beforeAll(async () => {
    await db.migrate.latest();
  });

  beforeEach(async () => {
    await db("posts").del();
  });

  afterAll(async () => {
    await closeDatabaseConnection();
  });

  it("returns an empty post collection", async () => {
    const response = await request(app).get("/ws/v1/posts");

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      data: [],
    });
  });

  it("creates a post", async () => {
    const response = await request(app).post("/ws/v1/posts").send({
      title: "Hello World",
      body: "First post body",
      slug: "hello-world",
      published: true,
    });

    expect(response.status).toBe(201);
    expect(response.body).toMatchObject({
      message: "Post created.",
      data: {
        title: "Hello World",
        body: "First post body",
        slug: "hello-world",
        published: true,
      },
    });
    expect(response.body.data.id).toEqual(expect.any(Number));
    expect(response.body.data.created_at).toEqual(expect.any(String));
    expect(response.body.data.updated_at).toBeNull();
  });

  it("returns a post by id", async () => {
    const createResponse = await request(app).post("/ws/v1/posts").send({
      title: "Find Me",
      body: "Post lookup body",
      slug: "find-me",
    });

    const response = await request(app).get(`/ws/v1/posts/${createResponse.body.data.id}`);

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      data: {
        id: createResponse.body.data.id,
        title: "Find Me",
        body: "Post lookup body",
        slug: "find-me",
        published: false,
      },
    });
  });

  it("returns validation errors for invalid post data", async () => {
    const response = await request(app).post("/ws/v1/posts").send({
      title: "",
      body: "",
      slug: "",
    });

    expect(response.status).toBe(422);
    expect(response.body).toEqual({
      message: "The given data was invalid.",
      status: 422,
      errors: {
        title: ["Title is required"],
        body: ["Body is required"],
        slug: ["Slug is required"],
      },
    });
  });

  it("returns a JSON 404 response when a post is missing", async () => {
    const response = await request(app).get("/ws/v1/posts/999999");

    expect(response.status).toBe(404);
    expect(response.body).toEqual({
      message: "Post not found",
      status: 404,
    });
  });
});
