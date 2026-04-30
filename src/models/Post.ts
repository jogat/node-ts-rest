import type { Knex } from "knex";
import { db } from "@database/connection";
import type { SlugInterface } from "@models/SlugInterface";

export type PostRow = SlugInterface & {
  id: number;
  user_id: number | null;
  title: string;
  body: string;
  published: boolean | number;
  created_at: Date | string;
  updated_at: Date | string | null;
};

export type CreatePostData = {
  user_id: number;
  title: string;
  body: string;
  slug: string;
  published?: boolean;
};

export type UpdatePostData = Partial<CreatePostData>;

export type PaginationInput = {
  page: number;
  per_page: number;
};

export type PaginatedResult<T> = {
  data: T[];
  meta: {
    current_page: number;
    per_page: number;
    total: number;
    last_page: number;
    from: number | null;
    to: number | null;
  };
};

export class Post {
  static table = "posts";

  static query(connection: Knex | Knex.Transaction = db) {
    return connection<PostRow>(Post.table);
  }

  static all(connection: Knex | Knex.Transaction = db) {
    return Post.query(connection).select("*").orderBy("created_at", "desc").orderBy("id", "desc");
  }

  static async paginate(input: PaginationInput, connection: Knex | Knex.Transaction = db): Promise<PaginatedResult<PostRow>> {
    const page = input.page;
    const perPage = input.per_page;
    const offset = (page - 1) * perPage;
    const total = await Post.count(connection);
    const data = await Post.query(connection).select("*").orderBy("created_at", "desc").orderBy("id", "desc").limit(perPage).offset(offset);
    const from = total === 0 || data.length === 0 ? null : offset + 1;
    const to = total === 0 || data.length === 0 ? null : offset + data.length;

    return {
      data,
      meta: {
        current_page: page,
        per_page: perPage,
        total,
        last_page: Math.max(Math.ceil(total / perPage), 1),
        from,
        to,
      },
    };
  }

  static async count(connection: Knex | Knex.Transaction = db): Promise<number> {
    const result = await Post.query(connection).count<{ total: number | string }>("id as total").first();

    return Number(result?.total ?? 0);
  }

  static find(id: number, connection: Knex | Knex.Transaction = db) {
    return Post.query(connection).where({ id }).first();
  }

  static findBySlug(slug: string, connection: Knex | Knex.Transaction = db) {
    return Post.query(connection).where({ slug }).first();
  }

  static async create(data: CreatePostData, connection: Knex | Knex.Transaction = db): Promise<PostRow> {
    const [id] = await Post.query(connection).insert({
      user_id: data.user_id,
      title: data.title,
      body: data.body,
      slug: data.slug,
      published: data.published ?? false,
    });

    const post = await Post.find(Number(id), connection);

    if (!post) {
      throw new Error("Post was not created.");
    }

    return post;
  }

  static async update(id: number, data: UpdatePostData, connection: Knex | Knex.Transaction = db): Promise<PostRow | undefined> {
    const changes: Record<string, unknown> = {
      ...data,
      updated_at: connection.fn.now(),
    };

    await Post.query(connection).where({ id }).update(changes);

    return Post.find(id, connection);
  }

  static delete(id: number, connection: Knex | Knex.Transaction = db) {
    return Post.query(connection).where({ id }).delete();
  }
}
