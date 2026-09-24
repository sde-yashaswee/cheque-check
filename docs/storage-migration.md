# Private media migration

New uploads use owner-scoped private buckets. Existing URLs in the legacy public
`avatars` and `cheque-images` buckets continue to work until they are migrated.

## Prerequisites

1. Back up the database and both public storage buckets.
2. Apply `20260924030000_add_private_media_buckets.sql`.
3. Set `NEXT_PUBLIC_SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` in
   `.env.local` for the target environment.
4. Stop application writes or schedule a maintenance window.

## Dry run

```bash
npm run storage:migrate
```

The dry run lists recognized profile, business, party, and cheque records. It
does not download, upload, update, or delete data.

## Copy and update

```bash
npm run storage:migrate -- --apply
```

This copies each recognized object into an owner-scoped private path and updates
the database URL with a compare-and-set condition. Legacy source objects remain
public so the migration can be verified before cleanup.

## Copy, update, and remove sources

After validating the dry run in staging, a production migration can remove each
legacy source immediately after its database update:

```bash
npm run storage:migrate -- --apply --delete-source
```

Do not run `--delete-source` without verified backups. If the copy-only mode was
already used, inspect and remove the now-unreferenced legacy objects through the
Supabase storage inventory rather than rerunning the script.

## Verification

- Open profile, business, party, and cheque images as their owning user.
- Confirm another authenticated user receives `403` for copied URLs.
- Run an OCR scan against a migrated cheque image.
- Confirm database media fields begin with `/api/storage/`.
- Review script failures before deleting either legacy bucket.
