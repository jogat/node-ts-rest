import { db } from "@database/connection";

export type PostRow = {
  id: number;
  title: string;
  body: string;
  slug: string;
  published: boolean | number;
  created_at: Date | string;
  updated_at: Date | string | null;
};

export type CreatePostData = {
  title: string;
  body: string;
  slug: string;
  published?: boolean;
};

export type UpdatePostData = Partial<CreatePostData>;

export class Post {
  static table = "posts";

  static query() {
    return db<PostRow>(Post.table);
  }

  static all() {
    return Post.query().select("*").orderBy("created_at", "desc").orderBy("id", "desc");
  }

  static find(id: number) {
    return Post.query().where({ id }).first();
  }

  static async create(data: CreatePostData): Promise<PostRow> {
    const [id] = await Post.query().insert({
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
