import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { AuthService } from "@services/AuthService";
import { closeDatabaseConnection, db } from "@database/connection";
import { PersonalAccessToken } from "@models/PersonalAccessToken";
import { User } from "@models/User";
import { hashPassword } from "@support/password";
import { hashToken } from "@support/hashToken";
import type { RegisterRequestData, LoginRequestData } from "@http/requests";

const authService = new AuthService();

describe("AuthService", () => {
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

  it("registers a user and stores a hashed token", async () => {
    const data: RegisterRequestData = {
      name: "Service User",
      email: "service@example.com",
      password: "password123",
      token_name: "Service Token",
    };

    const result = await authService.register(data);

    expect(result.user).toMatchObject({
      name: "Service User",
      email: "service@example.com",
    });
    expect(result.token).toEqual(expect.any(String));
    expect(result.token_type).toBe("Bearer");

    const storedToken = await PersonalAccessToken.findByTokenHash(hashToken(result.token));

    expect(storedToken).toMatchObject({
      name: "Service Token",
      token_hash: hashToken(result.token),
    });
  });

  it("logs in with valid credentials and returns a bearer token", async () => {
    await User.create({
      name: "Login Service",
      email: "login-service@example.com",
      password: await hashPassword("password123"),
    });

    const data: LoginRequestData = {
      email: "login-service@example.com",
      password: "password123",
      token_name: "Login Token",
    };

    const result = await authService.login(data);

    expect(result.user).toMatchObject({
      email: "login-service@example.com",
    });
    expect(result.token).toEqual(expect.any(String));
    expect(result.token_type).toBe("Bearer");

    const storedToken = await PersonalAccessToken.findByTokenHash(hashToken(result.token));
    expect(storedToken).toMatchObject({
      name: "Login Token",
    });
  });

  it("revokes the current access token on logout", async () => {
    const user = await User.create({
      name: "Logout Service",
      email: "logout-service@example.com",
      password: await hashPassword("password123"),
    });

    const token = await PersonalAccessToken.create({
      user_id: user.id,
      name: "Revoke Token",
      token_hash: hashToken("plain-token"),
    });

    await authService.logout(token);

    const revokedToken = await PersonalAccessToken.find(token.id);
    expect(revokedToken?.revoked_at).toBeTruthy();
  });
});
