import { apiRequest } from "@/api/client";
import { complaintSchema } from "@/api/schemas";
import type {
  Complaint,
  CreateComplaintPayload,
  UpdateStatusPayload,
} from "@/types/complaint";

export function listComplaints(signal?: AbortSignal): Promise<Complaint[]> {
  return apiRequest("/complaints", {
    schema: complaintSchema.array(),
    signal,
  });
}

export function getComplaint(id: string, signal?: AbortSignal): Promise<Complaint> {
  return apiRequest(`/complaints/${encodeURIComponent(id)}`, {
    schema: complaintSchema,
    signal,
  });
}

export function createComplaint(payload: CreateComplaintPayload): Promise<Complaint> {
  return apiRequest("/complaints", {
    method: "POST",
    body: payload,
    schema: complaintSchema,
    timeoutMs: 45_000,
  });
}

export function updateComplaintStatus(
  id: string,
  payload: UpdateStatusPayload,
): Promise<Complaint> {
  return apiRequest(`/complaints/${encodeURIComponent(id)}/status`, {
    method: "PATCH",
    body: payload,
    schema: complaintSchema,
    timeoutMs: 45_000,
  });
}

export function deleteComplaint(id: string, userId: string): Promise<{ message: string }> {
  return apiRequest(`/complaints/${encodeURIComponent(id)}`, {
    method: "DELETE",
    body: { userId },
  });
}

export function triggerSlaCheck(): Promise<{ message: string }> {
  return apiRequest("/complaints/trigger-sla-check", {
    method: "POST",
  });
}