# WeFix Web Platform

Premium dark-tech Next.js landing platform for WeFix: PC builds, expert repairs, WhatsApp lead generation, and a repair tracker.

## Run locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Configure WhatsApp

Create `.env.local` and set:

```bash
NEXT_PUBLIC_WEFIX_WHATSAPP=919994428061
```

Use the full number with country code and no plus sign.

## Gallery

Add website gallery photos or videos inside:

```bash
public/gallery
```

Supported local files: `.jpg`, `.jpeg`, `.png`, `.webp`, `.gif`, `.avif`, `.mp4`, `.webm`, `.mov`, `.m4v`.

To show a public Google Drive folder on the Gallery page, add this to `.env.local`:

```bash
NEXT_PUBLIC_GALLERY_DRIVE_LINK=https://drive.google.com/drive/folders/YOUR_FOLDER_ID
```

If there are no local files and no Drive link, the Gallery page shows `No photos yet.`

## Supabase

The starter SQL schema is in `supabase/schema.sql`.
