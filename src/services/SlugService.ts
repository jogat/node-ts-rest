import type { Knex } from "knex";
import { db } from "@database/connection";
import { Post } from "@models/Post";
import { Slug } from "@models/Slug";
import { slugifyComponents } from "@support/slug";

type DatabaseConnection = Knex | Knex.Transaction;

export type GenerateSlugInput = {
  components: string[];
  fallback?: string;
};

export type PersistSlugInput = {
  sluggable_model_id: number;
  sluggable_model_class: string;
  slug: string;
};

export class SlugService {
  async generateSlug(input: GenerateSlugInput, connection: DatabaseConnection = db): Promise<string> {
    const baseSlug = slugifyComponents(input.components, input.fallback ?? "item");
    let candidate = baseSlug;
    let increment = 1;

    while ((await Slug.findBySlug(candidate, connection)) || (await Post.findBySlug(candidate, connection))) {
      candidate = `${baseSlug}-${increment}`;
      increment++;
    }

    return candidate;
  }

  async persistSlug(input: PersistSlugInput, connection: DatabaseConnection = db): Promise<string> {
    const existing = await Slug.findByModel(input.sluggable_model_class, input.sluggable_model_id, connection);

    if (existing) {
      return existing.slug;
    }

    const slug = await Slug.create(
      {
        sluggable_model_id: input.sluggable_model_id,
        sluggable_model_class: input.sluggable_model_class,
        slug: input.slug,
      },
      connection
    );

    return slug.slug;
  }
}
