import { db } from "@database/connection";
import type { PersonalAccessTokenRow } from "@models/PersonalAccessToken";

export type UserRow = {
  id: number;
  name: string;
  email: string;
  password: string;
  created_at: Date | string;
  updated_at: Date | string | null;
};

export type CreateUserData = {
  name: string;
  email: string;
  password: string;
};

export class User {
  static table = "users";

  static query() {
    return db<UserRow>(User.table);
  }

  static find(id: number) {
    return User.query().where({ id }).first();
  }

  static findByEmail(email: string) {
    return User.query().where({ email }).first();
  }

  static async create(data: CreateUserData): Promise<UserRow> {
    const [id] = await User.query().insert({
      name: data.name,
      email: data.email,
      password: data.password,
    });

    const user = await User.find(Number(id));

    if (!user) {
      throw new Error("User was not created.");
    }

    return user;
  }

  static tokens(userId: number): Promise<PersonalAccessTokenRow[]> {
    return db<PersonalAccessTokenRow>("personal_access_tokens").where({ user_id: userId }).orderBy("created_at", "desc").orderBy("id", "desc");
  }
}
