import Image from "next/image";
import { requireAdmin } from "@/lib/admin";
import { listParams } from "@/lib/admin-queries";
import { AdminHeading, Pagination } from "@/components/admin/shared";
import { AdminForm, Input } from "@/components/admin/form";
import { GalleryUpload } from "@/components/admin/gallery-upload";
import { saveMedia } from "@/app/admin/actions";
export default async function AdminGallery({
  searchParams: input,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const searchParams = await input;
  const { db } = await requireAdmin();
  const { page, from, to } = listParams(searchParams);
  const { data, error, count } = await db
    .from("gallery_media")
    .select("*", { count: "exact" })
    .order("sort_order")
    .order("created_at")
    .range(from, to);
  if (error) throw new Error("Gallery unavailable.");
  return (
    <>
      <AdminHeading
        title="Gallery"
        copy="Upload, describe, arrange, and publish your workshop media."
      />
      <section className="panel admin-card">
        <h2>Add media</h2>
        <GalleryUpload />
      </section>
      <div className="admin-editor-grid">
        {data?.map((item) => (
          <article className="panel admin-card" key={item.id}>
            <div className="admin-media-preview">
              {item.type === "image" ? (
                <Image
                  src={item.src}
                  alt={item.name}
                  width={600}
                  height={400}
                  unoptimized
                />
              ) : (
                <video src={item.src} controls preload="metadata" />
              )}
            </div>
            <AdminForm action={saveMedia}>
              <input name="id" type="hidden" value={item.id} />
              <Input
                label="Description / image alternative text"
                name="name"
                defaultValue={item.name}
                maxLength={200}
                required
              />
              <Input
                label="Display order (lowest first)"
                name="sort_order"
                type="number"
                min="0"
                max="10000"
                defaultValue={item.sort_order}
                required
              />
              <label className="checkbox">
                <input
                  name="visible"
                  type="checkbox"
                  defaultChecked={item.visible}
                />{" "}
                Visible in public gallery
              </label>
            </AdminForm>
            <p className="muted">
              {item.bucket ? "Uploaded media" : "Existing website media"}
            </p>
          </article>
        ))}
      </div>
      {!data?.length && (
        <p className="notice">
          No media entries. Run the seed command to register existing website
          photos, or upload new media above.
        </p>
      )}
      <Pagination page={page} count={count || 0} path="/admin/gallery" />
      <p className="muted">
        Hidden media is removed from the gallery listing. Previously shared
        public media URLs remain accessible. The existing Drive gallery stays
        available on the public page.
      </p>
    </>
  );
}
