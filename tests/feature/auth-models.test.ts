import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { closeDatabaseConnection, db } from "../../src/database/connection";
import { PersonalAccessToken } from "../../src/models/PersonalAccessToken";
import { User } from "../../src/models/User";

describe("Auth model schema", () => {
  beforeAll(async () => {
    await db.migrate.latest();
  });

  beforeEach(async () => {
    await db("personal_access_tokens").del();
    await db("users").del();
  });

  afterAll(async () => {
    await closeDatabaseConnection();
  });

  it("creates and finds users", async () => {
    const user = await User.create({
      name: "Josue",
      email: "josue@example.com",
      password: "hashed-password",
    });

    const foundUser = await User.findByEmail("josue@example.com");

    expect(user.id).toEqual(expect.any(Number));
    expect(foundUser).toMatchObject({
      id: user.id,
      name: "Josue",
      email: "josue@example.com",
      password: "hashed-password",
    });
  });

  it("creates tokens for users", async () => {
    const user = await User.create({
      name: "Mobile User",
      email: "mobile@example.com",
      password: "hashed-password",
    });

    const token = await PersonalAccessToken.create({
      user_id: user.id,
      name: "iPhone",
      token_hash: "hashed-token",
      abilities: JSON.stringify(["*"]),
    });

    const foundToken = await PersonalAccessToken.findByTokenHash("hashed-token");
    const tokens = await User.tokens(user.id);
    const tokenUser = await PersonalAccessToken.user(token);

    expect(foundToken).toMatchObject({
      id: token.id,
      user_id: user.id,
      name: "iPhone",
      token_hash: "hashed-token",
      abilities: JSON.stringify(["*"]),
    });
    expect(tokens).toHaveLength(1);
    expect(tokens[0]).toMatchObject({ id: token.id });
    expect(tokenUser).toMatchObject({ id: user.id, email: "mobile@example.com" });
  });

  it("marks tokens as used and revoked", async () => {
    const user = await User.create({
      name: "Web User",
      email: "web@example.com",
      password: "hashed-password",
    });
    const token = await PersonalAccessToken.create({
      user_id: user.id,
      name: "Web Chrome",
      token_hash: "web-token-hash",
    });

    await PersonalAccessToken.markUsed(token.id);
    await PersonalAccessToken.revoke(token.id);

    const updatedToken = await PersonalAccessToken.find(token.id);

    expect(updatedToken?.last_used_at).toBeTruthy();
    expect(updatedToken?.revoked_at).toBeTruthy();
  });
});
