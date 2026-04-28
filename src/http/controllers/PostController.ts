import { Request, Response } from "express";
import { NotFoundException } from "@exceptions/NotFoundException";
import { ListPostsRequestData, StorePostRequestData, UpdatePostRequestData, ValidatedRequest } from "@http/requests";
import { JsonResource, PostResource } from "@http/resources";
import { Post } from "@models/Post";

type IndexPostRequest = ValidatedRequest<{
  query: ListPostsRequestData;
}>;

type StorePostRequest = ValidatedRequest<{
  body: StorePostRequestData;
}>;

type UpdatePostRequest = ValidatedRequest<{
  body: UpdatePostRequestData;
}>;

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
    const data = (req as StorePostRequest).validated.body;
    const post = await Post.create(data);

    res.status(201).json(
      PostResource.make(post).toResponse({
        message: "Post created.",
      })
    );
  }

  async show(req: Request, res: Response) {
    const post = await Post.find(Number(req.params.id));

    if (!post) {
      throw new NotFoundException("Post not found");
    }

    res.json(PostResource.make(post).toResponse());
  }

  async update(req: Request, res: Response) {
    const id = Number(req.params.id);
    const existingPost = await Post.find(id);

    if (!existingPost) {
      throw new NotFoundException("Post not found");
    }

    const data = (req as UpdatePostRequest).validated.body;
    const post = await Post.update(id, data);

    if (!post) {
      throw new NotFoundException("Post not found");
    }

    res.json(
      PostResource.make(post).toResponse({
        message: "Post updated.",
      })
    );
  }

  async destroy(req: Request, res: Response) {
    const id = Number(req.params.id);
    const existingPost = await Post.find(id);

    if (!existingPost) {
      throw new NotFoundException("Post not found");
    }

    await Post.delete(id);

    res.status(204).send();
  }
}
