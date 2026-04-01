"use client";

import { phoneCountries } from "@/lib/phone";

type PhoneNumberFieldProps = {
  dialCode: string;
  localNumber: string;
  onDialCodeChange: (value: string) => void;
  onLocalNumberChange: (value: string) => void;
  label?: string;
  required?: boolean;
  error?: string;
  className?: string;
};

export default function PhoneNumberField({
  dialCode,
  localNumber,
  onDialCodeChange,
  onLocalNumberChange,
  label,
  required,
  error,
  className,
}: PhoneNumberFieldProps) {
  return (
    <div className={className}>
      {label ? (
        <label className="mb-1 block text-sm font-medium text-gray-700">
          {label}
          {required ? <span className="ml-1 text-red-500">*</span> : null}
        </label>
      ) : null}
      <div className="flex overflow-hidden rounded-xl border border-yellow-200 bg-white transition-colors focus-within:border-yellow-400 focus-within:ring-1 focus-within:ring-yellow-400">
        <select
          value={dialCode}
          onChange={(e) => onDialCodeChange(e.target.value)}
          aria-label="Country code"
          className="w-[190px] border-0 border-r border-yellow-200 bg-[#fffaf0] px-4 py-3 text-sm text-gray-700 outline-none"
        >
          {phoneCountries.map((country) => (
            <option key={country.code} value={country.dialCode}>
              {country.label} ({country.dialCode})
            </option>
          ))}
        </select>
        <input
          type="tel"
          inputMode="numeric"
          value={localNumber}
          onChange={(e) => onLocalNumberChange(e.target.value.replace(/\D/g, ""))}
          placeholder="Phone number"
          aria-label="Phone number"
          className="min-w-0 flex-1 border-0 bg-white px-4 py-3 text-sm text-gray-700 outline-none"
        />
      </div>
      {error ? <p className="mt-1 text-sm text-red-600">{error}</p> : null}
    </div>
  );
}
