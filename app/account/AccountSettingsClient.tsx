"use client";

import { useState } from "react";

type UserData = {
  name: string;
  email: string;
  phone: string;
};

export default function AccountSettingsClient({ initialUser }: { initialUser: UserData }) {
  const [profile, setProfile] = useState(initialUser);
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileMessage, setProfileMessage] = useState<string>("");

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState<string>("");

  const saveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileLoading(true);
    setProfileMessage("");

    try {
      const res = await fetch("/api/account/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: profile.name,
          phone: profile.phone,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error || "Failed to update profile");
      }

      setProfile((prev) => ({
        ...prev,
        name: data.user?.name || prev.name,
        phone: data.user?.phone || "",
      }));
      setProfileMessage("Profile updated successfully.");
    } catch (error: any) {
      setProfileMessage(error.message || "Failed to update profile.");
    } finally {
      setProfileLoading(false);
    }
  };

  const updatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordMessage("");

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordMessage("New password and confirm password do not match.");
      return;
    }

    setPasswordLoading(true);
    try {
      const res = await fetch("/api/account/password", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error || "Failed to update password");
      }

      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
      setPasswordMessage("Password updated successfully.");
    } catch (error: any) {
      setPasswordMessage(error.message || "Failed to update password.");
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8 space-y-8">
      <div className="rounded-2xl bg-gradient-to-r from-gray-900 to-gray-700 text-white p-6 sm:p-8 shadow-lg">
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">Account Settings</h1>
        <p className="text-sm sm:text-base text-gray-200 mt-2">
          Manage your profile details and keep your account secure.
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="bg-white shadow-sm border border-gray-100 rounded-2xl overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-100 bg-gray-50">
            <h2 className="text-lg font-semibold text-gray-800">Profile</h2>
            <p className="text-sm text-gray-500 mt-1">Update your personal details.</p>
          </div>
          <form onSubmit={saveProfile} className="p-6 space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
              <input
                type="text"
                value={profile.name}
                onChange={(e) => setProfile((p) => ({ ...p, name: e.target.value }))}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                value={profile.email}
                readOnly
                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
              />
              <p className="text-xs text-gray-500 mt-1">Email cannot be changed.</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
              <input
                type="text"
                value={profile.phone}
                onChange={(e) => setProfile((p) => ({ ...p, phone: e.target.value }))}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
              />
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                type="submit"
                disabled={profileLoading}
                className="px-5 py-2.5 bg-yellow-500 text-black font-semibold rounded-lg hover:bg-yellow-400 disabled:opacity-50"
              >
                {profileLoading ? "Saving..." : "Save Profile"}
              </button>
              {profileMessage && <p className="text-sm text-gray-600">{profileMessage}</p>}
            </div>
          </form>
        </div>

        <div className="bg-white shadow-sm border border-gray-100 rounded-2xl overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-100 bg-gray-50">
            <h2 className="text-lg font-semibold text-gray-800">Password</h2>
            <p className="text-sm text-gray-500 mt-1">Use a strong password to keep your account safe.</p>
          </div>
          <form onSubmit={updatePassword} className="p-6 space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
              <input
                type="password"
                value={passwordForm.currentPassword}
                onChange={(e) => setPasswordForm((p) => ({ ...p, currentPassword: e.target.value }))}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-800"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
              <input
                type="password"
                value={passwordForm.newPassword}
                onChange={(e) => setPasswordForm((p) => ({ ...p, newPassword: e.target.value }))}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-800"
                required
                minLength={6}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
              <input
                type="password"
                value={passwordForm.confirmPassword}
                onChange={(e) => setPasswordForm((p) => ({ ...p, confirmPassword: e.target.value }))}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-800"
                required
                minLength={6}
              />
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                type="submit"
                disabled={passwordLoading}
                className="px-5 py-2.5 bg-gray-900 text-white font-semibold rounded-lg hover:bg-gray-800 disabled:opacity-50"
              >
                {passwordLoading ? "Updating..." : "Update Password"}
              </button>
              {passwordMessage && <p className="text-sm text-gray-600">{passwordMessage}</p>}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
