import { Request, Response } from "express";
import { Controller } from "@http/controllers/Controller";
import { AuthenticatedRequest, ListPostsRequestData, StorePostRequestData, UpdatePostRequestData, ValidatedRequest } from "@http/requests";
import { JsonResource, PostResource } from "@http/resources";
import { PostRow } from "@models/Post";
import { PostService } from "@services/PostService";

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

export class PostController extends Controller {
  private readonly postService: PostService;

  constructor(postService: PostService) {
    super();
    this.postService = postService;
  }

  index = async (req: Request, res: Response) => {
    const pagination = (req as IndexPostRequest).validated.query;
    const posts = await this.postService.list(pagination);

    return this.collection(
      res,
      JsonResource.collection(posts.data, PostResource),
      {
        meta: posts.meta,
      }
    );
  };

  store = async (req: Request, res: Response) => {
    const { user } = req as AuthenticatedRequest;
    const data = (req as StorePostRequest).validated.body;
    const post = await this.postService.create(user, data);

    return this.createdResource(
      res,
      PostResource.make(post),
      {
        message: "Post created.",
      }
    );
  };

  show = async (req: Request, res: Response) => {
    const post = (req as BoundPostRequest).models.post;

    return this.resource(res, PostResource.make(post));
  };

  update = async (req: Request, res: Response) => {
    const boundPost = (req as BoundPostRequest).models.post;
    const data = (req as UpdatePostRequest).validated.body;
    const post = await this.postService.update(boundPost, data);

    return this.resource(
      res,
      PostResource.make(post ?? boundPost),
      {
        message: "Post updated.",
      }
    );
  };

  destroy = async (req: Request, res: Response) => {
    const post = (req as BoundPostRequest).models.post;

    await this.postService.delete(post);

    return this.noContent(res);
  };
}
