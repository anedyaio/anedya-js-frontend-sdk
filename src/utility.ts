import { AnedyaError } from "./errors";

export function getAnedyaErrorMessage(code: number): string {
  const reverseMap = Object.fromEntries(
    Object.entries(AnedyaError).map(([k, v]) => [v, k])
  );
  return reverseMap[code] || "UnknownErrorCode";
}