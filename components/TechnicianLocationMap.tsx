"use client";

import { useEffect, useMemo, useState } from "react";
import { Loader2, MapPin, Navigation, ShieldAlert } from "lucide-react";

type Coordinates = {
  lat: number;
  lng: number;
};

type Technician = {
  id: string;
  name: string;
  trade: string;
  distanceKm: string;
  eta: string;
  position: Coordinates;
};

const australianFallbackLocations = [
  { city: "Sydney", lat: -33.8688, lng: 151.2093 },
  { city: "Melbourne", lat: -37.8136, lng: 144.9631 },
  { city: "Brisbane", lat: -27.4698, lng: 153.0251 },
  { city: "Perth", lat: -31.9505, lng: 115.8605 },
  { city: "Adelaide", lat: -34.9285, lng: 138.6007 },
];

const technicianProfiles = [
  { name: "Liam Carter", trade: "Plumbing Specialist" },
  { name: "Noah Bennett", trade: "Electrical Technician" },
  { name: "Ethan Hughes", trade: "General Maintenance" },
  { name: "Jack Wilson", trade: "Hot Water Systems" },
  { name: "Lucas Turner", trade: "Drainage & Leak Detection" },
  { name: "Mason Brooks", trade: "Emergency Repairs" },
  { name: "Oliver Harris", trade: "Pipe Relining" },
  { name: "Henry Collins", trade: "Blocked Drains" },
  { name: "William Foster", trade: "Leak Detection" },
  { name: "James Cooper", trade: "Electrical Maintenance" },
  { name: "Benjamin Ward", trade: "Site Repairs" },
  { name: "Elijah Price", trade: "Hot Water Installations" },
  { name: "Alexander Reed", trade: "CCTV Drain Inspections" },
  { name: "Samuel Bailey", trade: "Jet Blasting" },
  { name: "Daniel Murphy", trade: "General Plumbing" },
  { name: "Matthew Kelly", trade: "Commercial Maintenance" },
  { name: "Joseph Scott", trade: "After Hours Callouts" },
  { name: "David Morris", trade: "Facility Maintenance" },
];

function isWithinAustralia({ lat, lng }: Coordinates) {
  return lat >= -44.5 && lat <= -10 && lng >= 112 && lng <= 154.5;
}

function getRandomAustralianLocation() {
  return australianFallbackLocations[Math.floor(Math.random() * australianFallbackLocations.length)];
}

function seededRandom(seed: number) {
  const value = Math.sin(seed * 9999.91) * 10000;
  return value - Math.floor(value);
}

function createNearbyTechnicians(center: Coordinates) {
  return technicianProfiles.map((profile, index) => {
    const seedBase = (center.lat + 90) * 1000 + (center.lng + 180) * 100 + index * 17;
    const angle = seededRandom(seedBase) * Math.PI * 2;
    const distanceFactor = 0.006 + seededRandom(seedBase + 3) * 0.05;
    const skewLat = 0.8 + seededRandom(seedBase + 7) * 0.9;
    const skewLng = 0.8 + seededRandom(seedBase + 11) * 1.1;
    const latOffset = Math.sin(angle) * distanceFactor * skewLat;
    const lngOffset = Math.cos(angle) * distanceFactor * skewLng;
    const distance = Math.sqrt(latOffset ** 2 + lngOffset ** 2) * 111;

    return {
      id: `${profile.name}-${index}`,
      name: profile.name,
      trade: profile.trade,
      distanceKm: distance.toFixed(1),
      eta: `${20 + index * 7} min`,
      position: {
        lat: center.lat + latOffset,
        lng: center.lng + lngOffset,
      },
    };
  });
}

