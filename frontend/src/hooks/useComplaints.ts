import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createComplaint,
  deleteComplaint,
  getComplaint,
  listComplaints,
  updateComplaintStatus,
} from "@/api/complaints";
import { queryKeys } from "@/api/queryKeys";
import type {
  Complaint,
  CreateComplaintPayload,
  UpdateStatusPayload,
} from "@/types/complaint";

export const COMPLAINTS_POLL_INTERVAL = 30_000;

export function useComplaints() {
  return useQuery({
    queryKey: queryKeys.complaints,
    queryFn: () => listComplaints(),
    refetchInterval: COMPLAINTS_POLL_INTERVAL,
    refetchOnWindowFocus: true,
  });
}

export function useComplaint(id: string | undefined) {
  const queryClient = useQueryClient();
  return useQuery({
    queryKey: queryKeys.complaint(id ?? ""),
    queryFn: () => getComplaint(id as string),
    enabled: !!id,
    refetchInterval: COMPLAINTS_POLL_INTERVAL,
    placeholderData: () =>
      queryClient
        .getQueryData<Complaint[]>(queryKeys.complaints)
        ?.find((c) => c.id === id),
  });
}

export function useCreateComplaint() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateComplaintPayload) => createComplaint(payload),
    onSuccess: (created) => {
      queryClient.setQueryData<Complaint[]>(queryKeys.complaints, (prev = []) => [
        created,
        ...prev,
      ]);
      queryClient.setQueryData(queryKeys.complaint(created.id), created);
    },
  });
}

export function useUpdateComplaintStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateStatusPayload }) =>
      updateComplaintStatus(id, payload),
    onSuccess: (updated) => {
      queryClient.setQueryData<Complaint[]>(queryKeys.complaints, (prev = []) =>
        prev.map((c) => (c.id === updated.id ? updated : c)),
      );
      queryClient.setQueryData(queryKeys.complaint(updated.id), updated);
    },
    onError: (_err, { id }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.complaints });
      queryClient.invalidateQueries({ queryKey: queryKeys.complaint(id) });
    },
  });
}

export function useDeleteComplaint() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, userId }: { id: string; userId: string }) =>
      deleteComplaint(id, userId),
    onSuccess: (_res, { id }) => {
      queryClient.setQueryData<Complaint[]>(queryKeys.complaints, (prev = []) =>
        prev.filter((c) => c.id !== id),
      );
      queryClient.removeQueries({ queryKey: queryKeys.complaint(id) });
    },
  });
}