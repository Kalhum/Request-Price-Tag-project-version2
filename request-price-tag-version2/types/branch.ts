export const BRANCHES = [
  { id: "P0000", name: "P0000 - ร้านแรกทดลอง" },
  { id: "P0115", name: "P0115 - สาขาตัวอย่าง" },
] as const;

export type BranchId = (typeof BRANCHES)[number]["id"];

export const DEFAULT_BRANCH_ID: BranchId = "P0000";

export function isBranchId(value: unknown): value is BranchId {
  return BRANCHES.some((branch) => branch.id === value);
}
