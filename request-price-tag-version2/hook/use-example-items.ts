"use client";

import { useState } from "react";
import type { CreateExampleInput, ExampleItem, UpdateExampleInput } from "@/types/example";

export function useExampleItems() {
  const [items, setItems] = useState<ExampleItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createItem = async (input: CreateExampleInput): Promise<ExampleItem | null> => {
    setIsSubmitting(true);
    try {
      const newItem: ExampleItem = {
        id: `example-${Date.now()}`,
        title: input.title,
        description: input.description,
        status: input.status || "active",
        createdAt: new Date().toISOString(),
      };
      setItems((prev) => [newItem, ...prev]);
      return newItem;
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateItem = async (id: string, input: UpdateExampleInput): Promise<ExampleItem | null> => {
    setIsSubmitting(true);
    try {
      let updated: ExampleItem | null = null;
      setItems((prev) =>
        prev.map((item) => {
          if (item.id === id) {
            updated = { ...item, ...input, updatedAt: new Date().toISOString() };
            return updated;
          }
          return item;
        }),
      );
      return updated;
    } finally {
      setIsSubmitting(false);
    }
  };

  const removeItem = async (id: string): Promise<boolean> => {
    setIsSubmitting(true);
    try {
      setItems((prev) => prev.filter((item) => item.id !== id));
      return true;
    } finally {
      setIsSubmitting(false);
    }
  };

  const reload = async () => {
    setIsLoading(true);
    setIsLoading(false);
  };

  return {
    items,
    isLoading,
    isSubmitting,
    error,
    createItem,
    updateItem,
    removeItem,
    reload,
  };
}
