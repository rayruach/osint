export interface Post {
  id: string;
  authorId: string | null;
  authorName: string;
  badge: string;
  sourceUrl: string | null;
  status: "Active" | "Resolved";
  title: string;
  body: string;
  location: string;
  state: string;
  lga: string;
  town: string;
  mediaUrl: string | null;
  isSensitive: boolean;
  isSOS: boolean;
  isPushed: boolean;
  createdAt: string;
  confirmations: number;
  isConfirmed: boolean;
}

export interface AdminReport {
  id: string;
  contact: string;
  category: string;
  title: string;
  body: string;
  location: string;
  state: string;
  source: string;
  mediaUrl: string | null;
  status: "Pending" | "Approved" | "Rejected";
  bountyPaid: boolean;
  confirmations: number;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  ein: string;
  createdAt: string;
}

export interface SosAlert {
  id: string;
  userId: string | null;
  ein: string | null;
  phone: string | null;
  fullName: string | null;
  sosType: string;
  location: string;
  latitude: number | null;
  longitude: number | null;
  status: "Ongoing" | "Resolved";
  resolvedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Analytics {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
  totalConfirms: number;
  bountiesTotal: number;
  categories: { name: string; count: number; pct: number }[];
  states: { name: string; count: number; pct: number }[];
}
