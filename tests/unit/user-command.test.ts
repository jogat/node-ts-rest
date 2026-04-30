import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { AuthService } from "@services/AuthService";
import { closeDatabaseConnection, db } from "@database/connection";
import { User } from "@models/User";
import { verifyPassword } from "@support/password";
import { runUserCreateCommand, type UserPromptSession } from "@console/commands/UserCommand";

function createPromptSession(confirmation: string): UserPromptSession {
  return {
    question: vi.fn(async (prompt: string) => {
      if (prompt === "Confirm password: ") {
        return confirmation;
      }

      throw new Error(`Unexpected prompt: ${prompt}`);
    }),
    close: vi.fn(),
  };
}

describe("User console command", () => {
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

  it("creates a hashed login-ready user from the create flow", async () => {
    const session = createPromptSession("password123");
    const consoleLog = vi.spyOn(console, "log").mockImplementation(() => undefined);

    const user = await runUserCreateCommand(
      {
        name: "Console User",
        email: "console-user@example.com",
        password: "password123",
      },
      session
    );

    const storedUser = await User.findByEmail("console-user@example.com");

    expect(user).toMatchObject({
      name: "Console User",
      email: "console-user@example.com",
    });
    expect(storedUser).toMatchObject({
      id: user.id,
      name: "Console User",
      email: "console-user@example.com",
    });
    expect(storedUser?.password).not.toBe("password123");
    await expect(verifyPassword("password123", storedUser?.password ?? "")).resolves.toBe(true);
    expect(consoleLog).toHaveBeenCalledWith(
      "Created user console-user@example.com. Use the password you entered to log in through /v1/auth/login."
    );

    consoleLog.mockRestore();
  });

  it("rejects duplicate email cleanly", async () => {
    const session = createPromptSession("password123");

    await runUserCreateCommand(
      {
        name: "First User",
        email: "duplicate@example.com",
        password: "password123",
      },
      session
    );

    await expect(
      runUserCreateCommand(
        {
          name: "Second User",
          email: "duplicate@example.com",
          password: "password123",
        },
        createPromptSession("password123")
      )
    ).rejects.toThrow("The email has already been taken.");
  });

  it("creates a user that can authenticate through AuthService.login", async () => {
    const authService = new AuthService();
    const session = createPromptSession("password123");

    await runUserCreateCommand(
      {
        name: "Auth Console User",
        email: "auth-console@example.com",
        password: "password123",
      },
      session
    );

    const result = await authService.login({
      email: "auth-console@example.com",
      password: "password123",
      token_name: "Console Token",
    });

    expect(result.user).toMatchObject({
      email: "auth-console@example.com",
    });
    expect(result.token).toEqual(expect.any(String));
    expect(result.token_type).toBe("Bearer");
  });
});
