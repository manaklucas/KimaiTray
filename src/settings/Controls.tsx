import type { ReactNode } from "react";

/* ── Field wrapper ──────────────────────────────────────────────── */

interface FieldGroupProps {
  label: string;
  description?: string;
  children: ReactNode;
  horizontal?: boolean;
}

export function FieldGroup({
  label,
  description,
  children,
  horizontal = false,
}: FieldGroupProps) {
  if (horizontal) {
    return (
      <div className="flex items-center justify-between gap-4 py-2">
        <div className="min-w-0">
          <div className="text-[13px] font-medium text-gray-700 dark:text-gray-300">
            {label}
          </div>
          {description && (
            <div className="text-[11px] text-gray-400 dark:text-gray-500">
              {description}
            </div>
          )}
        </div>
        <div className="shrink-0">{children}</div>
      </div>
    );
  }
  return (
    <div className="py-2">
      <div className="mb-1.5 text-[13px] font-medium text-gray-700 dark:text-gray-300">
        {label}
      </div>
      {description && (
        <div className="mb-2 text-[11px] text-gray-400 dark:text-gray-500">
          {description}
        </div>
      )}
      {children}
    </div>
  );
}

/* ── Section header ─────────────────────────────────────────────── */

export function SectionTitle({ children }: { children: ReactNode }) {
  return (
    <h2 className="mb-4 text-[15px] font-semibold text-gray-800 dark:text-gray-200">
      {children}
    </h2>
  );
}

export function SectionDescription({ children }: { children: ReactNode }) {
  return (
    <p className="mb-4 text-[12px] text-gray-400 dark:text-gray-500">
      {children}
    </p>
  );
}

export function Divider() {
  return <div className="my-3 border-t border-gray-100 dark:border-gray-800" />;
}

/* ── Toggle ─────────────────────────────────────────────────────── */

interface ToggleProps {
  checked: boolean;
  onChange: (value: boolean) => void;
  disabled?: boolean;
}

export function Toggle({ checked, onChange, disabled }: ToggleProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors
        focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-1
        ${checked ? "bg-blue-500" : "bg-gray-200 dark:bg-gray-700"}
        ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
    >
      <span
        className={`inline-block h-3.5 w-3.5 rounded-full bg-white shadow-sm transition-transform
          ${checked ? "translate-x-[18px]" : "translate-x-[3px]"}`}
      />
    </button>
  );
}

/* ── Text input ─────────────────────────────────────────────────── */

interface TextInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: "text" | "url" | "password";
  disabled?: boolean;
}

export function TextInput({
  value,
  onChange,
  placeholder,
  type = "text",
  disabled,
}: TextInputProps) {
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      disabled={disabled}
      className="w-full rounded-md border border-gray-200 bg-gray-50 px-3 py-1.5 text-[13px]
        text-gray-800 placeholder-gray-400
        focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400
        dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 dark:placeholder-gray-500
        disabled:opacity-50"
    />
  );
}

/* ── Number input ───────────────────────────────────────────────── */

interface NumberInputProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  suffix?: string;
  disabled?: boolean;
}

export function NumberInput({
  value,
  onChange,
  min,
  max,
  step = 1,
  suffix,
  disabled,
}: NumberInputProps) {
  return (
    <div className="flex items-center gap-2">
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        min={min}
        max={max}
        step={step}
        disabled={disabled}
        className="w-20 rounded-md border border-gray-200 bg-gray-50 px-2.5 py-1.5 text-[13px] text-center
          text-gray-800 tabular-nums
          focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400
          dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200
          disabled:opacity-50"
      />
      {suffix && (
        <span className="text-[12px] text-gray-400 dark:text-gray-500">
          {suffix}
        </span>
      )}
    </div>
  );
}

/* ── Select ─────────────────────────────────────────────────────── */

interface SelectOption {
  value: string | number;
  label: string;
}

interface SelectProps {
  value: string | number;
  onChange: (value: string) => void;
  options: SelectOption[];
  disabled?: boolean;
}

export function Select({ value, onChange, options, disabled }: SelectProps) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
      className="rounded-md border border-gray-200 bg-gray-50 px-2.5 py-1.5 text-[13px]
        text-gray-800 appearance-none pr-7
        focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400
        dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200
        disabled:opacity-50
        bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2212%22%20height%3D%2212%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%239ca3af%22%20stroke-width%3D%222%22%3E%3Cpath%20d%3D%22M6%209l6%206%206-6%22%2F%3E%3C%2Fsvg%3E')]
        bg-[position:right_6px_center] bg-no-repeat"
    >
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  );
}
