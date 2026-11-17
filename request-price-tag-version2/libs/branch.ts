import { DEFAULT_BRANCH_ID, isBranchId } from "@/types/branch";
import type { BranchId } from "@/types/branch";
import { ValidationError } from "@/libs/input-validator";

export function parseBranchId(value: string | null): BranchId {
  if (!value) return DEFAULT_BRANCH_ID;
  if (isBranchId(value)) return value;
  throw new ValidationError("branchId is invalid");
}
