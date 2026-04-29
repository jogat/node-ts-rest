# Storage, Filesystems, and Uploads

The app has a Laravel-like storage wrapper with named disks and local storage support. Use the wrapper instead of hardcoding filesystem paths in controllers, services, jobs, or console commands.

## Disks

Storage configuration lives in `src/config/storage.ts`.

- `local` stores private files under `storage/app/private`.
- `public` stores public files under `storage/app/public` and serves them from `/storage`.
- `STORAGE_DISK` controls the default disk and defaults to `local`.
- `STORAGE_LOCAL_ROOT`, `STORAGE_PUBLIC_ROOT`, and `STORAGE_PUBLIC_URL` can override local paths and public URLs.

## Storage API

Use the `Storage` facade for default-disk operations:

```ts
await Storage.put("reports/example.txt", "Contents");
const contents = await Storage.get("reports/example.txt");
```

Use `disk(name)` when the target disk matters:

```ts
const path = await Storage.disk("public").put("avatars/user.png", buffer);
const url = Storage.disk("public").url(path);
```

Supported operations:

- `put(path, contents)`
- `get(path)`
- `exists(path)`
- `delete(path)`
- `url(path)` for disks with a configured public URL

All disk paths are relative to the disk root. Path traversal attempts are rejected.

## Upload Requests

Multipart parsing uses Multer memory storage. Routes can compose upload parsing and validation middleware:

```ts
router.post(
  "/uploads/avatar",
  auth,
  uploadSingle("avatar"),
  validateUploadedFile("avatar", {
    required: true,
    image: true,
    mimeTypes: ["image/jpeg", "image/png"],
    extensions: ["jpeg", "jpg", "png"],
    maxSize: 2 * 1024 * 1024,
  }),
  asyncHandler(uploadController.storeAvatar)
);
```

Inside a controller, use `req.uploadedFile(field)`:

```ts
const avatar = req.uploadedFile("avatar");
const path = await avatar.store("avatars", "public");
```

`UploadedFile` also supports `storeAs(directory, filename, disk)`.

## Public And Private Files

Private files on `local` are only available to server-side code. Public files on `public` are served by Express at `/storage/*`.

Do not store sensitive files on the `public` disk. Use the private disk until signed URLs or controller-mediated downloads are added.

## Testing

Unit tests can instantiate `LocalDisk` or `StorageManager` with temporary roots. Feature tests can upload files with Supertest `.attach(...)` and assert the returned `path` and `url`.
