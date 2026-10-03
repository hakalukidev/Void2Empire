// Content Service Layer (public content modules)
// Shapes stubs for the documented public endpoints (Sec 18.2, line 1145):
//   Content | GET /faq, /announcements, /legal/{slug} | public | cached
// Announcements are admin-managed (REQ-072 / REQ-081, DB `announcements`,
// draft/published). Only *published* items are served to users.
// To connect backend: replace each body with an apiClient call.

import { apiClient } from "@/lib/api/client";

export type AnnouncementType = "info" | "warning" | "success";

export interface Announcement {
  id: string;
  title: string;
  /** Plain-text / pre-sanitized body. Render as text — never dangerouslySetInnerHTML. */
  body: string;
  type: AnnouncementType;
  publishedAt: string;
}

const MOCK_ANNOUNCEMENTS: Announcement[] = [
  {
    id: "ANN-002",
    title: "New Trading Pairs Added",
    body: "Spot and Futures markets are open for the platform coins — V2E, Infinity, River and Onion. Leverage and margin settings are available on each market page.",
    type: "success",
    publishedAt: "2024-09-20",
  },
  {
    id: "ANN-001",
    title: "System Maintenance Scheduled",
    body: "The platform will undergo scheduled maintenance. Trading and withdrawals may be briefly unavailable during this window.",
    type: "warning",
    publishedAt: "2024-09-21",
  },
];

export async function fetchAnnouncements(): Promise<Announcement[]> {
  // TODO(backend): const { data } = await apiClient.get<Announcement[]>("/announcements"); return data;
  void apiClient;
  return MOCK_ANNOUNCEMENTS;
}
