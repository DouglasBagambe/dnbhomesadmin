"use client";
import { mediaBatches } from "../lib/media-batches.mjs";
import { MediaPreview } from "./MediaPreview";
import { useFeedback } from "./Feedback";
import { useSession } from "./Session";
import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api, ApiPage } from "../lib/api";
import { Agent, Agency, Media, Property } from "../lib/types";
import { friendlyError, label } from "../lib/presentation.mjs";
import { PageHeader, State } from "./PageState";
type Form = {
  title: string;
  description: string;
  purpose: string;
  type: string;
  amount: string;
  currency: string;
  period: string;
  country: string;
  region: string;
  district: string;
  area: string;
  address: string;
  bedrooms: string;
  bathrooms: string;
  size: string;
  sizeUnit: string;
  amenities: string;
  tags: string;
  agent: string;
  agency: string;
  verificationStatus: string;
  status: string;
  featured: boolean;
  media: Media[];
};
const blank: Form = {
  title: "",
  description: "",
  purpose: "rent",
  type: "apartment",
  amount: "",
  currency: "UGX",
  period: "month",
  country: "Uganda",
  region: "",
  district: "",
  area: "",
  address: "",
  bedrooms: "",
  bathrooms: "",
  size: "",
  sizeUnit: "sqm",
  amenities: "",
  tags: "",
  agent: "",
  agency: "",
  verificationStatus: "unverified",
  status: "draft",
  featured: false,
  media: [],
};
const field = (value?: number) => (value === undefined ? "" : String(value));
export function PropertyEditor({ id }: { id?: string }) {
  const admin = useSession();
  const { notify } = useFeedback();
  const canPublish = admin?.role === "super_admin" || admin?.role === "admin";
  const router = useRouter();
  const [form, setForm] = useState<Form>(blank);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [agencies, setAgencies] = useState<Agency[]>([]);
  const [loadFailed, setLoadFailed] = useState(false);
  const [loading, setLoading] = useState(Boolean(id));
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  const [uploadProgress, setUploadProgress] = useState({ done: 0, total: 0 });
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [mediaBusy, setMediaBusy] = useState(false);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const set = <K extends keyof Form>(key: K, value: Form[K]) =>
    setForm((current) => ({ ...current, [key]: value }));
  useEffect(() => {
    Promise.all([
      api<ApiPage<Agent>>("/agents?limit=100"),
      api<ApiPage<Agency>>("/agencies?limit=100"),
    ])
      .then(([a, g]) => {
        setAgents(a.data);
        setAgencies(g.data);
      })
      .catch((e) => setError(friendlyError(e)));
    if (id)
      api<{ data: Property }>(`/properties/${id}`)
        .then(({ data }) =>
          setForm({
            title: data.title,
            description: data.description,
            purpose: data.purpose,
            type: data.type,
            amount: String(data.price.amount),
            currency: data.price.currency,
            period: data.price.period,
            country: data.location.country,
            region: data.location.region,
            district: data.location.district,
            area: data.location.area,
            address: data.location.address,
            bedrooms: field(data.bedrooms),
            bathrooms: field(data.bathrooms),
            size: field(data.size),
            sizeUnit: data.sizeUnit,
            amenities: data.amenities.join(", "),
            tags: data.tags.join(", "),
            agent: data.agent?._id || "",
            agency: data.agency?._id || "",
            verificationStatus: data.verificationStatus,
            status: data.status,
            featured: data.featured,
            media: data.media || [],
          }),
        )
        .catch((e) => {
          setLoadFailed(true);
          setError(friendlyError(e));
        })
        .finally(() => setLoading(false));
  }, [id]);
  async function upload(files: File[] | null, retry = false) {
    if (!files?.length || mediaBusy) return;
    let batches: File[][];
    try { batches = mediaBatches(files, form.media.length); } catch (e) { setError(friendlyError(e)); return; }
    setMediaBusy(true); setError("");
    if (!retry) setUploadProgress({ done: 0, total: files.length });
    let remaining = [...files];
    setPendingFiles(remaining);
    try {
      for (const batch of batches) {
        const body = new FormData(); batch.forEach(file => body.append("files", file));
        const grant = await api<{data:{token:string;uploadUrl:string}}>("/media/tickets", {method:"POST", body:JSON.stringify({})});
        const response = await fetch(grant.data.uploadUrl, {method:"POST", headers:{"X-Media-Upload-Token":grant.data.token}, body, credentials:"omit"});
        if (!response.ok) throw new Error(`Upload failed (${response.status}). Retry the remaining files.`);
        const result = await response.json() as { data: Media[] };
        if (result.data.length !== batch.length) throw new Error("The upload returned an incomplete batch. Please check the media before retrying.");
        setForm(current => ({ ...current, media: [...current.media, ...result.data] }));
        remaining = remaining.slice(batch.length); setPendingFiles(remaining);
        setUploadProgress(current => ({ ...current, done: current.done + batch.length }));
      }
    } catch (e) { setError(`Upload paused. Completed files are kept; ${remaining.length} files remain. ${friendlyError(e)}`); }
    finally { setMediaBusy(false); }
  }
  function moveTo(from: number, position: number) {
    if (mediaBusy || position < 0 || position >= form.media.length) return;
    setForm(current => { const media = [...current.media]; const [item] = media.splice(from, 1); media.splice(position, 0, item); return { ...current, media }; });
  }
  async function removeMedia(index: number) {
    const item = form.media[index];
    setMediaBusy(true);
    setError("");
    try {
      if (item._id) await api(`/media/${item._id}`, { method: "DELETE" });
      set(
        "media",
        form.media.filter((_, i) => i !== index),
      );
    } catch (e) {
      setError(friendlyError(e));
    } finally {
      setMediaBusy(false);
    }
  }
  async function submit(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError("");
    const list = (text: string) =>
      text
        .split(",")
        .map((v) => v.trim())
        .filter(Boolean);
    const payload = {
      title: form.title,
      description: form.description,
      purpose: form.purpose,
      type: form.type,
      price: {
        amount: Number(form.amount),
        currency: form.currency,
        period: form.period,
      },
      location: {
        country: form.country,
        region: form.region,
        district: form.district,
        area: form.area,
        address: form.address,
      },
      bedrooms: form.bedrooms ? Number(form.bedrooms) : undefined,
      bathrooms: form.bathrooms ? Number(form.bathrooms) : undefined,
      size: form.size ? Number(form.size) : undefined,
      sizeUnit: form.sizeUnit,
      amenities: list(form.amenities),
      tags: list(form.tags),
      agent: form.agent || null,
      agency: form.agency || null,
      ...(canPublish
        ? {
            verificationStatus: form.verificationStatus,
            featured: form.featured,
          }
        : {}),
      ...(!canPublish && ["published", "archived"].includes(form.status)
        ? {}
        : { status: form.status }),
      media: form.media.map(({ url, key, type, alt }) => ({
        url,
        key,
        type,
        alt,
      })),
      cover: form.media.find((m) => m.type === "image"),
    };
    try {
      const result = await api<{ data: Property }>(
        id ? `/properties/${id}` : "/properties",
        { method: id ? "PATCH" : "POST", body: JSON.stringify(payload) },
      );
      notify("Property saved.");
      router.replace(`/properties/${result.data._id}`);
      router.refresh();
    } catch (e) {
      setError(friendlyError(e));
    } finally {
      setSaving(false);
    }
  }
  if (loading) return <State>Loading property…</State>;
  if (loadFailed)
    return (
      <State tone="error">
        {error}
        <button onClick={() => window.location.reload()}>Retry</button>
      </State>
    );
  function input(
    key: keyof Form,
    title: string,
    required = false,
    type = "text",
  ) {
    return (
      <label key={key}>
        {title}
        <input
          type={type}
          step={type === "number" ? "any" : undefined}
          min={type === "number" ? "0" : undefined}
          required={required}
          value={String(form[key])}
          onChange={(e) => set(key, e.target.value as never)}
        />
      </label>
    );
  }
  function select(
    key: keyof Form,
    title: string,
    values: string[],
    disabled = false,
  ) {
    return (
      <label>
        {title}
        <select
          aria-label={title}
          value={String(form[key])}
          disabled={disabled}
          onChange={(e) => set(key, e.target.value as never)}
        >
          {values.map((value) => (
            <option
              key={value}
              value={value}
              disabled={
                key === "status" &&
                !canPublish &&
                ["published", "archived"].includes(value)
              }
            >
              {label(value)}
            </option>
          ))}
        </select>
      </label>
    );
  }
  function move(index: number, direction: number) {
    const next = [...form.media];
    [next[index], next[index + direction]] = [
      next[index + direction],
      next[index],
    ];
    set("media", next);
  }
  return (
    <>
      <PageHeader
        eyebrow="Inventory"
        title={id ? "Edit property" : "New property"}
        description="Maintain listing details and media. Changes are saved only when you choose Save property."
      />
      {error && (
        <State tone="error">
          {error}{" "}
          <button onClick={() => window.location.reload()}>Reload</button>
        </State>
      )}

      <form className="editor" onSubmit={submit}>
        <fieldset disabled={saving || mediaBusy} className="editor-body">
          <div className="editor-main">
            <section>
              <header>
                <h2>Listing</h2>
                <p>The core details shown to customers.</p>
              </header>
              <div className="form-grid">
                <label className="wide">
                  Title
                  <input
                    required
                    value={form.title}
                    onChange={(e) => set("title", e.target.value)}
                  />
                </label>
                <label className="wide">
                  Description
                  <textarea
                    required
                    rows={6}
                    value={form.description}
                    onChange={(e) => set("description", e.target.value)}
                  />
                </label>
                {select("purpose", "Purpose", ["rent", "sale", "short_stay"])}
                {select("type", "Property type", [
                  "apartment",
                  "house",
                  "land",
                  "commercial",
                  "hotel",
                  "guest_house",
                  "serviced_apartment",
                  "other",
                ])}
              </div>
            </section>
            <section>
              <header>
                <h2>Price</h2>
                <p>Amount, currency and payment period.</p>
              </header>
              <div className="form-grid three">
                {input("amount", "Amount", true, "number")}
                {select("currency", "Currency", ["UGX", "USD"])}
                {select("period", "Period", [
                  "total",
                  "month",
                  "week",
                  "night",
                ])}
              </div>
            </section>
            <section>
              <header>
                <h2>Location</h2>
                <p>Provide the location details available for this listing.</p>
              </header>
              <div className="form-grid">
                {(
                  ["country", "region", "district", "area", "address"] as const
                ).map((key) =>
                  input(
                    key,
                    key[0].toUpperCase() + key.slice(1),
                    key === "country",
                  ),
                )}
              </div>
            </section>
            <section>
              <header>
                <h2>Property details</h2>
              </header>
              <div className="form-grid">
                {input("bedrooms", "Bedrooms", false, "number")}
                {input("bathrooms", "Bathrooms", false, "number")}
                {input("size", "Size", false, "number")}
                {select("sizeUnit", "Size unit", [
                  "sqm",
                  "sqft",
                  "acres",
                  "hectares",
                ])}
                <label className="wide">
                  Amenities
                  <input
                    value={form.amenities}
                    onChange={(e) => set("amenities", e.target.value)}
                    placeholder="Parking, Pool, Security"
                  />
                  <small>Separate amenities with commas.</small>
                </label>
                <label className="wide">
                  Tags
                  <input
                    value={form.tags}
                    onChange={(e) => set("tags", e.target.value)}
                  />
                  <small>Separate tags with commas.</small>
                </label>
              </div>
            </section>
            <section>
              <header>
                <h2>Media</h2>
                <p>
                  The first image is the cover. Reorder images before saving.
                </p>
              </header>
              <label className="upload-field">
                Upload images or videos
                <input
                  type="file"
                  multiple
                  disabled={mediaBusy || pendingFiles.length > 0}
                  accept="image/jpeg,image/png,image/webp,image/avif,video/mp4,video/webm"
                  onChange={(e) => {
                    void upload(e.target.files ? Array.from(e.target.files) : null);
                    e.target.value = "";
                  }}
                />
              </label>
              {uploadProgress.total > 0 && <p role="status" aria-live="polite">Uploaded {uploadProgress.done} of {uploadProgress.total}</p>}
              {!!pendingFiles.length && !mediaBusy && <div className="media-actions"><button type="button" onClick={() => void upload(pendingFiles, true)}>Retry remaining {pendingFiles.length} files</button><button type="button" onClick={() => setPendingFiles([])}>Discard remaining selection</button></div>}
              <small>Up to 40 items; JPEG, PNG, WebP, AVIF ≤10 MB; MP4/WebM ≤50 MB. Uploads are batched at ≤10 files and ≤100 MB.</small>
              {mediaBusy && <State>Uploading media… Completed files stay in the editor.</State>}
              {!form.media.length && (
                <p className="muted">No media added yet.</p>
              )}
              <div className="media-list">
                {form.media.map((item, index) => (
                  <article key={`${item.url}-${index}`} draggable={!mediaBusy} onDragStart={() => setDragIndex(index)} onDragOver={event => event.preventDefault()} onDrop={event => { event.preventDefault(); if (dragIndex !== null) moveTo(dragIndex, index); setDragIndex(null); }} onDragEnd={() => setDragIndex(null)}>
                    {item.type === "image" ? (
                      <MediaPreview
                        key={item.url}
                        src={item.url}
                        alt={item.alt || "Property image preview"}
                      />
                    ) : (
                      <video className="video-preview" controls playsInline preload="metadata" src={item.url} aria-label={item.alt || `Video ${index + 1}`} />
                    )}
                    <div className="media-details">
                      <strong>
                        {item.type === "image" &&
                        form.media.findIndex((m) => m.type === "image") ===
                          index
                          ? "Cover image"
                          : `${label(item.type)} ${index + 1}`}
                      </strong>
                      <a href={item.url} target="_blank" rel="noreferrer">
                        Open {item.type}
                      </a>
                      {item.type === "image" && (
                        <label>
                          Alt text
                          <input
                            value={item.alt || ""}
                            onChange={(e) =>
                              set(
                                "media",
                                form.media.map((m, i) =>
                                  i === index
                                    ? { ...m, alt: e.target.value }
                                    : m,
                                ),
                              )
                            }
                          />
                        </label>
                      )}
                      <label>Position <input type="number" min={1} max={form.media.length} value={index + 1} disabled={mediaBusy} aria-label={`Position of media ${index + 1}`} onChange={event => moveTo(index, Number(event.target.value) - 1)} /></label>
                      <div className="media-actions">
                        <button
                          type="button"
                          disabled={mediaBusy || index === 0}
                          onClick={() => move(index, -1)}
                        >
                          Move up
                        </button>
                        <button
                          type="button"
                          disabled={mediaBusy || index === form.media.length - 1}
                          onClick={() => move(index, 1)}
                        >
                          Move down
                        </button>
                        <button
                          className="danger-text"
                          disabled={mediaBusy}
                          type="button"
                          onClick={() => void removeMedia(index)}
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          </div>
          <aside className="editor-rail">
            <section>
              <header>
                <h2>Publishing</h2>
              </header>
              <div className="form-grid">
                {select(
                  "status",
                  "Status",
                  ["draft", "pending_review", "published", "archived"],
                  !canPublish &&
                    ["published", "archived"].includes(form.status),
                )}
                {select(
                  "verificationStatus",
                  "Verification",
                  ["unverified", "pending", "verified", "rejected"],
                  !canPublish,
                )}
                <label className="checkbox">
                  <input
                    type="checkbox"
                    disabled={!canPublish}
                    checked={form.featured}
                    onChange={(e) => set("featured", e.target.checked)}
                  />
                  Featured property
                </label>
                {!canPublish && (
                  <p className="muted">
                    Publishing, verification and featuring require an
                    administrator.
                  </p>
                )}
              </div>
            </section>
            <section>
              <header>
                <h2>Assignment</h2>
              </header>
              <div className="form-grid">
                <label>
                  Agent
                  <select
                    aria-label="Agent"
                    value={form.agent}
                    onChange={(e) => set("agent", e.target.value)}
                  >
                    <option value="">Unassigned</option>
                    {agents.map((a) => (
                      <option key={a._id} value={a._id}>
                        {a.name}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  Agency
                  <select
                    aria-label="Agency"
                    value={form.agency}
                    onChange={(e) => set("agency", e.target.value)}
                  >
                    <option value="">Unassigned</option>
                    {agencies.map((a) => (
                      <option key={a._id} value={a._id}>
                        {a.name}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
            </section>
            <section className="save-panel">
              <p>Review changes before saving.</p>
              <div className="form-actions">
                <button
                  type="button"
                  onClick={() => router.push("/properties")}
                >
                  Cancel
                </button>
                <button className="primary" type="submit">
                  {saving ? "Saving…" : "Save property"}
                </button>
              </div>
            </section>
          </aside>
        </fieldset>
      </form>
    </>
  );
}
