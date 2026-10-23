export type AdminRole = "super_admin" | "admin" | "editor";
export type AdminUser = {
  id: string;
  _id?: string;
  name: string;
  email: string;
  role: AdminRole;
  status: "active" | "suspended";
};
export type Media = {
  _id?: string;
  url: string;
  key?: string;
  type: "image" | "video";
  alt?: string;
};
export type Property = {
  _id: string;
  title: string;
  slug: string;
  description: string;
  purpose: "rent" | "sale" | "short_stay";
  type: string;
  price: { amount: number; currency: "UGX" | "USD"; period: string };
  location: {
    country: string;
    region: string;
    district: string;
    area: string;
    address: string;
    coordinates?: { type: "Point"; coordinates: number[] };
  };
  bedrooms?: number;
  bathrooms?: number;
  size?: number;
  sizeUnit: string;
  amenities: string[];
  tags: string[];
  media: Media[];
  cover?: Media;
  agent?: Agent;
  agency?: Agency;
  featured: boolean;
  verificationStatus: string;
  status: "draft" | "pending_review" | "published" | "archived";
  availabilityStatus?:
    | "available"
    | "reserved"
    | "rented"
    | "sold"
    | "unavailable";
  availabilityChangedAt?: string;
  availabilityVisibleUntil?: string;
  viewCount: number;
  updatedAt: string;
};
export type Agent = {
  _id: string;
  name: string;
  slug: string;
  agency?: Agency;
  phone?: string;
  whatsapp?: string;
  email?: string;
  photo?: string;
  verificationStatus: string;
  status: string;
  listingCount?: number;
  updatedAt: string;
};
export type Agency = {
  _id: string;
  name: string;
  slug: string;
  logo?: string;
  phone?: string;
  email?: string;
  website?: string;
  description?: string;
  listingCount?: number;
  agentCount?: number;
  verificationStatus: string;
  status: string;
};
export type Booking = {
  _id: string;
  reference: string;
  property?: Pick<Property, "_id" | "title" | "slug">;
  propertySnapshot?: { title: string; deleted?: boolean };
  guestName?: string;
  guestEmail?: string;
  guestPhone?: string;
  scheduledAt: string;
  duration?: number;
  notes?: string;
  adminNotes?: string;
  status: string;
  agent?: Pick<Agent, "_id" | "name">;
  createdAt: string;
};
export type AuditEvent = {
  _id: string;
  actor?: AdminUser;
  action: string;
  entityType: string;
  entityId?: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
};
export type Inquiry = {
  _id: string;
  kind: "contact" | "listing";
  name: string;
  email?: string;
  phone?: string;
  subject?: string;
  message: string;
  propertyType?: string;
  location?: string;
  role?: string;
  status: "new" | "in_progress" | "resolved" | "spam";
  adminNotes?: string;
  createdAt: string;
};
