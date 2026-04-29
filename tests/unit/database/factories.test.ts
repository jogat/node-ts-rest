import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { accessTokenFactory, postFactory, userFactory } from "@database/factories";
import { closeDatabaseConnection, db } from "@database/connection";
import { PersonalAccessToken } from "@models/PersonalAccessToken";
import { Post } from "@models/Post";
import { User } from "@models/User";
import { hashToken } from "@support/hashToken";
import { verifyPassword } from "@support/password";

describe("database factories", () => {
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

  it("builds user attributes with overrides", () => {
    const user = userFactory.build({
      email: "factory@example.com",
    });

    expect(user).toMatchObject({
      email: "factory@example.com",
      password: "password123",
    });
    expect(user.name).toEqual(expect.any(String));
  });

  it("creates a user with a hashed default password", async () => {
    const user = await userFactory.create({
      email: "created@example.com",
    });

    expect(user).toMatchObject({
      email: "created@example.com",
    });
    expect(user.password).not.toBe("password123");
    expect(await verifyPassword("password123", user.password)).toBe(true);
  });

  it("creates a post for an existing user", async () => {
    const user = await userFactory.create();
    const post = await postFactory.create(
      {
        title: "Factory Post",
        slug: "factory-post",
      },
      {
        user,
      }
    );

    expect(post).toMatchObject({
      user_id: user.id,
      title: "Factory Post",
      slug: "factory-post",
    });
  });

  it("creates a post owner when no user is supplied", async () => {
    const post = await postFactory.create();
    const owner = await User.find(Number(post.user_id));

    expect(owner).toBeTruthy();
    expect(post.user_id).toEqual(expect.any(Number));
  });

  it("creates access tokens and exposes the plain token", async () => {
    const user = await userFactory.create();
    const result = await accessTokenFactory.create(
      {
        name: "Factory Token",
      },
      {
        user,
        plainTextToken: "plain-factory-token",
      }
    );

    const token = await PersonalAccessToken.findByTokenHash(hashToken(result.plainTextToken));

    expect(result.plainTextToken).toBe("plain-factory-token");
    expect(result.token).toMatchObject({
      user_id: user.id,
      name: "Factory Token",
      token_hash: hashToken("plain-factory-token"),
    });
    expect(token?.id).toBe(result.token.id);
  });
});
