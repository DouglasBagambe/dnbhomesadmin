import type {
  UploadedFile,
  Appointment,
  Property,
  PropertyListResponse,
  PropertyPayload
} from "./types";

const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3000/api";

async function request<TResponse>(
  path: string,
  options: RequestInit = {}
): Promise<TResponse> {
  const response = await fetch(`${apiBaseUrl}${path}`, {
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

  const response = await fetch(`${apiBaseUrl}/uploads`, {
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
