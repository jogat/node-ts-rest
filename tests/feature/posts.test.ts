import request from "supertest";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { Server } from "../../src/app/Server";
import { closeDatabaseConnection, db } from "../../src/database/connection";
import { PersonalAccessToken } from "../../src/models/PersonalAccessToken";
import { User } from "../../src/models/User";
import { hashToken } from "../../src/support/hashToken";

const app = new Server().getExpressApp();
const plainToken = "test-token";
const authHeader = `Bearer ${plainToken}`;
let authenticatedUserId: number;

describe("Post API routes", () => {
  beforeAll(async () => {
    await db.migrate.latest();
  });

  beforeEach(async () => {
    await db("posts").del();
    await db("slugs").del();
    await db("personal_access_tokens").del();
    await db("users").del();
    const user = await User.create({
      name: "Test User",
      email: "user@example.com",
      password: "hashed-password",
    });
    authenticatedUserId = user.id;

    await PersonalAccessToken.create({
      user_id: user.id,
      name: "Feature Test",
      token_hash: hashToken(plainToken),
    });
  });

  afterAll(async () => {
    await closeDatabaseConnection();
  });

  it("returns an empty post collection", async () => {
    const response = await request(app).get("/v1/posts").set("Authorization", authHeader);

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

  it("requires authentication for post routes", async () => {
    const response = await request(app).get("/v1/posts");

    expect(response.status).toBe(401);
    expect(response.body).toEqual({
      message: "Unauthenticated.",
      status: 401,
    });
  });

  it("rejects invalid bearer tokens", async () => {
    const response = await request(app).get("/v1/posts").set("Authorization", "Bearer invalid-token");

    expect(response.status).toBe(401);
    expect(response.body).toEqual({
      message: "Unauthenticated.",
      status: 401,
    });
  });

  it("rejects revoked bearer tokens", async () => {
    const token = await PersonalAccessToken.findByTokenHash(hashToken(plainToken));

    await PersonalAccessToken.revoke(token!.id);

    const response = await request(app).get("/v1/posts").set("Authorization", authHeader);

    expect(response.status).toBe(401);
    expect(response.body).toEqual({
      message: "Unauthenticated.",
      status: 401,
    });
  });

  it("rejects expired bearer tokens", async () => {
    await db("personal_access_tokens").where({ token_hash: hashToken(plainToken) }).update({
      expires_at: "2000-01-01 00:00:00",
    });

    const response = await request(app).get("/v1/posts").set("Authorization", authHeader);

    expect(response.status).toBe(401);
    expect(response.body).toEqual({
      message: "Unauthenticated.",
      status: 401,
    });
  });

  it("updates token last_used_at after successful authentication", async () => {
    const response = await request(app).get("/v1/posts").set("Authorization", authHeader);
    const token = await PersonalAccessToken.findByTokenHash(hashToken(plainToken));

    expect(response.status).toBe(200);
    expect(token?.last_used_at).toBeTruthy();
  });

  it("returns a paginated post collection", async () => {
    await request(app).post("/v1/posts").set("Authorization", authHeader).send({
      title: "First",
      body: "First body",
    });
    await request(app).post("/v1/posts").set("Authorization", authHeader).send({
      title: "Second",
      body: "Second body",
    });
    await request(app).post("/v1/posts").set("Authorization", authHeader).send({
      title: "Third",
      body: "Third body",
    });

    const response = await request(app).get("/v1/posts?page=2&per_page=2").set("Authorization", authHeader);

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
    const response = await request(app).get("/v1/posts?page=0&per_page=101").set("Authorization", authHeader);

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
    const response = await request(app).post("/v1/posts").set("Authorization", authHeader).send({
      title: "Hello World",
      body: "First post body",
      published: true,
    });

    expect(response.status).toBe(201);
    expect(response.body).toMatchObject({
      message: "Post created.",
      data: {
        user_id: authenticatedUserId,
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

  it("generates a unique slug when creating posts with the same title", async () => {
    const firstResponse = await request(app).post("/v1/posts").set("Authorization", authHeader).send({
      title: "Duplicate Title",
      body: "Original body",
    });

    const secondResponse = await request(app).post("/v1/posts").set("Authorization", authHeader).send({
      title: "Duplicate Title",
      body: "Duplicate body",
    });

    expect(firstResponse.status).toBe(201);
    expect(secondResponse.status).toBe(201);
    expect(firstResponse.body.data.slug).toBe("duplicate-title");
    expect(secondResponse.body.data.slug).toBe("duplicate-title-1");
  });

  it("returns a post by id", async () => {
    const createResponse = await request(app).post("/v1/posts").set("Authorization", authHeader).send({
      title: "Find Me",
      body: "Post lookup body",
    });

    const response = await request(app).get(`/v1/posts/${createResponse.body.data.id}`).set("Authorization", authHeader);

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      data: {
        id: createResponse.body.data.id,
        user_id: authenticatedUserId,
        title: "Find Me",
        body: "Post lookup body",
        slug: "find-me",
        published: false,
      },
    });
  });

  it("returns a post by slug", async () => {
    const createResponse = await request(app).post("/v1/posts").set("Authorization", authHeader).send({
      title: "Slug Lookup",
      body: "Post lookup body",
    });

    const response = await request(app).get(`/v1/posts/slug/${createResponse.body.data.slug}`).set("Authorization", authHeader);

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      data: {
        id: createResponse.body.data.id,
        user_id: authenticatedUserId,
        title: "Slug Lookup",
        body: "Post lookup body",
        slug: createResponse.body.data.slug,
        published: false,
      },
    });
  });

  it("returns validation errors for invalid post data", async () => {
    const response = await request(app).post("/v1/posts").set("Authorization", authHeader).send({
      title: "",
      body: "",
    });

    expect(response.status).toBe(422);
    expect(response.body).toEqual({
      message: "The given data was invalid.",
      status: 422,
      errors: {
        title: ["Title is required"],
        body: ["Body is required"],
      },
    });
  });

  it("updates a post", async () => {
    const createResponse = await request(app).post("/v1/posts").set("Authorization", authHeader).send({
      title: "Original Title",
      body: "Original body",
    });

    const response = await request(app)
      .patch(`/v1/posts/${createResponse.body.data.id}`)
      .set("Authorization", authHeader)
      .send({
        title: "Updated Title",
        published: true,
      });

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      message: "Post updated.",
      data: {
        id: createResponse.body.data.id,
        user_id: authenticatedUserId,
        title: "Updated Title",
        body: "Original body",
        slug: "original-title",
        published: true,
      },
    });
    expect(response.body.data.updated_at).toEqual(expect.any(String));
  });

  it("requires at least one field when updating a post", async () => {
    const createResponse = await request(app).post("/v1/posts").set("Authorization", authHeader).send({
      title: "Needs Changes",
      body: "Body",
    });

    const response = await request(app).patch(`/v1/posts/${createResponse.body.data.id}`).set("Authorization", authHeader).send({});

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
    const createResponse = await request(app).post("/v1/posts").set("Authorization", authHeader).send({
      title: "Invalid Update",
      body: "Body",
    });

    const response = await request(app).patch(`/v1/posts/${createResponse.body.data.id}`).set("Authorization", authHeader).send({
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
    const response = await request(app).patch("/v1/posts/999999").set("Authorization", authHeader).send({
      title: "Missing",
    });

    expect(response.status).toBe(404);
    expect(response.body).toEqual({
      message: "Post not found",
      status: 404,
    });
  });

  it("returns a JSON 403 response when updating another user's post", async () => {
    const otherUser = await User.create({
      name: "Other User",
      email: "other@example.com",
      password: "hashed-password",
    });
    const [postId] = await db("posts").insert({
      user_id: otherUser.id,
      title: "Other Post",
      body: "Other body",
      slug: "other-post",
    });

    const response = await request(app).patch(`/v1/posts/${postId}`).set("Authorization", authHeader).send({
      title: "Not Allowed",
    });

    expect(response.status).toBe(403);
    expect(response.body).toEqual({
      message: "This action is unauthorized.",
      status: 403,
    });
  });

  it("returns a JSON 404 response when updating an invalid post route param", async () => {
    const response = await request(app).patch("/v1/posts/not-a-number").set("Authorization", authHeader).send({
      title: "Missing",
    });

    expect(response.status).toBe(404);
    expect(response.body).toEqual({
      message: "Post not found",
      status: 404,
    });
  });

  it("deletes a post", async () => {
    const createResponse = await request(app).post("/v1/posts").set("Authorization", authHeader).send({
      title: "Delete Me",
      body: "Delete body",
    });

    const deleteResponse = await request(app).delete(`/v1/posts/${createResponse.body.data.id}`).set("Authorization", authHeader);
    const showResponse = await request(app).get(`/v1/posts/${createResponse.body.data.id}`).set("Authorization", authHeader);

    expect(deleteResponse.status).toBe(204);
    expect(deleteResponse.text).toBe("");
    expect(showResponse.status).toBe(404);
  });

  it("returns a JSON 404 response when deleting a missing post", async () => {
    const response = await request(app).delete("/v1/posts/999999").set("Authorization", authHeader);

    expect(response.status).toBe(404);
    expect(response.body).toEqual({
      message: "Post not found",
      status: 404,
    });
  });

  it("returns a JSON 403 response when deleting another user's post", async () => {
    const otherUser = await User.create({
      name: "Delete Other User",
      email: "delete-other@example.com",
      password: "hashed-password",
    });
    const [postId] = await db("posts").insert({
      user_id: otherUser.id,
      title: "Delete Other Post",
      body: "Other body",
      slug: "delete-other-post",
    });

    const response = await request(app).delete(`/v1/posts/${postId}`).set("Authorization", authHeader);

    expect(response.status).toBe(403);
    expect(response.body).toEqual({
      message: "This action is unauthorized.",
      status: 403,
    });
  });

  it("returns a JSON 404 response when a post is missing", async () => {
    const response = await request(app).get("/v1/posts/999999").set("Authorization", authHeader);

    expect(response.status).toBe(404);
    expect(response.body).toEqual({
      message: "Post not found",
      status: 404,
    });
  });

  it("returns a JSON 404 response when a post route param is invalid", async () => {
    const response = await request(app).get("/v1/posts/not-a-number").set("Authorization", authHeader);

    expect(response.status).toBe(404);
    expect(response.body).toEqual({
      message: "Post not found",
      status: 404,
    });
  });
});
