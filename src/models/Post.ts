import { db } from "@database/connection";

export type PostRow = {
  id: number;
  user_id: number | null;
  title: string;
  body: string;
  slug: string;
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

  static query() {
    return db<PostRow>(Post.table);
  }

  static all() {
    return Post.query().select("*").orderBy("created_at", "desc").orderBy("id", "desc");
  }

  static async paginate(input: PaginationInput): Promise<PaginatedResult<PostRow>> {
    const page = input.page;
    const perPage = input.per_page;
    const offset = (page - 1) * perPage;
    const total = await Post.count();
    const data = await Post.query().select("*").orderBy("created_at", "desc").orderBy("id", "desc").limit(perPage).offset(offset);
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

  static async count(): Promise<number> {
    const result = await Post.query().count<{ total: number | string }>("id as total").first();

    return Number(result?.total ?? 0);
  }

  static find(id: number) {
    return Post.query().where({ id }).first();
  }

  static async create(data: CreatePostData): Promise<PostRow> {
    const [id] = await Post.query().insert({
      user_id: data.user_id,
      title: data.title,
      body: data.body,
      slug: data.slug,
      published: data.published ?? false,
    });

    const post = await Post.find(Number(id));

    if (!post) {
      throw new Error("Post was not created.");
    }

    return post;
  }

  static async update(id: number, data: UpdatePostData): Promise<PostRow | undefined> {
    const changes: Record<string, unknown> = {
      ...data,
      updated_at: db.fn.now(),
    };

    await Post.query().where({ id }).update(changes);

    return Post.find(id);
  }

  static delete(id: number) {
    return Post.query().where({ id }).delete();
  }
}
