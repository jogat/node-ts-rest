import { EventDispatcher, PostCreated, PostUpdated } from "@events";
import { Post, PostRow, CreatePostData, UpdatePostData, PaginationInput, PaginatedResult } from "@models/Post";
import type { UserRow } from "@models/User";

export class PostService {
  constructor(private readonly events = new EventDispatcher()) {}

  list(pagination: PaginationInput): Promise<PaginatedResult<PostRow>> {
    return Post.paginate(pagination);
  }

  async create(user: UserRow, data: Omit<CreatePostData, "user_id">): Promise<PostRow> {
    const post = await Post.create({
      user_id: user.id,
      ...data,
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
