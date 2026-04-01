"use client";

import { useMemo, useState } from "react";
import PhoneNumberField from "@/components/PhoneNumberField";
import {
  defaultPhoneCountry,
  normalizePhoneNumber,
  parseStoredPhoneNumber,
  validatePhoneLocalNumber,
} from "@/lib/phone";

type CatalogItem = {
  id: string;
  slug: string;
  name: string;
  category: string;
  itemType: string;
  pricingModel: string;
  price: number;
  quantityAvailable: number;
  imageUrl: string | null;
  shortDescription: string | null;
  description: string;
  unitLabel: string | null;
  minHireDays: number;
};

type Props = {
  item: CatalogItem;
  initialUser: {
    name: string;
    email: string;
    phone: string;
  } | null;
  status: string | null;
};

function todayInputValue() {
  return new Date().toISOString().slice(0, 10);
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-AU", {
    style: "currency",
    currency: "AUD",
  }).format(value);
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return <label className="mb-2 block text-xs font-bold uppercase tracking-[2px] text-stone-700">{children}</label>;
}

export default function CatalogItemDetailClient({ item, initialUser, status }: Props) {
  const initialParsedPhone = parseStoredPhoneNumber(initialUser?.phone || "");
  const [checking, setChecking] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [availabilityMessage, setAvailabilityMessage] = useState<string | null>(null);
  const [pricing, setPricing] = useState<{ totalPrice: number; billableUnits: number } | null>(null);
  const [isAvailable, setIsAvailable] = useState(false);
  const [availabilityCheckedKey, setAvailabilityCheckedKey] = useState<string | null>(null);
  const [hirePhoneError, setHirePhoneError] = useState<string | null>(null);
  const [saleSent, setSaleSent] = useState(false);
  const [hireForm, setHireForm] = useState({
    startDate: todayInputValue(),
    endDate: todayInputValue(),
    quantity: 1,
    customerName: initialUser?.name || "",
    customerEmail: initialUser?.email || "",
    phoneCountryCode: initialParsedPhone.dialCode,
    phoneNumber: initialParsedPhone.localNumber,
  });
  const [saleForm, setSaleForm] = useState({
    customerName: initialUser?.name || "",
    customerEmail: initialUser?.email || "",
    phoneCountryCode: defaultPhoneCountry.dialCode,
    phoneNumber: "",
    message: "",
  });

  const checkoutStatusMessage = useMemo(() => {
    if (status === "success") return "Payment received. Your booking has been confirmed.";
    if (status === "cancelled") return "Checkout was cancelled. You can review the dates and try again.";
    return null;
  }, [status]);

  const currentAvailabilityKey = useMemo(
    () => `${hireForm.startDate}|${hireForm.endDate}|${Number(hireForm.quantity)}`,
    [hireForm.endDate, hireForm.quantity, hireForm.startDate]
  );

  const canProceedToBooking = isAvailable && availabilityCheckedKey === currentAvailabilityKey;

  const updateHireForm = (updates: Partial<typeof hireForm>) => {
    setHireForm((prev) => ({ ...prev, ...updates }));
    if (Object.prototype.hasOwnProperty.call(updates, "phoneCountryCode") || Object.prototype.hasOwnProperty.call(updates, "phoneNumber")) {
      setHirePhoneError(null);
    }
    setPricing(null);
    setIsAvailable(false);
    setAvailabilityCheckedKey(null);
    setAvailabilityMessage("Please check availability for the updated booking details.");
  };

  const checkAvailability = async () => {
    setChecking(true);
    setAvailabilityMessage(null);
    try {
      const res = await fetch(`/api/catalog-items/${item.slug}/availability`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          startDate: hireForm.startDate,
          endDate: hireForm.endDate,
          quantity: Number(hireForm.quantity),
        }),
      });

      const data = await res.json().catch(() => null);
      if (!res.ok) throw new Error(data?.error || "Failed to check availability");

      setPricing({ totalPrice: data.totalPrice, billableUnits: data.billableUnits });
      setIsAvailable(Boolean(data.available));
      setAvailabilityCheckedKey(currentAvailabilityKey);
      setAvailabilityMessage(
        data.available
          ? `${data.remaining} unit(s) available. Total: ${formatCurrency(data.totalPrice)}`
          : "Not enough stock is available for those dates."
      );
    } catch (error: any) {
      setPricing(null);
      setIsAvailable(false);
      setAvailabilityCheckedKey(null);
      setAvailabilityMessage(error.message || "Failed to check availability");
    } finally {
      setChecking(false);
    }
  };

  const bookNow = async () => {
    if (!canProceedToBooking) {
      setAvailabilityMessage("Please check availability first before proceeding to booking.");
      return;
    }

    setSubmitting(true);
    try {
      const phoneValidation = validatePhoneLocalNumber(hireForm.phoneCountryCode, hireForm.phoneNumber);
      if (!phoneValidation.valid) {
        setHirePhoneError(phoneValidation.message);
        setSubmitting(false);
        return;
      }

      const res = await fetch(`/api/catalog-items/${item.slug}/book`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...hireForm,
          quantity: Number(hireForm.quantity),
          customerPhone: normalizePhoneNumber(hireForm.phoneCountryCode, hireForm.phoneNumber),
        }),
      });

      const data = await res.json().catch(() => null);
      if (!res.ok) throw new Error(data?.error || "Failed to start checkout");
      if (data?.url) {
        window.location.href = data.url;
      }
    } catch (error: any) {
      alert(error.message || "Failed to start checkout");
      setSubmitting(false);
    }
  };

  const sendSaleInquiry = async () => {
    setSubmitting(true);
    try {
      const salePhone = saleForm.phoneNumber
        ? normalizePhoneNumber(saleForm.phoneCountryCode, saleForm.phoneNumber)
        : "";

      const res = await fetch(`/api/catalog-items/${item.slug}/inquiry`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName: saleForm.customerName,
          customerEmail: saleForm.customerEmail,
          customerPhone: salePhone,
          message: saleForm.message,
        }),
      });

      const data = await res.json().catch(() => null);
      if (!res.ok) throw new Error(data?.error || "Failed to send enquiry");
      setSaleSent(true);
    } catch (error: any) {
      alert(error.message || "Failed to send enquiry");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
      <div className="space-y-6">
        {checkoutStatusMessage ? (
          <div className={`rounded-2xl border px-5 py-4 text-sm font-medium ${status === "success" ? "border-green-200 bg-green-50 text-green-700" : "border-yellow-200 bg-yellow-50 text-stone-700"}`}>
            {checkoutStatusMessage}
          </div>
        ) : null}
        <div className="overflow-hidden rounded-[32px] border border-yellow-100 bg-white shadow-[0_18px_48px_rgba(0,0,0,0.08)]">
          {item.imageUrl ? (
            <img src={item.imageUrl} alt={item.name} className="h-[340px] w-full object-cover" />
          ) : (
            <div className="flex h-[340px] items-center justify-center bg-yellow-100 text-sm font-semibold uppercase tracking-[3px] text-stone-600">
              {item.itemType === "HIRE" ? "Hire Item" : "Sale Item"}
            </div>
          )}
        </div>

        <div className="rounded-[32px] border border-yellow-100 bg-white p-8 shadow-[0_18px_48px_rgba(0,0,0,0.05)]">
          <div className="flex flex-wrap items-center gap-3">
            <span className="rounded-full bg-yellow-100 px-3 py-1 text-xs font-bold uppercase tracking-[2px] text-black">{item.category}</span>
            <span className="rounded-full bg-black px-3 py-1 text-xs font-bold uppercase tracking-[2px] text-white">{item.itemType}</span>
          </div>
          <h1 className="mt-5 font-alt text-4xl font-black uppercase leading-none text-black">{item.name}</h1>
          <p className="mt-4 text-base leading-7 text-stone-700">{item.shortDescription || ""}</p>
          <div className="prose prose-stone mt-8 max-w-none text-sm leading-7 text-stone-600" dangerouslySetInnerHTML={{ __html: item.description }} />
        </div>
      </div>

      <div>
        {item.itemType === "HIRE" ? (
          <div className="rounded-[32px] border border-yellow-200 bg-[#fff7d8] p-7 shadow-[0_18px_48px_rgba(0,0,0,0.08)]">
            <p className="text-sm font-bold uppercase tracking-[3px] text-red-600">Hire booking</p>
            <h2 className="mt-3 font-alt text-3xl font-black uppercase text-black">Check dates and pay online</h2>
            <p className="mt-3 text-sm leading-6 text-stone-700">Choose dates, check availability, see the total, then proceed to checkout.</p>

            <div className="mt-6 grid gap-4">
              <div>
                <FieldLabel>Start Date</FieldLabel>
                <input type="date" value={hireForm.startDate} onChange={(e) => updateHireForm({ startDate: e.target.value })} className="w-full rounded-xl border border-yellow-200 bg-white px-4 py-3" />
              </div>
              <div>
                <FieldLabel>End Date</FieldLabel>
                <input type="date" value={hireForm.endDate} onChange={(e) => updateHireForm({ endDate: e.target.value })} className="w-full rounded-xl border border-yellow-200 bg-white px-4 py-3" />
              </div>
              <div>
                <FieldLabel>Quantity</FieldLabel>
                <input type="number" min={1} max={item.quantityAvailable} value={hireForm.quantity} onChange={(e) => updateHireForm({ quantity: Number(e.target.value) })} className="w-full rounded-xl border border-yellow-200 bg-white px-4 py-3" placeholder="Quantity" />
              </div>
              <div>
                <FieldLabel>Full Name</FieldLabel>
                <input value={hireForm.customerName} onChange={(e) => updateHireForm({ customerName: e.target.value })} className="w-full rounded-xl border border-yellow-200 bg-white px-4 py-3" placeholder="Full name" />
              </div>
              <div>
                <FieldLabel>Email Address</FieldLabel>
                <input type="email" value={hireForm.customerEmail} onChange={(e) => updateHireForm({ customerEmail: e.target.value })} className="w-full rounded-xl border border-yellow-200 bg-white px-4 py-3" placeholder="Email address" />
              </div>
              <div>
                <FieldLabel>Phone Number</FieldLabel>
                <PhoneNumberField
                  dialCode={hireForm.phoneCountryCode}
                  localNumber={hireForm.phoneNumber}
                  onDialCodeChange={(value) => updateHireForm({ phoneCountryCode: value })}
                  onLocalNumberChange={(value) => updateHireForm({ phoneNumber: value })}
                  error={hirePhoneError || undefined}
                />
              </div>
            </div>

            <div className="mt-4 rounded-2xl bg-black p-4 text-sm text-white">
              <div className="font-semibold">Pricing</div>
              <div className="mt-1 text-white/75">Rate: {formatCurrency(item.price)} ({item.pricingModel.replaceAll("_", " ").toLowerCase()})</div>
              <div className="text-white/75">Available stock: {item.quantityAvailable}</div>
              <div className="text-white/75">Minimum hire: {item.minHireDays} day(s)</div>
              {pricing ? <div className="mt-3 font-semibold text-yellow-400">Estimated total: {formatCurrency(pricing.totalPrice)}</div> : null}
            </div>

            {availabilityMessage ? (
              <div className="mt-4 rounded-2xl border border-yellow-200 bg-white px-4 py-3 text-sm text-stone-700">{availabilityMessage}</div>
            ) : null}

            <div className="mt-5 flex flex-wrap gap-3">
              <button onClick={checkAvailability} disabled={checking} className="rounded-full border border-black px-5 py-3 text-sm font-bold uppercase tracking-[1px] text-black transition hover:bg-black hover:text-white disabled:opacity-60">
                {checking ? "Checking..." : "Check Availability"}
              </button>
              <button onClick={bookNow} disabled={submitting || !canProceedToBooking} className="rounded-full bg-black px-5 py-3 text-sm font-bold uppercase tracking-[1px] text-white transition hover:bg-yellow-400 hover:text-black disabled:cursor-not-allowed disabled:opacity-60">
                {submitting ? "Please wait..." : "Book and Pay"}
              </button>
            </div>
          </div>
        ) : (
          <div className="rounded-[32px] border border-yellow-200 bg-[#fff7d8] p-7 shadow-[0_18px_48px_rgba(0,0,0,0.08)]">
            <p className="text-sm font-bold uppercase tracking-[3px] text-red-600">Sales enquiry</p>
            <h2 className="mt-3 font-alt text-3xl font-black uppercase text-black">Call or email to find out more</h2>
            <p className="mt-3 text-sm leading-6 text-stone-700">No online checkout for sale items. Send an enquiry or contact the team directly.</p>

            <div className="mt-5 flex flex-wrap gap-3">
              <a href="tel:0410886899" className="rounded-full bg-black px-5 py-3 text-sm font-bold uppercase tracking-[1px] text-white transition hover:bg-stone-800">
                Call 0410 886 899
              </a>
              <a href="mailto:info@tradecareplus.com.au" className="rounded-full border border-black px-5 py-3 text-sm font-bold uppercase tracking-[1px] text-black transition hover:bg-black hover:text-white">
                Email Us
              </a>
            </div>

            {saleSent ? (
              <div className="mt-5 rounded-2xl border border-green-200 bg-white px-4 py-3 text-sm text-green-700">
                Your enquiry has been sent. Our team will get back to you soon.
              </div>
            ) : (
              <div className="mt-6 grid gap-3">
                <input value={saleForm.customerName} onChange={(e) => setSaleForm((f) => ({ ...f, customerName: e.target.value }))} className="rounded-xl border border-yellow-200 bg-white px-4 py-3" placeholder="Full name" />
                <input type="email" value={saleForm.customerEmail} onChange={(e) => setSaleForm((f) => ({ ...f, customerEmail: e.target.value }))} className="rounded-xl border border-yellow-200 bg-white px-4 py-3" placeholder="Email address" />
                <PhoneNumberField
                  dialCode={saleForm.phoneCountryCode}
                  localNumber={saleForm.phoneNumber}
                  onDialCodeChange={(value) => setSaleForm((f) => ({ ...f, phoneCountryCode: value }))}
                  onLocalNumberChange={(value) => setSaleForm((f) => ({ ...f, phoneNumber: value }))}
                />
                <textarea value={saleForm.message} onChange={(e) => setSaleForm((f) => ({ ...f, message: e.target.value }))} className="rounded-xl border border-yellow-200 bg-white px-4 py-3" rows={5} placeholder="Tell us what you need" />
                <button onClick={sendSaleInquiry} disabled={submitting} className="rounded-full bg-black px-5 py-3 text-sm font-bold uppercase tracking-[1px] text-white transition hover:bg-yellow-400 hover:text-black disabled:opacity-60">
                  {submitting ? "Sending..." : "Send Enquiry"}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
