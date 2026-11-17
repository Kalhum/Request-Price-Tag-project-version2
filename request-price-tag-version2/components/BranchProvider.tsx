"use client";

import { createContext, useContext, useSyncExternalStore } from "react";
import type { ReactNode } from "react";
import { BRANCHES, DEFAULT_BRANCH_ID, isBranchId } from "@/types/branch";
import type { BranchId } from "@/types/branch";

type BranchSnapshot = {
  branchId: BranchId;
  isReady: boolean;
};

type BranchContextValue = BranchSnapshot & {
  branchName: string;
  selectBranch: (branchId: BranchId) => void;
};

const STORAGE_KEY = "request-price-tag.branch-id";
const SERVER_SNAPSHOT: BranchSnapshot = {
  branchId: DEFAULT_BRANCH_ID,
  isReady: false,
};
let snapshot = SERVER_SNAPSHOT;
const listeners = new Set<() => void>();
const BranchContext = createContext<BranchContextValue | null>(null);

function emitChange() {
  for (const listener of listeners) listener();
}

function subscribe(listener: () => void) {
  listeners.add(listener);

  if (typeof window !== "undefined") {
    try {
      const savedBranchId = window.localStorage.getItem(STORAGE_KEY);
      snapshot = {
        branchId: isBranchId(savedBranchId)
          ? savedBranchId
          : DEFAULT_BRANCH_ID,
        isReady: true,
      };
    } catch (error) {
      console.error("Unable to read the selected branch from local storage", error);
      snapshot = { ...SERVER_SNAPSHOT, isReady: true };
    }

    const handleStorage = (event: StorageEvent) => {
      if (event.key !== STORAGE_KEY) return;
      snapshot = {
        branchId: isBranchId(event.newValue)
          ? event.newValue
          : DEFAULT_BRANCH_ID,
        isReady: true,
      };
      emitChange();
    };

    window.addEventListener("storage", handleStorage);
    listener();

    return () => {
      listeners.delete(listener);
      window.removeEventListener("storage", handleStorage);
    };
  }

  return () => listeners.delete(listener);
}

function getSnapshot() {
  return snapshot;
}

function getServerSnapshot() {
  return SERVER_SNAPSHOT;
}

function selectBranch(branchId: BranchId) {
  try {
    window.localStorage.setItem(STORAGE_KEY, branchId);
  } catch (error) {
    console.error("Unable to save the selected branch to local storage", error);
  }
  snapshot = { branchId, isReady: true };
  emitChange();
}

export function BranchProvider({ children }: { children: ReactNode }) {
  const { branchId, isReady } = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  );
  const value: BranchContextValue = {
    branchId,
    branchName: BRANCHES.find((branch) => branch.id === branchId)?.name ?? branchId,
    isReady,
    selectBranch,
  };

  return <BranchContext.Provider value={value}>{children}</BranchContext.Provider>;
}

export function useBranch() {
  const context = useContext(BranchContext);
  if (!context) {
    throw new Error("useBranch must be used within a BranchProvider");
  }
  return context;
}
