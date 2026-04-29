import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { closeDatabaseConnection, db } from "@database/connection";
import { seed } from "@database/seeders/001_development";
import { PersonalAccessToken } from "@models/PersonalAccessToken";
import { Post } from "@models/Post";
import { User } from "@models/User";
import { hashToken } from "@support/hashToken";

describe("development seeder", () => {
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

  it("seeds development data with reusable factories", async () => {
    await seed(db);

    expect(await User.query()).toHaveLength(2);
    expect(await Post.query()).toHaveLength(3);
    expect(await PersonalAccessToken.findByTokenHash(hashToken("local-dev-token"))).toMatchObject({
      name: "Local Development",
    });
  });
});
