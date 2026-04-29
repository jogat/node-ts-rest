# Storage, Filesystems, and Uploads

## Goal

Add a Laravel-like storage abstraction for uploaded files and generated assets.

## Why This Matters

Most API products eventually need profile images, attachments, exports, or generated files. A storage layer keeps those concerns out of controllers and models.

## Scope

- Create a `src/storage/` or equivalent filesystem abstraction.
- Add local file storage support first.
- Add helpers for reading, writing, and deleting files.
- Add upload handling in HTTP routes and request validation.
- Document public file paths and private file handling rules.

## Good First Use Cases

- user avatar uploads
- post attachments
- export downloads
- generated reports

## Done When

- Files can be stored without hardcoding filesystem paths in controllers.
- Upload validation is explicit and predictable.
- Stored files can be referenced from API responses.
- The local developer flow remains easy to set up.

