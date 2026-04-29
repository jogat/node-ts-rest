import { Response } from "express";
import {
  JsonResource,
  ResourceCollection,
  ResourceResponse,
  ResourceResponseOptions,
} from "@http/resources";

export abstract class Controller {
  protected json<TBody>(res: Response, body: TBody, status = 200): Response<TBody> {
    return res.status(status).json(body);
  }

  protected data<TData>(res: Response, data: TData, status = 200): Response<ResourceResponse<TData>> {
    return this.json(res, { data }, status);
  }

  protected created<TData>(res: Response, data: TData): Response<ResourceResponse<TData>> {
    return this.data(res, data, 201);
  }

  protected resource<TResource, TData>(
    res: Response,
    resource: JsonResource<TResource, TData>,
    options: ResourceResponseOptions = {},
    status = 200
  ): Response<ResourceResponse<TData>> {
    return this.json(res, resource.toResponse(options), status);
  }

  protected createdResource<TResource, TData>(
    res: Response,
    resource: JsonResource<TResource, TData>,
    options: ResourceResponseOptions = {}
  ): Response<ResourceResponse<TData>> {
    return this.resource(res, resource, options, 201);
  }

  protected collection<TResource, TData>(
    res: Response,
    collection: ResourceCollection<TResource, TData>,
    options: ResourceResponseOptions = {},
    status = 200
  ): Response<ResourceResponse<TData[]>> {
    return this.json(res, collection.toResponse(options), status);
  }

  protected noContent(res: Response): Response {
    return res.status(204).send();
  }
}
