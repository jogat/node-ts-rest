import { ConflictException } from "@exceptions/ConflictException";
import { HttpException } from "@exceptions/HttpException";

type DatabaseError = Error & {
  code?: string;
  errno?: number;
  sqlMessage?: string;
};

const uniqueMessages: Record<string, string> = {
  "users.email": "The email has already been taken.",
  "posts.slug": "The slug has already been taken.",
  "slugs.slug": "The slug has already been taken.",
  "personal_access_tokens.token_hash": "The token has already been taken.",
};

export class DatabaseExceptionMapper {
  map(error: unknown): HttpException | undefined {
    if (!isDatabaseError(error)) {
      return undefined;
    }

    const key = this.uniqueConstraintKey(error);

    if (!key) {
      return undefined;
    }

    return new ConflictException(uniqueMessages[key]);
  }

  private uniqueConstraintKey(error: DatabaseError): string | undefined {
    const message = error.message || error.sqlMessage || "";

    if (this.isDuplicateError(error)) {
      if (message.includes("users.email") || message.includes("users_email_unique") || message.includes("'email'")) {
        return "users.email";
      }

      if (message.includes("posts.slug") || message.includes("posts_slug_unique") || message.includes("'slug'")) {
        return "posts.slug";
      }

      if (message.includes("slugs.slug") || message.includes("slugs_slug_unique")) {
        return "slugs.slug";
      }

      if (
        message.includes("personal_access_tokens.token_hash") ||
        message.includes("personal_access_tokens_token_hash_unique") ||
        message.includes("'token_hash'")
      ) {
        return "personal_access_tokens.token_hash";
      }
    }

    return undefined;
  }

  private isDuplicateError(error: DatabaseError): boolean {
    return error.code === "ER_DUP_ENTRY" || error.errno === 1062 || error.code === "SQLITE_CONSTRAINT" || error.code === "SQLITE_CONSTRAINT_UNIQUE";
  }
}

function isDatabaseError(error: unknown): error is DatabaseError {
  return error instanceof Error;
}
