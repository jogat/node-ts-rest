import { Request, Response } from "express";
import { AuthenticatedRequest, ListPostsRequestData, StorePostRequestData, UpdatePostRequestData, ValidatedRequest } from "@http/requests";
import { JsonResource, PostResource } from "@http/resources";
import { Post, PostRow } from "@models/Post";

type IndexPostRequest = ValidatedRequest<{
  query: ListPostsRequestData;
}>;

type StorePostRequest = ValidatedRequest<{
  body: StorePostRequestData;
}>;

type UpdatePostRequest = ValidatedRequest<{
  body: UpdatePostRequestData;
}>;

type BoundPostRequest = Request & {
  models: {
    post: PostRow;
  };
};

export class PostController {
  async index(req: Request, res: Response) {
    const pagination = (req as IndexPostRequest).validated.query;
    const posts = await Post.paginate(pagination);

    res.json(
      JsonResource.collection(posts.data, PostResource).toResponse({
        meta: posts.meta,
      })
    );
  }

  async store(req: Request, res: Response) {
    const { user } = req as AuthenticatedRequest;
    const data = (req as StorePostRequest).validated.body;
    const post = await Post.create({
      user_id: user.id,
      ...data,
    });

    res.status(201).json(
      PostResource.make(post).toResponse({
        message: "Post created.",
      })
    );
  }

  async show(req: Request, res: Response) {
    const post = (req as BoundPostRequest).models.post;

    res.json(PostResource.make(post).toResponse());
  }

  async update(req: Request, res: Response) {
    const boundPost = (req as BoundPostRequest).models.post;
    const data = (req as UpdatePostRequest).validated.body;
    const post = await Post.update(boundPost.id, data);

    res.json(
      PostResource.make(post ?? boundPost).toResponse({
        message: "Post updated.",
      })
    );
  }

  async destroy(req: Request, res: Response) {
    const post = (req as BoundPostRequest).models.post;

    await Post.delete(post.id);

    res.status(204).send();
  }
}
