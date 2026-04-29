import request from "supertest";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { Server } from "../../src/app/Server";
import { closeDatabaseConnection, db } from "../../src/database/connection";
import { PersonalAccessToken } from "../../src/models/PersonalAccessToken";
import { User } from "../../src/models/User";
import { hashPassword } from "../../src/support/password";
import { hashToken } from "../../src/support/hashToken";

const app = new Server().getExpressApp();

describe("Auth API routes", () => {
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

  it("registers a user and returns a bearer token", async () => {
    const response = await request(app).post("/v1/auth/register").send({
      name: "Josue",
      email: "josue@example.com",
      password: "password123",
      token_name: "Web",
    });

    expect(response.status).toBe(201);
    expect(response.body.data.user).toMatchObject({
      name: "Josue",
      email: "josue@example.com",
    });
    expect(response.body.data.user.password).toBeUndefined();
    expect(response.body.data.token).toEqual(expect.any(String));
    expect(response.body.data.token_type).toBe("Bearer");

    const storedToken = await PersonalAccessToken.findByTokenHash(hashToken(response.body.data.token));

    expect(storedToken).toMatchObject({
      name: "Web",
      token_hash: hashToken(response.body.data.token),
    });
  });

  it("returns validation errors when registering invalid data", async () => {
    const response = await request(app).post("/v1/auth/register").send({
      name: "",
      email: "not-an-email",
      password: "short",
    });

    expect(response.status).toBe(422);
    expect(response.body).toEqual({
      message: "The given data was invalid.",
      status: 422,
      errors: {
        name: ["Name is required"],
        email: ["Email must be a valid email address"],
        password: ["Password must be at least 8 characters"],
      },
    });
  });

  it("logs in a user and returns a bearer token", async () => {
    await User.create({
      name: "Login User",
      email: "login@example.com",
      password: await hashPassword("password123"),
    });

    const response = await request(app).post("/v1/auth/login").send({
      email: "login@example.com",
      password: "password123",
      token_name: "Chrome",
    });

    expect(response.status).toBe(200);
    expect(response.body.data.user).toMatchObject({
      name: "Login User",
      email: "login@example.com",
    });
    expect(response.body.data.token).toEqual(expect.any(String));
    expect(response.body.data.token_type).toBe("Bearer");

    const storedToken = await PersonalAccessToken.findByTokenHash(hashToken(response.body.data.token));

    expect(storedToken).toMatchObject({
      name: "Chrome",
    });
  });

  it("rejects invalid login credentials", async () => {
    await User.create({
      name: "Login User",
      email: "login@example.com",
      password: await hashPassword("password123"),
    });

    const response = await request(app).post("/v1/auth/login").send({
      email: "login@example.com",
      password: "wrong-password",
    });

    expect(response.status).toBe(401);
    expect(response.body).toEqual({
      message: "Invalid credentials.",
      status: 401,
    });
  });

  it("returns the authenticated user", async () => {
    const registerResponse = await request(app).post("/v1/auth/register").send({
      name: "Current User",
      email: "current@example.com",
      password: "password123",
    });

    const response = await request(app).get("/v1/auth/me").set("Authorization", `Bearer ${registerResponse.body.data.token}`);

    expect(response.status).toBe(200);
    expect(response.body.data).toMatchObject({
      name: "Current User",
      email: "current@example.com",
    });
    expect(response.body.data.password).toBeUndefined();
  });

  it("logs out by revoking the current token", async () => {
    const registerResponse = await request(app).post("/v1/auth/register").send({
      name: "Logout User",
      email: "logout@example.com",
      password: "password123",
    });
    const token = registerResponse.body.data.token;

    const logoutResponse = await request(app).post("/v1/auth/logout").set("Authorization", `Bearer ${token}`);
    const meResponse = await request(app).get("/v1/auth/me").set("Authorization", `Bearer ${token}`);
    const storedToken = await PersonalAccessToken.findByTokenHash(hashToken(token));

    expect(logoutResponse.status).toBe(204);
    expect(storedToken?.revoked_at).toBeTruthy();
    expect(meResponse.status).toBe(401);
  });
});
