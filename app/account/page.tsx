"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import { supabase } from "@/lib/supabase";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

type UserProfile = {
  id: string;
  email: string;
  full_name: string;
};

type DeliveryProfile = {
  full_name: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
};

const emptyDeliveryProfile: DeliveryProfile = {
  full_name: "",
  phone: "",
  address: "",
  city: "",
  state: "",
  pincode: "",
};

export default function AccountPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);

  const [user, setUser] =
    useState<UserProfile | null>(null);

  const [profile, setProfile] =
    useState<DeliveryProfile>(
      emptyDeliveryProfile
    );

  const [savedProfile, setSavedProfile] =
    useState<DeliveryProfile>(
      emptyDeliveryProfile
    );

  useEffect(() => {
    loadAccount();
  }, []);

  async function loadAccount() {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.replace("/login");
        return;
      }

      const authName =
        user.user_metadata?.full_name ?? "";

      const { data: profileData, error } =
        await supabase
          .from("profiles")
          .select(
            "full_name, phone, address, city, state, pincode"
          )
          .eq("id", user.id)
          .maybeSingle();

      if (error) {
        throw error;
      }

      const loadedProfile: DeliveryProfile = {
        full_name:
          profileData?.full_name ??
          authName,
        phone: profileData?.phone ?? "",
        address:
          profileData?.address ?? "",
        city: profileData?.city ?? "",
        state: profileData?.state ?? "",
        pincode:
          profileData?.pincode ?? "",
      };

      setUser({
        id: user.id,
        email: user.email ?? "",
        full_name: loadedProfile.full_name,
      });

      setProfile(loadedProfile);
      setSavedProfile(loadedProfile);
    } catch (err) {
      console.error(
        "Failed to load account:",
        err
      );
    } finally {
      setLoading(false);
    }
  }

  function updateField(
    field: keyof DeliveryProfile,
    value: string
  ) {
    setProfile((current) => ({
      ...current,
      [field]: value,
    }));
  }

  async function handleSaveProfile() {
    if (!user) return;

    const cleanedProfile = {
      full_name: profile.full_name.trim(),
      phone: profile.phone.trim(),
      address: profile.address.trim(),
      city: profile.city.trim(),
      state: profile.state.trim(),
      pincode: profile.pincode.trim(),
    };

    if (!cleanedProfile.full_name) {
      alert("Please enter your name.");
      return;
    }

    try {
      setSaving(true);

      // Keep Supabase Auth name updated too.
      const { error: authError } =
        await supabase.auth.updateUser({
          data: {
            full_name:
              cleanedProfile.full_name,
          },
        });

      if (authError) {
        throw authError;
      }

      // Create the profile if it doesn't exist,
      // otherwise update the existing row.
      const { error: profileError } =
        await supabase
          .from("profiles")
          .upsert(
            {
              id: user.id,
              ...cleanedProfile,
              updated_at:
                new Date().toISOString(),
            },
            {
              onConflict: "id",
            }
          );

      if (profileError) {
        throw profileError;
      }

      setProfile(cleanedProfile);
      setSavedProfile(cleanedProfile);

      setUser((current) =>
        current
          ? {
              ...current,
              full_name:
                cleanedProfile.full_name,
            }
          : current
      );

      setEditing(false);

      router.refresh();
    } catch (err: any) {
      alert(
        err.message ||
          "Unable to save your profile."
      );
    } finally {
      setSaving(false);
    }
  }

  function handleCancelEdit() {
    setProfile(savedProfile);
    setEditing(false);
  }

  async function handleLogout() {
    await supabase.auth.signOut();

    router.replace("/");
    router.refresh();
  }

  if (loading) {
    return (
      <>
        <Navbar />

        <main className="flex min-h-[70vh] items-center justify-center">
          <p className="text-gray-500">
            Loading your account...
          </p>
        </main>

        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />

      <main className="min-h-[70vh] bg-stone-100 px-4 py-10 md:px-6 md:py-16">
        <div className="mx-auto max-w-4xl">
          <h1 className="mb-10 text-4xl font-light md:text-5xl">
            My Account
          </h1>

          <div className="rounded-[28px] bg-white p-6 shadow-sm md:rounded-[32px] md:p-10">

            <div className="flex items-start justify-between gap-6">
              <div>
                <h2 className="text-2xl font-medium">
                  Profile
                </h2>

                <p className="mt-2 text-gray-500">
                  Manage your personal and
                  delivery information.
                </p>
              </div>

              {!editing && (
                <button
                  type="button"
                  onClick={() =>
                    setEditing(true)
                  }
                  className="shrink-0 rounded-full border px-5 py-2 text-sm transition hover:bg-gray-50"
                >
                  Edit Profile
                </button>
              )}
            </div>

            <div className="mt-10 grid gap-6 md:grid-cols-2">

              {/* Full Name */}

              <div>
                <label className="mb-2 block text-sm text-gray-500">
                  Full Name
                </label>

                {editing ? (
                  <input
                    type="text"
                    value={profile.full_name}
                    onChange={(e) =>
                      updateField(
                        "full_name",
                        e.target.value
                      )
                    }
                    className="w-full rounded-xl border px-4 py-3 outline-none focus:border-black"
                  />
                ) : (
                  <p className="text-lg">
                    {profile.full_name ||
                      "Not added"}
                  </p>
                )}
              </div>

              {/* Email */}

              <div>
                <label className="mb-2 block text-sm text-gray-500">
                  Email
                </label>

                <p className="break-all text-lg">
                  {user?.email}
                </p>
              </div>

              {/* Phone */}

              <div>
                <label className="mb-2 block text-sm text-gray-500">
                  Phone
                </label>

                {editing ? (
                  <input
                    type="tel"
                    value={profile.phone}
                    onChange={(e) =>
                      updateField(
                        "phone",
                        e.target.value
                      )
                    }
                    placeholder="Phone number"
                    className="w-full rounded-xl border px-4 py-3 outline-none focus:border-black"
                  />
                ) : (
                  <p className="text-lg">
                    {profile.phone ||
                      "Not added"}
                  </p>
                )}
              </div>

              {/* Pincode */}

              <div>
                <label className="mb-2 block text-sm text-gray-500">
                  Pincode
                </label>

                {editing ? (
                  <input
                    type="text"
                    inputMode="numeric"
                    value={profile.pincode}
                    onChange={(e) =>
                      updateField(
                        "pincode",
                        e.target.value
                      )
                    }
                    placeholder="Pincode"
                    className="w-full rounded-xl border px-4 py-3 outline-none focus:border-black"
                  />
                ) : (
                  <p className="text-lg">
                    {profile.pincode ||
                      "Not added"}
                  </p>
                )}
              </div>

              {/* Address */}

              <div className="md:col-span-2">
                <label className="mb-2 block text-sm text-gray-500">
                  Address
                </label>

                {editing ? (
                  <input
                    type="text"
                    value={profile.address}
                    onChange={(e) =>
                      updateField(
                        "address",
                        e.target.value
                      )
                    }
                    placeholder="Delivery address"
                    className="w-full rounded-xl border px-4 py-3 outline-none focus:border-black"
                  />
                ) : (
                  <p className="text-lg">
                    {profile.address ||
                      "Not added"}
                  </p>
                )}
              </div>

              {/* City */}

              <div>
                <label className="mb-2 block text-sm text-gray-500">
                  City
                </label>

                {editing ? (
                  <input
                    type="text"
                    value={profile.city}
                    onChange={(e) =>
                      updateField(
                        "city",
                        e.target.value
                      )
                    }
                    placeholder="City"
                    className="w-full rounded-xl border px-4 py-3 outline-none focus:border-black"
                  />
                ) : (
                  <p className="text-lg">
                    {profile.city ||
                      "Not added"}
                  </p>
                )}
              </div>

              {/* State */}

              <div>
                <label className="mb-2 block text-sm text-gray-500">
                  State
                </label>

                {editing ? (
                  <input
                    type="text"
                    value={profile.state}
                    onChange={(e) =>
                      updateField(
                        "state",
                        e.target.value
                      )
                    }
                    placeholder="State"
                    className="w-full rounded-xl border px-4 py-3 outline-none focus:border-black"
                  />
                ) : (
                  <p className="text-lg">
                    {profile.state ||
                      "Not added"}
                  </p>
                )}
              </div>

            </div>

            {editing && (
              <div className="mt-10 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={handleSaveProfile}
                  disabled={saving}
                  className="rounded-full bg-black px-7 py-3 text-white transition hover:bg-neutral-800 disabled:opacity-50"
                >
                  {saving
                    ? "Saving..."
                    : "Save Changes"}
                </button>

                <button
                  type="button"
                  onClick={handleCancelEdit}
                  disabled={saving}
                  className="rounded-full border px-7 py-3 transition hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            )}

            <hr className="my-10" />

            <div className="flex flex-wrap gap-4">
              <Link
                href="/wishlist"
                className="rounded-full border px-6 py-3 transition hover:bg-gray-50"
              >
                My Wishlist
              </Link>

              <Link
                href="/orders"
                className="rounded-full border px-6 py-3 transition hover:bg-gray-50"
              >
                My Orders
              </Link>

              <button
                type="button"
                onClick={handleLogout}
                className="rounded-full bg-black px-6 py-3 text-white transition hover:bg-neutral-800"
              >
                Logout
              </button>
            </div>

          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}