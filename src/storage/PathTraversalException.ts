export class PathTraversalException extends Error {
  constructor(filePath: string) {
    super(`Invalid storage path "${filePath}".`);
  }
}
