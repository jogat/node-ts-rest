import type { Knex } from "knex";
import { db } from "@database/connection";

export type SlugRow = {
  id: number;
  sluggable_model_id: number;
  sluggable_model_class: string;
  slug: string;
  created_at: Date | string;
  updated_at: Date | string | null;
};

export type CreateSlugData = {
  sluggable_model_id: number;
  sluggable_model_class: string;
  slug: string;
};

type DatabaseConnection = Knex | Knex.Transaction;

export class Slug {
  static table = "slugs";

  static query(connection: DatabaseConnection = db) {
    return connection<SlugRow>(Slug.table);
  }

  static find(id: number, connection: DatabaseConnection = db) {
    return Slug.query(connection).where({ id }).first();
  }

  static findBySlug(slug: string, connection: DatabaseConnection = db) {
    return Slug.query(connection).where({ slug }).first();
  }

  static findByModel(sluggableModelClass: string, sluggableModelId: number, connection: DatabaseConnection = db) {
    return Slug.query(connection).where({ sluggable_model_class: sluggableModelClass, sluggable_model_id: sluggableModelId }).first();
  }

  static async create(data: CreateSlugData, connection: DatabaseConnection = db): Promise<SlugRow> {
    const [id] = await Slug.query(connection).insert({
      sluggable_model_id: data.sluggable_model_id,
      sluggable_model_class: data.sluggable_model_class,
      slug: data.slug,
    });

    const slug = await Slug.find(Number(id), connection);

    if (!slug) {
      throw new Error("Slug was not created.");
    }

    return slug;
  }
}
