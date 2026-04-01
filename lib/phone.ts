import {
  parsePhoneNumberFromString,
  type CountryCode,
  type E164Number,
} from "libphonenumber-js";

export type PhoneCountry = {
  code: string;
  label: string;
  dialCode: string;
};

export const phoneCountries: PhoneCountry[] = [
  { code: "AU", label: "Australia", dialCode: "+61" },
  { code: "NZ", label: "New Zealand", dialCode: "+64" },
  { code: "GB", label: "United Kingdom", dialCode: "+44" },
  { code: "US", label: "United States", dialCode: "+1" },
];

export const defaultPhoneCountry = phoneCountries[0];

export function digitsOnly(value: string) {
  return value.replace(/\D/g, "");
}

function getCountryByDialCode(dialCode: string) {
  return phoneCountries.find((item) => item.dialCode === dialCode) || defaultPhoneCountry;
}

export function validatePhoneLocalNumber(dialCode: string, localNumber: string) {
  const country = getCountryByDialCode(dialCode);
  const digits = digitsOnly(localNumber);

  if (!digits) {
    return { valid: false, message: "Phone number is required." };
  }

  const parsedPhone = parsePhoneNumberFromString(digits, country.code as CountryCode);
  if (!parsedPhone || !parsedPhone.isValid()) {
    return {
      valid: false,
      message: `Enter a valid ${country.label} phone number.`,
    };
  }

  return { valid: true, message: "" };
}

export function validateStoredPhoneNumber(phoneNumber?: string | null) {
  const trimmed = phoneNumber?.trim() || "";

  if (!trimmed) {
    return { valid: false, message: "Phone number is required." };
  }

  const parsedPhone = parsePhoneNumberFromString(trimmed);
  if (!parsedPhone || !parsedPhone.isValid()) {
    return { valid: false, message: "Enter a valid phone number." };
  }

  return { valid: true, message: "", normalized: parsedPhone.number };
}

export function normalizePhoneNumber(dialCode: string, localNumber: string) {
  const country = getCountryByDialCode(dialCode);
  const digits = digitsOnly(localNumber);
  const parsedPhone = parsePhoneNumberFromString(digits, country.code as CountryCode);

  if (!parsedPhone || !parsedPhone.isValid()) {
    return `${dialCode}${digits}`;
  }

  return parsedPhone.number;
}

export function parseStoredPhoneNumber(value?: string | null) {
  const trimmed = value?.trim() || "";
  if (!trimmed) {
    return {
      dialCode: defaultPhoneCountry.dialCode,
      localNumber: "",
    };
  }

  const parsedPhone = parsePhoneNumberFromString(trimmed as E164Number);
  if (parsedPhone?.country) {
    const matchedCountry =
      phoneCountries.find((country) => country.code === parsedPhone.country) || defaultPhoneCountry;

    return {
      dialCode: matchedCountry.dialCode,
      localNumber: parsedPhone.nationalNumber,
    };
  }

  const matchedCountry = phoneCountries.find((country) => trimmed.startsWith(country.dialCode)) || defaultPhoneCountry;

  return {
    dialCode: matchedCountry.dialCode,
    localNumber: digitsOnly(trimmed.slice(matchedCountry.dialCode.length)),
  };
}
