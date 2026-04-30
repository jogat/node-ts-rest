import { Command } from "@commander-js/extra-typings";
import { closeConsoleDatabase } from "@console/support";
import { ConflictException } from "@exceptions/ConflictException";
import { DatabaseExceptionMapper } from "@exceptions/DatabaseExceptionMapper";
import { User, UserRow } from "@models/User";
import { hashPassword } from "@support/password";
import { createInterface } from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";
import { z } from "zod";

const userCreateSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(255, "Name may not be greater than 255 characters"),
  email: z.string().trim().email("Email must be a valid email address").max(255, "Email may not be greater than 255 characters"),
  password: z.string().min(8, "Password must be at least 8 characters").max(255, "Password may not be greater than 255 characters"),
});

export type UserCreateInput = z.infer<typeof userCreateSchema>;

export type UserPromptSession = {
  question(prompt: string): Promise<string>;
  close(): void;
};

function createPromptSession(): UserPromptSession {
  const rl = createInterface({
    input,
    output,
  });

  return {
    question: (prompt: string) => rl.question(prompt),
    close: () => rl.close(),
  };
}

async function collectField(session: UserPromptSession, label: string, provided?: string): Promise<string> {
  if (provided && provided.trim().length > 0) {
    return provided.trim();
  }

  return (await session.question(`${label}: `)).trim();
}

function formatValidationError(messages: string[]): Error {
  return new Error(messages.join(" "));
}

export async function collectUserCreateInput(session: UserPromptSession, input: Partial<UserCreateInput> = {}): Promise<UserCreateInput> {
  const name = await collectField(session, "Name", input.name);
  const email = await collectField(session, "Email", input.email);
  const password = await collectField(session, "Password", input.password);
  const confirmation = await session.question("Confirm password: ");

  if (password !== confirmation.trim()) {
    throw new Error("Password confirmation does not match.");
  }

  const parsed = userCreateSchema.safeParse({ name, email, password });

  if (!parsed.success) {
    throw formatValidationError(parsed.error.issues.map((issue) => issue.message));
  }

  return parsed.data;
}

export async function createLoginReadyUser(input: UserCreateInput): Promise<UserRow> {
  const existingUser = await User.findByEmail(input.email);

  if (existingUser) {
    throw new ConflictException("The email has already been taken.");
  }

  try {
    return await User.create({
      ...input,
      password: await hashPassword(input.password),
    });
  } catch (error) {
    const mapped = new DatabaseExceptionMapper().map(error);

    if (mapped) {
      throw mapped;
    }

    throw error;
  }
}

export async function runUserCreateCommand(input: Partial<UserCreateInput> = {}, session = createPromptSession()): Promise<UserRow> {
  try {
    const data = await collectUserCreateInput(session, input);
    const user = await createLoginReadyUser(data);

    console.log(`Created user ${user.email}. Use the password you entered to log in through /v1/auth/login.`);

    return user;
  } finally {
    session.close();
  }
}

export function registerUserCommand(program: Command): void {
  const user = program.command("user").description("User management commands");

  user
    .command("create")
    .description("Create a login-ready user")
    .argument("[name]", "User name")
    .argument("[email]", "User email")
    .argument("[password]", "User password")
    .action(async (name?: string, email?: string, password?: string) => {
      try {
        await runUserCreateCommand({ name, email, password });
      } finally {
        await closeConsoleDatabase();
      }
    });
}
