import type {
  UploadedFile,
  Appointment,
  Property,
  PropertyListResponse,
  PropertyPayload
} from "./types";

function getApiBaseUrl(): string {
  if (process.env.NEXT_PUBLIC_API_BASE_URL) {
    return process.env.NEXT_PUBLIC_API_BASE_URL;
  }

  if (typeof window !== "undefined") {
    return `${window.location.protocol}//${window.location.hostname}:3000/api`;
  }

  return "http://localhost:3000/api";
}

async function request<TResponse>(
  path: string,
  options: RequestInit = {}
): Promise<TResponse> {
  const response = await fetch(`${getApiBaseUrl()}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers
    }
  });

  if (!response.ok) {
    const errorBody = (await response.json().catch(() => null)) as {
      message?: string;
    } | null;
    throw new Error(errorBody?.message ?? `Request failed with ${response.status}`);
  }

  return (await response.json()) as TResponse;
}

export async function getProperties(): Promise<PropertyListResponse> {
  return request<PropertyListResponse>("/properties?limit=200");
}

export async function createProperty(payload: PropertyPayload): Promise<Property> {
  return request<Property>("/properties", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export async function updateProperty(
  id: string,
  payload: PropertyPayload
): Promise<Property> {
  return request<Property>(`/properties/${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload)
  });
}

export async function deleteProperty(id: string): Promise<{ message: string }> {
  return request<{ message: string }>(`/properties/${id}`, {
    method: "DELETE"
  });
}

export async function toggleFeatured(id: string): Promise<Property> {
  return request<Property>(`/properties/${id}/featured`, {
    method: "PATCH"
  });
}

export async function getAppointmentsForProperty(
  propertyId: string
): Promise<Appointment[]> {
  return request<Appointment[]>(`/appointments/property/${propertyId}`);
}

export async function uploadMedia(files: File[]): Promise<UploadedFile[]> {
  const formData = new FormData();
  files.forEach((file: File) => formData.append("files", file));

  const response = await fetch(`${getApiBaseUrl()}/uploads`, {
    method: "POST",
    body: formData
  });

  if (!response.ok) {
    const errorBody = (await response.json().catch(() => null)) as {
      message?: string;
    } | null;
    throw new Error(errorBody?.message ?? "Media upload failed");
  }

  const body = (await response.json()) as { files: UploadedFile[] };
  return body.files;
}
