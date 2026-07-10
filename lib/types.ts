export type PropertyPurpose = "rent" | "sale" | "shortStay";

export type PropertyType =
  | "apartment"
  | "house"
  | "villa"
  | "commercial"
  | "land"
  | "studio";

export type PropertySize = {
  totalArea: number;
  bedrooms?: number;
  bathrooms?: number;
  parking?: number;
  dimensions?: string;
};

export type PropertyAgent = {
  name: string;
  phone: string;
  email: string;
  photo: string;
  company?: string;
  position?: string;
};

export type Property = {
  _id: string;
  title: string;
  description: string;
  location: string;
  type: PropertyType;
  purpose: PropertyPurpose;
  price: number;
  appointmentFee: number;
  size: PropertySize;
  images: string[];
  videos: string[];
  tags: string[];
  amenities: string[];
  agent: PropertyAgent;
  isFeatured: boolean;
  isActive?: boolean;
  datePosted?: string;
  views: number;
  favorites: number;
  rating?: number;
  reviewCount: number;
  region: string;
  district?: string;
  area?: string;
  videoTour?: string;
  createdAt?: string;
  updatedAt?: string;
};

export type PropertyPayload = Omit<
  Property,
  "_id" | "views" | "favorites" | "rating" | "reviewCount" | "createdAt" | "updatedAt"
>;

export type PropertyListResponse = {
  properties: Property[];
  currentPage: number;
  totalPages: number;
  totalProperties: number;
};

export type Appointment = {
  _id: string;
  propertyId: string;
  name: string;
  email: string;
  phone: string;
  appointmentTime: string;
  duration: string;
  purpose: string;
};

export type UploadedFile = {
  url: string;
  name: string;
  type: "image" | "video";
  size: number;
};

export type ToastState = {
  type: "success" | "error";
  message: string;
} | null;
