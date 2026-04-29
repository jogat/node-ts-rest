# Storage, Filesystems, and Uploads

## Goal

Add a Laravel-like storage abstraction for uploaded files and generated assets.

## Why This Matters

Most API products eventually need profile images, attachments, exports, or generated files. A storage layer keeps those concerns out of controllers and models.

## Scope

- Create a `src/storage/` or equivalent filesystem abstraction. Done.
- Add local file storage support first. Done.
- Add helpers for reading, writing, and deleting files. Done.
- Add upload handling in HTTP routes and request validation. Done with Multer and an avatar upload example route.
- Document public file paths and private file handling rules. Done.

## Good First Use Cases

- user avatar uploads
- post attachments
- export downloads
- generated reports

## Current Implementation

- `Storage` provides a Laravel-like default disk and named disk API.
- `local` stores private files under `storage/app/private`.
- `public` stores public files under `storage/app/public` and serves them at `/storage`.
- Local disks support `put`, `get`, `exists`, `delete`, and `url`.
- Local disk paths are normalized and protected against traversal.
- `UploadedFile` wraps Multer files and supports `store` and `storeAs`.
- `POST /v1/uploads/avatar` demonstrates authenticated upload validation and storage.

## Pending Work

- Add S3, R2, or GCS disks when the project can use a compatible storage package or a custom cloud adapter.
- Add signed temporary URLs for private file downloads.
- Add scoped and read-only disks.
- Add persisted attachment records for avatars, post files, exports, or reports.
- Add image transformations and derivative generation.
- Add direct-to-cloud uploads for large files.
- Add a Laravel-like `storage:link` console command if the app introduces a public web root.

## Done When

- Files can be stored without hardcoding filesystem paths in controllers.
- Upload validation is explicit and predictable.
- Stored files can be referenced from API responses.
- The local developer flow remains easy to set up.