function loadGoogleMaps(apiKey: string) {
  return new Promise<void>((resolve, reject) => {
    if (typeof window === "undefined") return reject(new Error("Window unavailable"));
    if ((window as any).google?.maps) return resolve();

    const existing = document.getElementById("google-maps-script");
    if (existing) {
      existing.addEventListener("load", () => resolve(), { once: true });
      existing.addEventListener("error", () => reject(new Error("Failed to load Google Maps")), { once: true });
      return;
    }

    const script = document.createElement("script");
    script.id = "google-maps-script";
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}`;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Failed to load Google Maps"));
    document.head.appendChild(script);
  });
}

const mapStyles = [
  { featureType: "poi", stylers: [{ visibility: "off" }] },
  { featureType: "transit", stylers: [{ visibility: "off" }] },
  { featureType: "administrative.land_parcel", stylers: [{ visibility: "off" }] },
  { featureType: "road", elementType: "labels.icon", stylers: [{ visibility: "off" }] },
  { featureType: "road.local", elementType: "labels.text", stylers: [{ visibility: "simplified" }] },
  { featureType: "water", elementType: "geometry", stylers: [{ color: "#dbeafe" }] },
  { featureType: "landscape", elementType: "geometry", stylers: [{ color: "#f8fafc" }] },
];

export default function TechnicianLocationMap() {
  const [status, setStatus] = useState<"locating" | "ready" | "error">("locating");
  const [locationLabel, setLocationLabel] = useState("Finding your area...");
  const [locationSource, setLocationSource] = useState<"user" | "fallback">("user");
  const [center, setCenter] = useState<Coordinates | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  const technicians = useMemo(() => (center ? createNearbyTechnicians(center) : []), [center]);

  useEffect(() => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      const fallback = getRandomAustralianLocation();
      setCenter({ lat: fallback.lat, lng: fallback.lng });
      setLocationLabel(`${fallback.city}, Australia`);
      setLocationSource("fallback");
      setStatus("ready");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const detected = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };

        if (isWithinAustralia(detected)) {
          setCenter(detected);
          setLocationLabel("Your current area");
          setLocationSource("user");
        } else {
          const fallback = getRandomAustralianLocation();
          setCenter({ lat: fallback.lat, lng: fallback.lng });
          setLocationLabel(`${fallback.city}, Australia`);
          setLocationSource("fallback");
        }

        setStatus("ready");
      },
      () => {
        const fallback = getRandomAustralianLocation();
        setCenter({ lat: fallback.lat, lng: fallback.lng });
        setLocationLabel(`${fallback.city}, Australia`);
        setLocationSource("fallback");
        setStatus("ready");
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000,
      }
    );
  }, []);

  useEffect(() => {
    if (!center || !apiKey) return;

    loadGoogleMaps(apiKey)
      .then(() => {
        const mapElement = document.getElementById("technician-map");
        const googleMaps = (window as any).google?.maps;
        if (!mapElement || !googleMaps) return;

        const map = new googleMaps.Map(mapElement, {
          center,
          zoom: 14,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: true,
          zoomControl: true,
          clickableIcons: false,
          styles: mapStyles,
        });

        new googleMaps.Marker({
          position: center,
          map,
          title: "Customer area",
          icon: {
            path: googleMaps.SymbolPath.CIRCLE,
            scale: 11,
            fillColor: "#111827",
            fillOpacity: 1,
            strokeColor: "#ffc526",
            strokeWeight: 4,
          },
        });

        technicians.forEach((tech) => {
          const marker = new googleMaps.Marker({
            position: tech.position,
            map,
            title: `${tech.name} - ${tech.trade}`,
            label: {
              text: tech.name.split(" ")[0].slice(0, 1),
              color: "#111827",
              fontWeight: "700",
            },
            icon: {
              path: googleMaps.SymbolPath.BACKWARD_CLOSED_ARROW,
              scale: 6,
              fillColor: "#ffc526",
              fillOpacity: 1,
              strokeColor: "#111827",
              strokeWeight: 1.5,
            },
          });

          const infoWindow = new googleMaps.InfoWindow({
            content: `
              <div style="padding: 8px 10px; max-width: 220px;">
                <div style="font-weight: 700; color: #111827;">${tech.name}</div>
                <div style="font-size: 13px; color: #4b5563; margin-top: 4px;">${tech.trade}</div>
                <div style="font-size: 12px; color: #6b7280; margin-top: 6px;">Approx. ${tech.distanceKm} km away • ETA ${tech.eta}</div>
              </div>
            `,
          });

          marker.addListener("click", () => {
            infoWindow.open({ anchor: marker, map });
          });
        });
      })
      .catch((error) => {
        console.error(error);
        setErrorMessage("Google Maps could not be loaded. Please check the API key.");
      });
  }, [center, technicians, apiKey]);

  return (
    <main className="flex-grow bg-[#fffdf5]">
      <section className="bg-gray-900 text-white py-16 pt-20">
        <div className="max-w-[1290px] mx-auto px-6">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-yellow-400">Technician Map</p>
          <h1 className="mt-4 text-4xl font-semibold">Nearby Technicians Around Your Area</h1>
          <p className="mt-4 max-w-3xl text-white/80 leading-7">
            This live-style locator uses your current area when you visit the page and shows nearby technician coverage around you.
          </p>
        </div>
      </section>

      <section className="max-w-[1460px] mx-auto px-4 md:px-6 py-8 md:py-10">
        <div className="mb-5 flex flex-wrap items-center gap-3 rounded-[24px] border border-yellow-200 bg-white px-5 py-4 shadow-sm">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-yellow-400 text-stone-900">
            <Navigation className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">Detected Area</p>
            <h2 className="mt-1 text-xl font-bold text-stone-900">{locationLabel}</h2>
          </div>
          
        </div>

        <div className="overflow-hidden rounded-[32px] border border-yellow-200 bg-white p-3 shadow-[0_20px_60px_rgba(255,197,38,0.18)]">
          <div className="overflow-hidden rounded-[24px] border border-stone-200 bg-stone-100">
            {status === "locating" && (
              <div className="flex h-[72vh] min-h-[620px] items-center justify-center gap-3 text-stone-700">
                <Loader2 className="h-5 w-5 animate-spin" />
                <span>Detecting location and preparing technician coverage...</span>
              </div>
            )}

            {status === "ready" && !apiKey && (
              <div className="flex h-[72vh] min-h-[620px] flex-col items-center justify-center px-8 text-center">
                <ShieldAlert className="h-10 w-10 text-yellow-500" />
                <h3 className="mt-4 text-xl font-bold text-stone-900">Google Maps API Key Needed</h3>
                <p className="mt-3 max-w-md text-sm leading-6 text-stone-600">
                  Add `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` to your environment to render the live Google map with technician markers.
                </p>
              </div>
            )}

            {status === "ready" && apiKey && <div id="technician-map" className="h-[72vh] min-h-[620px] w-full" />}
          </div>

          {errorMessage ? (
            <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {errorMessage}
            </div>
          ) : null}
        </div>
      </section>
    </main>
  );
}
