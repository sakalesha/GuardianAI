import { z } from "zod";
import { ROLES } from "@/types/auth";
import {
  isComplaintCategory,
  isComplaintStatus,
  type Complaint,
  type ComplaintCategory,
  type ComplaintStatus,
} from "@/types/complaint";

function normalizeStatus(value: string): ComplaintStatus {
  if (isComplaintStatus(value)) return value;
  return "NEEDS_HUMAN_REVIEW";
}

export const authUserSchema = z.object({
  uid: z.string().min(1),
  name: z.string(),
  email: z.string(),
  role: z.enum(ROLES),
});

export const authResponseSchema = z.object({
  token: z.string().min(1),
  user: authUserSchema,
});

export const detectionSchema = z.object({
  label: z.string(),
  original_object: z.string().optional(),
  confidence: z.number(),
  box: z.tuple([z.number(), z.number(), z.number(), z.number()]),
});

export const mlMetadataSchema = z.object({
  detectedIssues: z.array(detectionSchema),
  hasValidIssue: z.boolean(),
});

export const verificationDataSchema = z.object({
  isValid: z.boolean().nullish(),
  distanceMeters: z.number().nullish(),
  timeDifferenceHours: z.number().nullish(),
  reason: z.string().nullish(),
});

export const historyEntrySchema = z.object({
  status: z.string().transform(normalizeStatus),
  timestamp: z.string(),
  user: z.string().nullish(),
  message: z.string().nullish(),
});

export const complaintSchema = z
  .object({
    id: z.string(),
    userId: z.string(),
    category: z
      .string()
      .transform((v): ComplaintCategory => (isComplaintCategory(v) ? v : "Other")),
    description: z.string().nullish(),
    imageUrl: z.string(),
    latitude: z.number(),
    longitude: z.number(),
    timestamp: z.string(),
    slaDeadline: z.string(),
    status: z.string().transform(normalizeStatus),
    mlMetadata: mlMetadataSchema.optional(),
    slaBreachLogged: z.boolean().optional(),
    verificationData: verificationDataSchema.optional(),
    resolutionImageUrl: z.string().nullish(),
    resolutionTimestamp: z.string().nullish(),
    resolutionLatitude: z.number().nullish(),
    resolutionLongitude: z.number().nullish(),
    verificationScore: z.number().nullish(),
    verificationLabel: z.string().nullish(),
    resolvedBy: z.string().nullish(),
    history: z.array(historyEntrySchema).optional(),
    createdAt: z.string(),
    updatedAt: z.string(),
  })
  .transform(
    (raw): Complaint => ({
      id: raw.id,
      userId: raw.userId,
      category: raw.category,
      description: raw.description ?? undefined,
      imageUrl: raw.imageUrl,
      latitude: raw.latitude,
      longitude: raw.longitude,
      timestamp: raw.timestamp,
      slaDeadline: raw.slaDeadline,
      status: raw.status,
      mlMetadata: {
        detectedIssues: raw.mlMetadata?.detectedIssues ?? [],
        hasValidIssue: raw.mlMetadata?.hasValidIssue ?? false,
      },
      slaBreachLogged: raw.slaBreachLogged ?? false,
      verificationData: {
        isValid: raw.verificationData?.isValid ?? false,
        distanceMeters: raw.verificationData?.distanceMeters ?? 0,
        timeDifferenceHours: raw.verificationData?.timeDifferenceHours ?? 0,
        reason: raw.verificationData?.reason ?? "",
      },
      resolutionImageUrl: raw.resolutionImageUrl ?? undefined,
      resolutionTimestamp: raw.resolutionTimestamp ?? undefined,
      resolutionLatitude: raw.resolutionLatitude ?? undefined,
      resolutionLongitude: raw.resolutionLongitude ?? undefined,
      verificationScore: raw.verificationScore ?? undefined,
      verificationLabel: raw.verificationLabel ?? undefined,
      resolvedBy: raw.resolvedBy ?? undefined,
      history: (raw.history ?? []).map((entry) => ({
        status: entry.status,
        timestamp: entry.timestamp,
        user: entry.user ?? undefined,
        message: entry.message ?? undefined,
      })),
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
    }),
  );