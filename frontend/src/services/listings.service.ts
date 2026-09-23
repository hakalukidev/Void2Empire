// Listings Service Layer — coin/asset listing applications (REQ-067).
// Stubs shaped for the documented endpoints (Sec 18.2, line 1142):
//   Listings | POST/GET /listings/applications | user | required (POST) | 3/day | files → R2
// Statuses mirror the Sec 30 state machine. The review/approval workflow and
// its transitions are admin-side and remain pending (DR-031) — this client only
// submits and reads status; it never advances the state machine.

import { apiClient } from "@/lib/api/client";

export type ListingApplicationStatus =
  | "submitted"
  | "under_review"
  | "approved"
  | "rejected"
  | "needs_info"
  | "listed";

export interface SubmitListingInput {
  coinName: string;
  symbol: string;
  website?: string;
  explorer?: string;
  description: string;
  /** Supporting documents; uploaded to R2 via presigned PUT (backend). */
  documents: File[];
}

export interface ListingApplication {
  id: string;
  coinName: string;
  symbol: string;
  status: ListingApplicationStatus;
  createdAt: string;
}

export async function submitListingApplication(input: SubmitListingInput): Promise<ListingApplication> {
  // TODO(backend): obtain presigned R2 URLs, upload input.documents, then
  //   const { data } = await apiClient.post<ListingApplication>("/listings/applications", payload, { headers: { "Idempotency-Key": crypto.randomUUID() } }); return data;
  void apiClient;
  return {
    id: `LIST-${Date.now()}`,
    coinName: input.coinName,
    symbol: input.symbol,
    status: "submitted",
    createdAt: new Date().toISOString(),
  };
}

export async function fetchMyListingApplications(): Promise<ListingApplication[]> {
  // TODO(backend): const { data } = await apiClient.get<ListingApplication[]>("/listings/applications"); return data;
  void apiClient;
  return [];
}
