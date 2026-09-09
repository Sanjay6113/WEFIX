"use client";
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { browserClient } from "@/lib/supabase/browser";
import { publicConfig } from "@/lib/supabase/config";
import { validateUpload } from "@/lib/domain";
import { prepareUpload, finishUpload } from "@/app/admin/actions";
export function GalleryUpload() {
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const ref = useRef<HTMLFormElement>(null);
  const router = useRouter();
  async function upload(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSuccess("");
    setProgress(0);
    const form = new FormData(event.currentTarget);
    const file = form.get("file") as File;
    const name = String(form.get("name") || "").trim();
    if (!file?.size || !name || name.length > 200) {
      setError("Choose a file and add a description up to 200 characters.");
      return;
    }
    setBusy(true);
    let uploaded: { bucket: string; path: string } | undefined;
    try {
      validateUpload(file.type, file.size);
      const target = await prepareUpload(file.type, file.size);
      const db = browserClient();
      const config = publicConfig()!;
      // Storage RLS independently verifies the bearer token and admin membership.
      const {
        data: { session },
      } = await db.auth.getSession();
      if (!session)
        throw new Error("Session expired. Sign in again before uploading.");
      await new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open(
          "POST",
          `${config.url}/storage/v1/object/${target.bucket}/${target.path}`,
        );
        xhr.setRequestHeader("Authorization", `Bearer ${session.access_token}`);
        xhr.setRequestHeader("apikey", config.key);
        xhr.setRequestHeader("Content-Type", file.type);
        xhr.setRequestHeader("x-upsert", "false");
        xhr.timeout = 300000;
        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable)
            setProgress(Math.round((e.loaded * 100) / e.total));
        };
        xhr.onload = () =>
          xhr.status >= 200 && xhr.status < 300
            ? resolve()
            : reject(
                new Error(
                  "Upload rejected. Check admin access, file type/size, and Storage setup.",
                ),
              );
        xhr.onerror = () =>
          reject(
            new Error(
              "Upload interrupted. Check your connection and try again.",
            ),
          );
        xhr.ontimeout = () =>
          reject(
            new Error(
              "Upload timed out. Try a smaller file or a faster connection.",
            ),
          );
        xhr.send(file);
      });
      uploaded = target;
      const result = await finishUpload({
        ...target,
        name,
        mime: file.type,
        size: file.size,
      });
      if (result.error) throw new Error(result.error);
      setSuccess(result.success || "Media uploaded.");
      ref.current?.reset();
      router.refresh();
    } catch (cause) {
      if (uploaded)
        await browserClient()
          .storage.from(uploaded.bucket)
          .remove([uploaded.path]);
      setError(
        cause instanceof Error ? cause.message : "Unable to upload media.",
      );
    } finally {
      setBusy(false);
    }
  }
  return (
    <form ref={ref} onSubmit={upload} className="admin-form">
      <fieldset disabled={busy} className="form-fields">
        <label className="admin-label">
          Image or video
          <input
            className="field"
            name="file"
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif,image/avif,video/mp4,video/webm"
            required
          />
        </label>
        <label className="admin-label">
          Description / image alternative text
          <input className="field" name="name" maxLength={200} required />
        </label>
        <p className="muted">
          Images: JPEG, PNG, WebP, GIF, AVIF up to 10 MB. Videos: MP4/WebM up to
          50 MB. Media is published after upload.
        </p>
      </fieldset>
      {busy && (
        <label className="admin-label">
          {progress === 100 ? "Publishing media…" : `Uploading ${progress}%`}
          <progress value={progress} max={100} />
        </label>
      )}
      {error && (
        <p role="alert" className="notice error">
          {error}
        </p>
      )}
      {success && (
        <p role="status" className="notice success">
          {success}
        </p>
      )}
      <button className="button button-primary" disabled={busy}>
        {busy ? "Uploading…" : "Upload to gallery"}
      </button>
    </form>
  );
}
