"use client";

import { ImagePlus, UploadCloud, Video, X } from "lucide-react";
import { ChangeEvent, FormEvent, useMemo, useState } from "react";
import { uploadMedia } from "../lib/api";
import type { Property, PropertyPayload, PropertyPurpose, PropertyType } from "../lib/types";

type PropertyFormProps = {
  property?: Property | null;
  onCancel: () => void;
  onSubmit: (payload: PropertyPayload) => Promise<void>;
};

type FormState = {
  title: string;
  description: string;
  location: string;
  region: string;
  district: string;
  area: string;
  type: PropertyType;
  purpose: PropertyPurpose;
  price: string;
  appointmentFee: string;
  totalArea: string;
  bedrooms: string;
  bathrooms: string;
  parking: string;
  dimensions: string;
  tags: string;
  amenities: string;
  images: string;
  videos: string;
  videoTour: string;
  agentName: string;
  agentPhone: string;
  agentEmail: string;
  agentPhoto: string;
  agentCompany: string;
  agentPosition: string;
  isFeatured: boolean;
  isActive: boolean;
};

const propertyTypes: PropertyType[] = [
  "apartment",
  "house",
  "villa",
  "commercial",
  "land",
  "studio"
];

const propertyPurposes: PropertyPurpose[] = ["rent", "sale", "shortStay"];

function joinValues(values: string[] | undefined): string {
  return values?.join(", ") ?? "";
}

function splitValues(value: string): string[] {
  return value
    .split(",")
    .map((item: string) => item.trim())
    .filter((item: string) => item.length > 0);
}

function numberValue(value: string, fallback: number): number {
  const parsedValue = Number(value);
  return Number.isFinite(parsedValue) ? parsedValue : fallback;
}

function buildInitialState(property?: Property | null): FormState {
  return {
    title: property?.title ?? "",
    description: property?.description ?? "",
    location: property?.location ?? "",
    region: property?.region ?? "Central",
    district: property?.district ?? "",
    area: property?.area ?? "",
    type: property?.type ?? "apartment",
    purpose: property?.purpose ?? "rent",
    price: String(property?.price ?? ""),
    appointmentFee: String(property?.appointmentFee ?? ""),
    totalArea: String(property?.size.totalArea ?? ""),
    bedrooms: String(property?.size.bedrooms ?? ""),
    bathrooms: String(property?.size.bathrooms ?? ""),
    parking: String(property?.size.parking ?? ""),
    dimensions: property?.size.dimensions ?? "",
    tags: joinValues(property?.tags),
    amenities: joinValues(property?.amenities),
    images: joinValues(property?.images),
    videos: joinValues(property?.videos),
    videoTour: property?.videoTour ?? "",
    agentName: property?.agent.name ?? "dnb Homes Agent",
    agentPhone: property?.agent.phone ?? "+256",
    agentEmail: property?.agent.email ?? "admin@nilebitlabs.com",
    agentPhoto: property?.agent.photo ?? "/brand/logo-light.svg",
    agentCompany: property?.agent.company ?? "dnb Homes",
    agentPosition: property?.agent.position ?? "Property Advisor",
    isFeatured: property?.isFeatured ?? false,
    isActive: property?.isActive ?? true
  };
}

