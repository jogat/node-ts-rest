import { db } from "@database/connection";
import { EventDispatcher, PostCreated, PostUpdated } from "@events";
import { Post, PostRow, CreatePostData, UpdatePostData, PaginationInput, PaginatedResult } from "@models/Post";
import type { UserRow } from "@models/User";
import { SlugService } from "@services/SlugService";

export class PostService {
  constructor(
    private readonly events = new EventDispatcher(),
    private readonly slugService = new SlugService()
  ) {}

  list(pagination: PaginationInput): Promise<PaginatedResult<PostRow>> {
    return Post.paginate(pagination);
  }

  async create(user: UserRow, data: Omit<CreatePostData, "user_id" | "slug">): Promise<PostRow> {
    const post = await db.transaction(async (trx) => {
      const slug = await this.slugService.generateSlug(
        {
          components: [data.title],
          fallback: "post",
        },
        trx
      );

      const createdPost = await Post.create(
        {
          user_id: user.id,
          title: data.title,
          body: data.body,
          slug,
          published: data.published,
        },
        trx
      );

      await this.slugService.persistSlug(
        {
          sluggable_model_id: createdPost.id,
          sluggable_model_class: Post.name,
          slug,
        },
        trx
      );

      return createdPost;
    });

    await this.events.dispatch(new PostCreated(post, user));

    return post;
  }

  async update(post: PostRow, data: UpdatePostData): Promise<PostRow | undefined> {
    const updatedPost = await Post.update(post.id, data);

    if (updatedPost) {
      await this.events.dispatch(new PostUpdated(updatedPost, post, data));
    }

    return updatedPost;
  }

  async delete(post: PostRow): Promise<void> {
    await Post.delete(post.id);
  }
}
