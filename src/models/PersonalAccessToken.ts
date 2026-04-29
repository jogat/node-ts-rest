import { db } from "@database/connection";
import { User } from "@models/User";
import type { UserRow } from "@models/User";

export type PersonalAccessTokenRow = {
  id: number;
  user_id: number;
  name: string;
  token_hash: string;
  abilities: string | null;
  last_used_at: Date | string | null;
  expires_at: Date | string | null;
  revoked_at: Date | string | null;
  created_at: Date | string;
  updated_at: Date | string | null;
};

export type CreatePersonalAccessTokenData = {
  user_id: number;
  name: string;
  token_hash: string;
  abilities?: string | null;
  expires_at?: Date | string | null;
};

export class PersonalAccessToken {
  static table = "personal_access_tokens";

  static query() {
    return db<PersonalAccessTokenRow>(PersonalAccessToken.table);
  }

  static find(id: number) {
    return PersonalAccessToken.query().where({ id }).first();
  }

  static findByTokenHash(tokenHash: string) {
    return PersonalAccessToken.query().where({ token_hash: tokenHash }).first();
  }

  static async create(data: CreatePersonalAccessTokenData): Promise<PersonalAccessTokenRow> {
    const [id] = await PersonalAccessToken.query().insert({
      user_id: data.user_id,
      name: data.name,
      token_hash: data.token_hash,
      abilities: data.abilities ?? null,
      expires_at: data.expires_at ?? null,
    });

    const token = await PersonalAccessToken.find(Number(id));

    if (!token) {
      throw new Error("Personal access token was not created.");
    }

    return token;
  }

  static markUsed(id: number) {
    return PersonalAccessToken.query().where({ id }).update({
      last_used_at: db.fn.now(),
      updated_at: db.fn.now(),
    });
  }

  static revoke(id: number) {
    return PersonalAccessToken.query().where({ id }).update({
      revoked_at: db.fn.now(),
      updated_at: db.fn.now(),
    });
  }

  static user(token: PersonalAccessTokenRow): Promise<UserRow | undefined> {
    return User.find(token.user_id);
  }
}