export function PropertyForm({ property, onCancel, onSubmit }: PropertyFormProps) {
  const [form, setForm] = useState<FormState>(() => buildInitialState(property));
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingImages, setIsUploadingImages] = useState(false);
  const [isUploadingVideos, setIsUploadingVideos] = useState(false);
  const title = useMemo(() => (property ? "Edit Property" : "Add Property"), [property]);

  function updateField<TKey extends keyof FormState>(key: TKey, value: FormState[TKey]) {
    setForm((current: FormState) => ({ ...current, [key]: value }));
  }

  async function uploadSelectedFiles(
    event: ChangeEvent<HTMLInputElement>,
    mediaType: "image" | "video"
  ) {
    const files = Array.from(event.target.files ?? []);
    if (files.length === 0) return;

    if (mediaType === "image") setIsUploadingImages(true);
    if (mediaType === "video") setIsUploadingVideos(true);

    try {
      const uploadedFiles = await uploadMedia(files);
      const urls = uploadedFiles
        .filter((file) => file.type === mediaType)
        .map((file) => file.url);
      const key = mediaType === "image" ? "images" : "videos";
      const currentUrls = splitValues(form[key]);
      updateField(key, [...currentUrls, ...urls].join(", "));
    } finally {
      event.target.value = "";
      if (mediaType === "image") setIsUploadingImages(false);
      if (mediaType === "video") setIsUploadingVideos(false);
    }
  }

  async function submitForm(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSaving(true);
    const payload: PropertyPayload = {
      title: form.title.trim(),
      description: form.description.trim(),
      location: form.location.trim(),
      region: form.region.trim(),
      district: form.district.trim(),
      area: form.area.trim(),
      type: form.type,
      purpose: form.purpose,
      price: numberValue(form.price, 0),
      appointmentFee: numberValue(form.appointmentFee, 0),
      size: {
        totalArea: numberValue(form.totalArea, 0),
        bedrooms: numberValue(form.bedrooms, 0),
        bathrooms: numberValue(form.bathrooms, 0),
        parking: numberValue(form.parking, 0),
        dimensions: form.dimensions.trim()
      },
      tags: splitValues(form.tags),
      amenities: splitValues(form.amenities),
      images: splitValues(form.images),
      videos: splitValues(form.videos),
      videoTour: form.videoTour.trim(),
      agent: {
        name: form.agentName.trim(),
        phone: form.agentPhone.trim(),
        email: form.agentEmail.trim(),
        photo: form.agentPhoto.trim(),
        company: form.agentCompany.trim(),
        position: form.agentPosition.trim()
      },
      isFeatured: form.isFeatured,
      isActive: form.isActive,
      datePosted: property?.datePosted
    };

    try {
      await onSubmit(payload);
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true">
      <div className="modal">
        <div className="modal-head">
          <h2 className="modal-title">{title}</h2>
          <button className="icon-button" type="button" onClick={onCancel} aria-label="Close form">
            <X size={18} />
          </button>
        </div>
        <form className="form" onSubmit={submitForm}>
          <div className="form-grid">
            <label className="field full">
              <span className="label">Title</span>
              <input className="input" required value={form.title} onChange={(event) => updateField("title", event.target.value)} />
            </label>
            <label className="field full">
              <span className="label">Description</span>
              <textarea className="textarea" required value={form.description} onChange={(event) => updateField("description", event.target.value)} />
            </label>
            <label className="field">
              <span className="label">Location</span>
              <input className="input" required value={form.location} onChange={(event) => updateField("location", event.target.value)} />
            </label>
            <label className="field">
              <span className="label">Region</span>
              <input className="input" required value={form.region} onChange={(event) => updateField("region", event.target.value)} />
            </label>
            <label className="field">
              <span className="label">District</span>
              <input className="input" value={form.district} onChange={(event) => updateField("district", event.target.value)} />
            </label>
            <label className="field">
              <span className="label">Area</span>
              <input className="input" value={form.area} onChange={(event) => updateField("area", event.target.value)} />
            </label>
            <label className="field">
              <span className="label">Type</span>
              <select className="select" value={form.type} onChange={(event) => updateField("type", event.target.value as PropertyType)}>
                {propertyTypes.map((type: PropertyType) => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </label>
            <label className="field">
              <span className="label">Purpose</span>
              <select className="select" value={form.purpose} onChange={(event) => updateField("purpose", event.target.value as PropertyPurpose)}>
                {propertyPurposes.map((purpose: PropertyPurpose) => (
                  <option key={purpose} value={purpose}>{purpose}</option>
                ))}
              </select>
            </label>
            <label className="field">
              <span className="label">Price UGX</span>
              <input className="input" required min="0" type="number" value={form.price} onChange={(event) => updateField("price", event.target.value)} />
            </label>
            <label className="field">
              <span className="label">Appointment Fee UGX</span>
              <input className="input" required min="0" type="number" value={form.appointmentFee} onChange={(event) => updateField("appointmentFee", event.target.value)} />
            </label>
            <label className="field">
              <span className="label">Total Area</span>
              <input className="input" required min="0" type="number" value={form.totalArea} onChange={(event) => updateField("totalArea", event.target.value)} />
            </label>
            <label className="field">
              <span className="label">Dimensions</span>
              <input className="input" value={form.dimensions} onChange={(event) => updateField("dimensions", event.target.value)} />
            </label>
            <label className="field">
              <span className="label">Bedrooms</span>
              <input className="input" min="0" type="number" value={form.bedrooms} onChange={(event) => updateField("bedrooms", event.target.value)} />
            </label>
            <label className="field">
              <span className="label">Bathrooms</span>
              <input className="input" min="0" type="number" value={form.bathrooms} onChange={(event) => updateField("bathrooms", event.target.value)} />
            </label>
            <label className="field">
              <span className="label">Parking</span>
              <input className="input" min="0" type="number" value={form.parking} onChange={(event) => updateField("parking", event.target.value)} />
            </label>
            <label className="field">
              <span className="label">Video Tour URL</span>
              <input className="input" value={form.videoTour} onChange={(event) => updateField("videoTour", event.target.value)} />
            </label>
            <label className="field full">
              <span className="label">Tags</span>
              <input className="input" value={form.tags} onChange={(event) => updateField("tags", event.target.value)} />
            </label>
            <label className="field full">
              <span className="label">Amenities</span>
              <input className="input" value={form.amenities} onChange={(event) => updateField("amenities", event.target.value)} />
            </label>
            <label className="field full">
              <span className="label">Images</span>
              <div className="upload-box">
                <ImagePlus size={20} />
                <div>
                  <strong>Upload listing photos</strong>
                  <span>Choose one or more images from this device.</span>
                </div>
                <input
                  accept="image/*"
                  multiple
                  type="file"
                  onChange={(event) => void uploadSelectedFiles(event, "image")}
                />
              </div>
              {isUploadingImages ? <span className="helper">Uploading images...</span> : null}
              <textarea className="textarea" required value={form.images} onChange={(event) => updateField("images", event.target.value)} />
              <MediaPreview urls={splitValues(form.images)} type="image" />
            </label>
            <label className="field full">
              <span className="label">Videos</span>
              <div className="upload-box">
                <Video size={20} />
                <div>
                  <strong>Upload walkthrough videos</strong>
                  <span>MP4 and other browser-playable videos are supported.</span>
                </div>
                <input
                  accept="video/*"
                  multiple
                  type="file"
                  onChange={(event) => void uploadSelectedFiles(event, "video")}
                />
              </div>
              {isUploadingVideos ? <span className="helper">Uploading videos...</span> : null}
              <textarea className="textarea" value={form.videos} onChange={(event) => updateField("videos", event.target.value)} />
              <MediaPreview urls={splitValues(form.videos)} type="video" />
            </label>
            <label className="field">
              <span className="label">Agent Name</span>
              <input className="input" required value={form.agentName} onChange={(event) => updateField("agentName", event.target.value)} />
            </label>
            <label className="field">
              <span className="label">Agent Phone</span>
              <input className="input" required value={form.agentPhone} onChange={(event) => updateField("agentPhone", event.target.value)} />
            </label>
            <label className="field">
              <span className="label">Agent Email</span>
              <input className="input" required type="email" value={form.agentEmail} onChange={(event) => updateField("agentEmail", event.target.value)} />
            </label>
            <label className="field">
              <span className="label">Agent Photo</span>
              <input className="input" required value={form.agentPhoto} onChange={(event) => updateField("agentPhoto", event.target.value)} />
            </label>
            <label className="field">
              <span className="label">Agent Company</span>
              <input className="input" value={form.agentCompany} onChange={(event) => updateField("agentCompany", event.target.value)} />
            </label>
            <label className="field">
              <span className="label">Agent Position</span>
              <input className="input" value={form.agentPosition} onChange={(event) => updateField("agentPosition", event.target.value)} />
            </label>
          </div>
          <div className="switch-row">
            <label className="switch-label">
              <input type="checkbox" checked={form.isActive} onChange={(event) => updateField("isActive", event.target.checked)} />
              Active
            </label>
            <label className="switch-label">
              <input type="checkbox" checked={form.isFeatured} onChange={(event) => updateField("isFeatured", event.target.checked)} />
              Featured
            </label>
          </div>
          <div className="actions">
            <button className="button" type="button" onClick={onCancel}>Cancel</button>
            <button className="button primary" type="submit" disabled={isSaving}>
              {isSaving ? "Saving..." : "Save Property"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function MediaPreview({ urls, type }: { urls: string[]; type: "image" | "video" }) {
  if (urls.length === 0) return null;

  return (
    <div className="media-preview">
      {urls.map((url: string) => (
        <a className="media-chip" href={url} key={url} target="_blank" rel="noreferrer">
          {type === "image" ? <ImagePlus size={14} /> : <UploadCloud size={14} />}
          <span>{url}</span>
        </a>
      ))}
    </div>
  );
}
