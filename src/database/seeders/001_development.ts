import type { Knex } from "knex";
import { accessTokenFactory, postFactory, userFactory } from "@database/factories";

export async function seed(knex: Knex): Promise<void> {
    await knex("personal_access_tokens").del();
    await knex("posts").del();
    await knex("slugs").del();
    await knex("users").del();

  const admin = await userFactory.create({
    name: "Local Admin",
    email: "admin@example.com",
  });
  const author = await userFactory.create({
    name: "Local Author",
    email: "author@example.com",
  });

  await accessTokenFactory.create(
    {
      name: "Local Development",
    },
    {
      user: admin,
      plainTextToken: "local-dev-token",
    }
  );

  await Promise.all([
    postFactory.create({ title: "Welcome to Portfolio 2025", published: true }, { user: admin }),
    postFactory.create({ title: "Draft Roadmap Notes", published: false }, { user: admin }),
    postFactory.create({ title: "Author Update", published: true }, { user: author }),
  ]);
}
