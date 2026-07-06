import { AnedyaErrorCodes } from "./errors";

export function getAnedyaErrorMessage(code: number): string {
  const reverseMap = Object.fromEntries(
    Object.entries(AnedyaErrorCodes).map(([k, v]) => [v, k]),
  );
  return (reverseMap[code] as string) || "UnknownErrorCode";
}
