import { Post, PostRow, CreatePostData, UpdatePostData, PaginationInput, PaginatedResult } from "@models/Post";
import type { UserRow } from "@models/User";

export class PostService {
  list(pagination: PaginationInput): Promise<PaginatedResult<PostRow>> {
    return Post.paginate(pagination);
  }

  create(user: UserRow, data: Omit<CreatePostData, "user_id">): Promise<PostRow> {
    return Post.create({
      user_id: user.id,
      ...data,
    });
  }

  update(post: PostRow, data: UpdatePostData): Promise<PostRow | undefined> {
    return Post.update(post.id, data);
  }

  async delete(post: PostRow): Promise<void> {
    await Post.delete(post.id);
  }
}
