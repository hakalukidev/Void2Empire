// Support ticket service — REQ-070. Stub shaped for the documented endpoint
// (Sec 18.2, line 1144): Support | POST/GET /tickets | user | — | 10/hour.
//
// Deliberately NOT modelled here: ticket categories and SLA (DR-044 is open), so the client
// sends a free-text subject and message only. Live chat is not part of this build — tickets
// are the documented channel.

import { apiClient } from "@/lib/api/client";

export interface SubmitTicketInput {
  subject: string;
  message: string;
}

export interface SupportTicket {
  id: string;
  subject: string;
  /** Sec 30 state #32 starts at `open`; only staff advance a ticket, so the client stops here. */
  status: "open";
  createdAt: string;
}

export async function submitSupportTicket(input: SubmitTicketInput): Promise<SupportTicket> {
  // TODO(backend): const { data } = await apiClient.post<SupportTicket>("/tickets", input, { headers: { "Idempotency-Key": crypto.randomUUID() } }); return data;
  void apiClient;
  return {
    id: `TCK-${Date.now()}`,
    subject: input.subject,
    status: "open",
    createdAt: new Date().toISOString(),
  };
}
