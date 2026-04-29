import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { PostService } from "@services/PostService";
import { closeDatabaseConnection, db } from "@database/connection";
import { EventDispatcher, PostCreated, PostUpdated } from "@events";
import { Post } from "@models/Post";
import { User } from "@models/User";
import { hashPassword } from "@support/password";

const postService = new PostService();

describe("PostService", () => {
  beforeAll(async () => {
    await db.migrate.latest();
  });

  beforeEach(async () => {
    await db("posts").del();
    await db("personal_access_tokens").del();
    await db("users").del();
  });

  afterAll(async () => {
    await closeDatabaseConnection();
  });

  it("creates a post for the authenticated user", async () => {
    const user = await User.create({
      name: "Post User",
      email: "post-user@example.com",
      password: await hashPassword("password123"),
    });

    const post = await postService.create(user, {
      title: "Service Post",
      body: "Post body content.",
      slug: "service-post",
      published: true,
    });

    expect(post).toMatchObject({
      user_id: user.id,
      title: "Service Post",
      slug: "service-post",
      published: 1,
    });
  });

  it("dispatches a post created event after creation", async () => {
    const events = new EventDispatcher();
    const handled: PostCreated[] = [];
    const service = new PostService(events);
    const user = await User.create({
      name: "Post Event User",
      email: "post-event-user@example.com",
      password: await hashPassword("password123"),
    });

    events.listen(PostCreated, (event) => {
      handled.push(event);
    });

    await service.create(user, {
      title: "Event Post",
      body: "Event body.",
      slug: "event-post",
    });

    expect(handled).toHaveLength(1);
    expect(handled[0].post).toMatchObject({
      title: "Event Post",
      slug: "event-post",
    });
    expect(handled[0].user.id).toBe(user.id);
  });

  it("lists posts with pagination metadata", async () => {
    const user = await User.create({
      name: "List User",
      email: "list-user@example.com",
      password: await hashPassword("password123"),
    });

    await Promise.all([
      postService.create(user, { title: "Post A", body: "A body.", slug: "post-a" }),
      postService.create(user, { title: "Post B", body: "B body.", slug: "post-b" }),
    ]);

    const result = await postService.list({ page: 1, per_page: 10 });

    expect(result.meta).toMatchObject({
      current_page: 1,
      per_page: 10,
      total: 2,
      last_page: 1,
    });
    expect(result.data).toHaveLength(2);
  });

  it("updates an existing post", async () => {
    const user = await User.create({
      name: "Update User",
      email: "update-user@example.com",
      password: await hashPassword("password123"),
    });

    const post = await postService.create(user, {
      title: "Old Title",
      body: "Old body.",
      slug: "old-title",
    });

    const updated = await postService.update(post, {
      title: "Updated Title",
      body: "Updated body.",
    });

    expect(updated).toMatchObject({
      id: post.id,
      title: "Updated Title",
      body: "Updated body.",
      slug: "old-title",
    });
  });

  it("dispatches a post updated event after update", async () => {
    const events = new EventDispatcher();
    const handled: PostUpdated[] = [];
    const service = new PostService(events);
    const user = await User.create({
      name: "Update Event User",
      email: "update-event-user@example.com",
      password: await hashPassword("password123"),
    });
    const post = await service.create(user, {
      title: "Before Event",
      body: "Before body.",
      slug: "before-event",
    });

    events.listen(PostUpdated, (event) => {
      handled.push(event);
    });

    await service.update(post, {
      title: "After Event",
    });

    expect(handled).toHaveLength(1);
    expect(handled[0].previousPost.title).toBe("Before Event");
    expect(handled[0].post.title).toBe("After Event");
    expect(handled[0].changes).toEqual({
      title: "After Event",
    });
  });

  it("deletes a post", async () => {
    const user = await User.create({
      name: "Delete User",
      email: "delete-user@example.com",
      password: await hashPassword("password123"),
    });

    const post = await postService.create(user, {
      title: "Delete Me",
      body: "Body content.",
      slug: "delete-me",
    });

    await postService.delete(post);

    const found = await Post.find(post.id);
    expect(found).toBeUndefined();
  });
});
