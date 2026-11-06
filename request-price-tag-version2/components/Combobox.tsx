"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { KeyboardEvent, ReactNode } from "react";
import { Check, ChevronDown, Loader2, X } from "lucide-react";
import { cn } from "@/libs/utils";
import type { ComboboxSize } from "@/types/ui";

type ComboboxValue = string | number;

export type ComboboxOption<T extends ComboboxValue> = {
  label: string;
  value: T;
  disabled?: boolean;
};

type Props<T extends ComboboxValue> = {
  options: ComboboxOption<T>[];
  value: T | null;
  onChange: (value: T | null) => void;
  placeholder?: string;
  size?: ComboboxSize;
  disabled?: boolean;
  isLoading?: boolean;
  clearable?: boolean;
  noOptionsMessage?: ReactNode;
  filterFn?: (option: ComboboxOption<T>, query: string) => boolean;
  renderOption?: (
    option: ComboboxOption<T>,
    state: { active: boolean; selected: boolean },
  ) => ReactNode;
  className?: string;
  id?: string;
  name?: string;
};

const sizeClasses: Record<ComboboxSize, string> = {
  sm: "px-2.5 py-1.5 text-sm",
  md: "px-3.5 py-2 text-sm",
  lg: "px-4 py-2.5 text-base",
};

const defaultFilterFn = <T extends ComboboxValue>(
  option: ComboboxOption<T>,
  query: string,
) => option.label.toLowerCase().includes(query.trim().toLowerCase());

/**
 * Select ที่พิมพ์ค้นหาได้ ควบคุมด้วย value/onChange จากภายนอก (controlled component)
 */
export default function Combobox<T extends ComboboxValue>({
  options,
  value,
  onChange,
  placeholder = "เลือกรายการ...",
  size = "md",
  disabled = false,
  isLoading = false,
  clearable = false,
  noOptionsMessage = "ไม่พบรายการ",
  filterFn = defaultFilterFn,
  renderOption,
  className,
  id,
  name,
}: Props<T>) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const selectedOption = useMemo(
    () => options.find((option) => option.value === value) ?? null,
    [options, value],
  );

  const filteredOptions = useMemo(
    () =>
      query.trim()
        ? options.filter((option) => filterFn(option, query))
        : options,
    [options, query, filterFn],
  );

  useEffect(() => {
    if (!open) {
      setQuery("");
      setActiveIndex(0);
    }
  }, [open]);

  useEffect(() => {
    setActiveIndex(0);
  }, [query]);

  useEffect(() => {
    if (!open) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  const selectOption = (option: ComboboxOption<T>) => {
    if (option.disabled) return;
    onChange(option.value);
    setOpen(false);
    inputRef.current?.blur();
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (disabled) return;

    if (event.key === "ArrowDown") {
      event.preventDefault();
      if (!open) {
        setOpen(true);
        return;
      }
      setActiveIndex(
        (prev) => (prev + 1) % Math.max(filteredOptions.length, 1),
      );
      return;
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex(
        (prev) =>
          (prev - 1 + Math.max(filteredOptions.length, 1)) %
          Math.max(filteredOptions.length, 1),
      );
      return;
    }

    if (event.key === "Enter") {
      event.preventDefault();
      const active = filteredOptions[activeIndex];
      if (open && active) {
        selectOption(active);
      } else {
        setOpen(true);
      }
      return;
    }

    if (event.key === "Escape") {
      setOpen(false);
      return;
    }

    if (event.key === "Tab") {
      setOpen(false);
    }
  };

  return (
    <div ref={containerRef} className={cn("relative w-full", className)}>
      <div
        className={cn(
          "flex w-full items-center gap-2 rounded-lg border border-slate-300 bg-white transition-colors focus-within:border-sky-500",
          sizeClasses[size],
          disabled && "cursor-not-allowed bg-slate-50 opacity-60",
        )}
      >
        <input
          ref={inputRef}
          id={id}
          name={name}
          role="combobox"
          aria-expanded={open}
          aria-autocomplete="list"
          disabled={disabled}
          value={open ? query : (selectedOption?.label ?? "")}
          placeholder={placeholder}
          onFocus={() => setOpen(true)}
          onChange={(event) => {
            setQuery(event.target.value);
            setOpen(true);
          }}
          onKeyDown={handleKeyDown}
          className="w-full flex-1 bg-transparent outline-none placeholder:text-slate-400 disabled:cursor-not-allowed"
        />

        {isLoading && (
          <Loader2 className="h-4 w-4 shrink-0 animate-spin text-slate-400" />
        )}

        {clearable && selectedOption && !isLoading && (
          <button
            type="button"
            aria-label="ล้างค่าที่เลือก"
            onClick={() => {
              onChange(null);
              setQuery("");
            }}
            className="shrink-0 rounded p-0.5 text-slate-400 hover:text-slate-600"
          >
            <X className="h-4 w-4" />
          </button>
        )}

        <ChevronDown
          className={cn(
            "h-4 w-4 shrink-0 text-slate-400 transition-transform",
            open && "rotate-180",
          )}
        />
      </div>

      {open && (
        <ul className="absolute z-20 mt-1 max-h-60 w-full overflow-y-auto rounded-lg border border-slate-200 bg-white py-1 shadow-lg">
          {filteredOptions.length === 0 ? (
            <li className="px-3.5 py-2 text-sm text-slate-400">
              {noOptionsMessage}
            </li>
          ) : (
            filteredOptions.map((option, index) => {
              const selected = option.value === value;
              const active = index === activeIndex;

              return (
                <li
                  key={option.value}
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => selectOption(option)}
                  onMouseEnter={() => setActiveIndex(index)}
                  aria-selected={selected}
                  className={cn(
                    "flex cursor-pointer items-center justify-between px-3.5 py-2 text-sm text-slate-700",
                    active && "bg-sky-50",
                    option.disabled && "cursor-not-allowed text-slate-300",
                  )}
                >
                  {renderOption
                    ? renderOption(option, { active, selected })
                    : option.label}
                  {selected && <Check className="h-4 w-4 text-sky-600" />}
                </li>
              );
            })
          )}
        </ul>
      )}
    </div>
  );
}
