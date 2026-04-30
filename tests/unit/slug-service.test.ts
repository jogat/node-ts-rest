import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { closeDatabaseConnection, db } from "@database/connection";
import { Post } from "@models/Post";
import { Slug } from "@models/Slug";
import { User } from "@models/User";
import { SlugService } from "@services/SlugService";
import { hashPassword } from "@support/password";

const slugService = new SlugService();

describe("SlugService", () => {
  beforeAll(async () => {
    await db.migrate.latest();
  });

  beforeEach(async () => {
    await db("posts").del();
    await db("slugs").del();
    await db("users").del();
  });

  afterAll(async () => {
    await closeDatabaseConnection();
  });

  it("generates a unique slug with a numeric suffix when needed", async () => {
    const user = await User.create({
      name: "Slug User",
      email: "slug-user@example.com",
      password: await hashPassword("password123"),
    });

    await Post.create({
      user_id: user.id,
      title: "Hello World",
      body: "Body",
      slug: "hello-world",
    });

    const slug = await slugService.generateSlug({
      components: ["Hello World"],
      fallback: "post",
    });

    expect(slug).toBe("hello-world-1");
  });

  it("persists a slug mapping for a model", async () => {
    const slug = await slugService.persistSlug({
      sluggable_model_id: 42,
      sluggable_model_class: "Post",
      slug: "custom-post",
    });

    const record = await Slug.findByModel("Post", 42);

    expect(slug).toBe("custom-post");
    expect(record).toMatchObject({
      sluggable_model_id: 42,
      sluggable_model_class: "Post",
      slug: "custom-post",
    });
  });
});
