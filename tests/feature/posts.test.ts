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
    const response = await request(app).get("/v1/posts");

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      data: [],
      meta: {
        current_page: 1,
        per_page: 15,
        total: 0,
        last_page: 1,
        from: null,
        to: null,
      },
    });
  });

  it("returns a paginated post collection", async () => {
    await request(app).post("/v1/posts").send({
      title: "First",
      body: "First body",
      slug: "first",
    });
    await request(app).post("/v1/posts").send({
      title: "Second",
      body: "Second body",
      slug: "second",
    });
    await request(app).post("/v1/posts").send({
      title: "Third",
      body: "Third body",
      slug: "third",
    });

    const response = await request(app).get("/v1/posts?page=2&per_page=2");

    expect(response.status).toBe(200);
    expect(response.body.data).toHaveLength(1);
    expect(response.body.meta).toEqual({
      current_page: 2,
      per_page: 2,
      total: 3,
      last_page: 2,
      from: 3,
      to: 3,
    });
  });

  it("returns validation errors for invalid pagination data", async () => {
    const response = await request(app).get("/v1/posts?page=0&per_page=101");

    expect(response.status).toBe(422);
    expect(response.body).toEqual({
      message: "The given data was invalid.",
      status: 422,
      errors: {
        "query.page": ["Page must be at least 1"],
        "query.per_page": ["Per page may not be greater than 100"],
      },
    });
  });

  it("creates a post", async () => {
    const response = await request(app).post("/v1/posts").send({
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
    const createResponse = await request(app).post("/v1/posts").send({
      title: "Find Me",
      body: "Post lookup body",
      slug: "find-me",
    });

    const response = await request(app).get(`/v1/posts/${createResponse.body.data.id}`);

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
    const response = await request(app).post("/v1/posts").send({
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

  it("updates a post", async () => {
    const createResponse = await request(app).post("/v1/posts").send({
      title: "Original Title",
      body: "Original body",
      slug: "original-title",
    });

    const response = await request(app).patch(`/v1/posts/${createResponse.body.data.id}`).send({
      title: "Updated Title",
      published: true,
    });

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      message: "Post updated.",
      data: {
        id: createResponse.body.data.id,
        title: "Updated Title",
        body: "Original body",
        slug: "original-title",
        published: true,
      },
    });
    expect(response.body.data.updated_at).toEqual(expect.any(String));
  });

  it("requires at least one field when updating a post", async () => {
    const createResponse = await request(app).post("/v1/posts").send({
      title: "Needs Changes",
      body: "Body",
      slug: "needs-changes",
    });

    const response = await request(app).patch(`/v1/posts/${createResponse.body.data.id}`).send({});

    expect(response.status).toBe(422);
    expect(response.body).toEqual({
      message: "The given data was invalid.",
      status: 422,
      errors: {
        body: ["At least one field is required"],
      },
    });
  });

  it("returns validation errors for invalid update data", async () => {
    const createResponse = await request(app).post("/v1/posts").send({
      title: "Invalid Update",
      body: "Body",
      slug: "invalid-update",
    });

    const response = await request(app).patch(`/v1/posts/${createResponse.body.data.id}`).send({
      title: "",
    });

    expect(response.status).toBe(422);
    expect(response.body).toEqual({
      message: "The given data was invalid.",
      status: 422,
      errors: {
        title: ["Title is required"],
      },
    });
  });

  it("returns a JSON 404 response when updating a missing post", async () => {
    const response = await request(app).patch("/v1/posts/999999").send({
      title: "Missing",
    });

    expect(response.status).toBe(404);
    expect(response.body).toEqual({
      message: "Post not found",
      status: 404,
    });
  });

  it("deletes a post", async () => {
    const createResponse = await request(app).post("/v1/posts").send({
      title: "Delete Me",
      body: "Delete body",
      slug: "delete-me",
    });

    const deleteResponse = await request(app).delete(`/v1/posts/${createResponse.body.data.id}`);
    const showResponse = await request(app).get(`/v1/posts/${createResponse.body.data.id}`);

    expect(deleteResponse.status).toBe(204);
    expect(deleteResponse.text).toBe("");
    expect(showResponse.status).toBe(404);
  });

  it("returns a JSON 404 response when deleting a missing post", async () => {
    const response = await request(app).delete("/v1/posts/999999");

    expect(response.status).toBe(404);
    expect(response.body).toEqual({
      message: "Post not found",
      status: 404,
    });
  });

  it("returns a JSON 404 response when a post is missing", async () => {
    const response = await request(app).get("/v1/posts/999999");

    expect(response.status).toBe(404);
    expect(response.body).toEqual({
      message: "Post not found",
      status: 404,
    });
  });
});
