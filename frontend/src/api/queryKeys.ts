export const queryKeys = {
  complaints: ["complaints"] as const,
  complaint: (id: string) => ["complaints", id] as const,
};