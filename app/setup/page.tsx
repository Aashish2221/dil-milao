"use client";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Heart, MapPin, ChevronRight, X, ChevronDown, Plus } from "lucide-react";
import { createClient } from "@/lib/supabase";
import Image from "next/image";
import { STATES, getDistricts } from "@/lib/india-data";

const INTERESTS = [
  "Cricket", "Bollywood", "Travel", "Cooking", "Fitness", "Music",
  "Reading", "Gaming", "Art", "Photography", "Dancing", "Yoga",
  "Movies", "Trekking", "Coffee", "Technology", "Fashion", "Spirituality",
];

const PRESET_RELIGIONS = ["Hindu", "Muslim", "Sikh", "Christian", "Jain", "Buddhist", "Parsi", "Swaminarayan"];
const MAX_PHOTOS = 6;

type PhotoSlot = { file: File | null; preview: string; existing: string };

function emptySlot(): PhotoSlot { return { file: null, preview: "", existing: "" }; }

export default function SetupPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [initialising, setInitialising] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [photos, setPhotos] = useState<PhotoSlot[]>(Array.from({ length: MAX_PHOTOS }, emptySlot));
  const [uploadingPhotos, setUploadingPhotos] = useState(false);
  const [showCustomReligion, setShowCustomReligion] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeSlot, setActiveSlot] = useState(0);

  const [form, setForm] = useState({
    full_name: "",
    bio: "",
    age: "",
    gender: "",
    looking_for: "Everyone",
    religion: "",
    state: "",
    city: "",
    interests: [] as string[],
  });

  const districts = form.state ? getDistricts(form.state) : [];

  useEffect(() => {
    async function loadExisting() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setInitialising(false); return; }

      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name, bio, age, gender, looking_for, religion, state, city, interests, photo_url")
        .eq("id", user.id)
        .single();

      if (profile && (profile.age || profile.city || profile.bio || profile.full_name)) {
        setIsEditing(true);
        const isCustom = profile.religion && !PRESET_RELIGIONS.includes(profile.religion);
        setShowCustomReligion(!!isCustom);
        setForm({
          full_name: profile.full_name || "",
          bio: profile.bio || "",
          age: profile.age ? String(profile.age) : "",
          gender: profile.gender || "",
          looking_for: profile.looking_for || "Everyone",
          religion: profile.religion || "",
          state: profile.state || "",
          city: profile.city || "",
          interests: profile.interests || [],
        });

        // Load extra photos from profile_photos table
        const { data: extraPhotos } = await supabase
          .from("profile_photos")
          .select("photo_url, sort_order")
          .eq("user_id", user.id)
          .order("sort_order", { ascending: true });

        const slots = Array.from({ length: MAX_PHOTOS }, emptySlot);
        // Primary photo in slot 0
        if (profile.photo_url) {
          slots[0] = { file: null, preview: profile.photo_url, existing: profile.photo_url };
        }
        // Extra photos in slots 1+
        extraPhotos?.forEach((ep, idx) => {
          const slot = idx + 1;
          if (slot < MAX_PHOTOS) {
            slots[slot] = { file: null, preview: ep.photo_url, existing: ep.photo_url };
          }
        });
        setPhotos(slots);
      }
      setInitialising(false);
    }
    loadExisting();
  }, []);

  function toggleInterest(interest: string) {
    setForm((f) => ({
      ...f,
      interests: f.interests.includes(interest)
        ? f.interests.filter((i) => i !== interest)
        : f.interests.length < 6 ? [...f.interests, interest] : f.interests,
    }));
  }

  function openFilePicker(slotIndex: number) {
    setActiveSlot(slotIndex);
    fileInputRef.current?.click();
  }

  function handlePhotoSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) { alert("Please select an image file (JPG, PNG, etc.)"); return; }
    if (file.size > 5 * 1024 * 1024) { alert("Photo must be less than 5MB"); return; }
    const preview = URL.createObjectURL(file);
    setPhotos((prev) => {
      const next = [...prev];
      next[activeSlot] = { file, preview, existing: next[activeSlot].existing };
      return next;
    });
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function removePhoto(slotIndex: number) {
    setPhotos((prev) => {
      const next = [...prev];
      next[slotIndex] = emptySlot();
      // Compact: shift later photos forward to fill gap
      for (let i = slotIndex; i < MAX_PHOTOS - 1; i++) {
        if (next[i + 1].preview) {
          next[i] = next[i + 1];
          next[i + 1] = emptySlot();
        } else break;
      }
      return next;
    });
  }

  async function uploadPhotoFile(userId: string, file: File, slot: number): Promise<string> {
    const supabase = createClient();
    const ext = file.name.split(".").pop() || "jpg";
    const path = `${userId}/photo_${slot}.${ext}`;
    const { error } = await supabase.storage.from("avatars").upload(path, file, { upsert: true });
    if (error) return "";
    const { data } = supabase.storage.from("avatars").getPublicUrl(path);
    return data.publicUrl;
  }

  async function handleFinish() {
    setLoading(true);
    setUploadingPhotos(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setLoading(false); setUploadingPhotos(false); return; }

    // Upload any new files
    const resolvedUrls: string[] = [];
    for (let i = 0; i < MAX_PHOTOS; i++) {
      const slot = photos[i];
      if (!slot.preview) break; // no more photos
      if (slot.file) {
        const url = await uploadPhotoFile(user.id, slot.file, i);
        resolvedUrls.push(url || slot.existing);
      } else {
        resolvedUrls.push(slot.existing || slot.preview);
      }
    }

    setUploadingPhotos(false);

    const primaryUrl = resolvedUrls[0] || "";

    // Save profile
    await supabase.from("profiles").upsert({
      id: user.id,
      email: user.email,
      ...form,
      photo_url: primaryUrl,
      age: parseInt(form.age),
      updated_at: new Date().toISOString(),
    });

    // Sync extra photos (sort_order 0, 1, 2, …)
    await supabase.from("profile_photos").delete().eq("user_id", user.id);
    if (resolvedUrls.length > 0) {
      await supabase.from("profile_photos").insert(
        resolvedUrls.map((url, idx) => ({ user_id: user.id, photo_url: url, sort_order: idx }))
      );
    }

    router.push(isEditing ? "/profile" : "/discover");
  }

  if (initialising) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "linear-gradient(135deg, #0a0a0f, #1a0a1e)" }}>
        <div className="w-8 h-8 rounded-full border-2 border-red-400 border-t-transparent animate-spin" />
      </div>
    );
  }

  const hasMainPhoto = !!photos[0].preview;

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8" style={{ background: "linear-gradient(135deg, #0a0a0f, #1a0a1e)" }}>
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <Heart size={32} fill="#ff6b6b" className="text-red-400 mx-auto mb-3 heartbeat" />
          <h1 className="text-3xl font-bold gradient-text mb-1">
            {isEditing ? "Edit Profile" : "Setup Your Profile"}
          </h1>
          <p className="text-white/40 text-sm">Step {step} of 3 — Let&apos;s make you shine!</p>
        </div>

        <div className="flex gap-2 mb-8">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className="h-1.5 flex-1 rounded-full transition-all duration-300"
              style={{ background: s <= step ? "linear-gradient(135deg, #ff6b6b, #ee5a24)" : "rgba(255,255,255,0.1)" }}
            />
          ))}
        </div>

        <div className="glass rounded-3xl p-8">
          {/* ── STEP 1: Basic Info ── */}
          {step === 1 && (
            <div className="space-y-5">
              <h2 className="text-white font-semibold text-xl mb-4">Basic Info</h2>

              {/* Photo grid */}
              <div className="mb-6">
                <p className="text-white/60 text-sm mb-3">Photos <span className="text-white/30">(up to 6 — first is your main photo)</span></p>
                <div className="grid grid-cols-3 gap-2">
                  {Array.from({ length: MAX_PHOTOS }).map((_, i) => {
                    const slot = photos[i];
                    const hasPhoto = !!slot.preview;
                    const canAdd = !hasPhoto && (i === 0 || !!photos[i - 1].preview);
                    return (
                      <div key={i} className="relative aspect-square rounded-xl overflow-hidden"
                        style={{ background: "rgba(255,255,255,0.05)", border: "2px dashed rgba(255,255,255,0.1)" }}>
                        {hasPhoto ? (
                          <>
                            <Image src={slot.preview} alt={`Photo ${i + 1}`} fill className="object-cover" sizes="120px" />
                            {i === 0 && (
                              <span className="absolute bottom-1 left-1 px-1.5 py-0.5 rounded text-[9px] font-bold text-white"
                                style={{ background: "rgba(0,0,0,0.6)" }}>Main</span>
                            )}
                            <button
                              type="button"
                              onClick={() => removePhoto(i)}
                              className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/70 flex items-center justify-center hover:bg-red-500 transition-colors"
                            >
                              <X size={12} className="text-white" />
                            </button>
                          </>
                        ) : canAdd ? (
                          <button
                            type="button"
                            onClick={() => openFilePicker(i)}
                            className="w-full h-full flex flex-col items-center justify-center gap-1 hover:bg-white/10 transition-colors"
                          >
                            <Plus size={20} className="text-white/30" />
                            <span className="text-white/20 text-[10px]">{i === 0 ? "Add photo" : "Add"}</span>
                          </button>
                        ) : (
                          <div className="w-full h-full" />
                        )}
                      </div>
                    );
                  })}
                </div>
                <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={handlePhotoSelect} className="hidden" />
              </div>

              {/* Full Name */}
              <div>
                <label className="text-white/60 text-sm mb-1 block">Full Name <span className="text-red-400">*</span></label>
                <input
                  type="text"
                  value={form.full_name}
                  onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                  placeholder="Rahul Sharma"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 focus:outline-none focus:border-red-400/50 transition-colors"
                />
              </div>

              {/* Age */}
              <div>
                <label className="text-white/60 text-sm mb-1 block">Your Age <span className="text-red-400">*</span></label>
                <input
                  type="number"
                  value={form.age}
                  onChange={(e) => setForm({ ...form, age: e.target.value })}
                  min={18} max={60}
                  placeholder="e.g. 24"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 focus:outline-none focus:border-red-400/50 transition-colors"
                />
              </div>

              {/* Gender */}
              <div>
                <label className="text-white/60 text-sm mb-2 block">I am a <span className="text-red-400">*</span></label>
                <div className="grid grid-cols-3 gap-3">
                  {["Man", "Woman", "Other"].map((g) => (
                    <button key={g} type="button" onClick={() => setForm({ ...form, gender: g })}
                      className={`py-3 rounded-xl text-sm font-medium transition-all ${form.gender === g ? "btn-primary text-white" : "bg-white/5 border border-white/10 text-white/60 hover:border-white/20"}`}>
                      {g}
                    </button>
                  ))}
                </div>
              </div>

              {/* Looking for */}
              <div>
                <label className="text-white/60 text-sm mb-2 block">I&apos;m looking for</label>
                <div className="grid grid-cols-3 gap-3">
                  {["Men", "Women", "Everyone"].map((g) => (
                    <button key={g} type="button" onClick={() => setForm({ ...form, looking_for: g })}
                      className={`py-3 rounded-xl text-sm font-medium transition-all ${form.looking_for === g ? "btn-primary text-white" : "bg-white/5 border border-white/10 text-white/60 hover:border-white/20"}`}>
                      {g}
                    </button>
                  ))}
                </div>
              </div>

              {/* State */}
              <div>
                <label className="text-white/60 text-sm mb-1 block">State <span className="text-red-400">*</span></label>
                <div className="relative">
                  <select
                    value={form.state}
                    onChange={(e) => setForm({ ...form, state: e.target.value, city: "" })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 pr-9 py-3 text-white focus:outline-none focus:border-red-400/50 transition-colors appearance-none"
                  >
                    <option value="" className="bg-gray-900">Select your state</option>
                    {STATES.map((s) => (
                      <option key={s} value={s} className="bg-gray-900">{s}</option>
                    ))}
                  </select>
                  <ChevronDown size={15} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none" />
                </div>
              </div>

              {/* District / City */}
              <div>
                <label className="text-white/60 text-sm mb-1 block">District <span className="text-red-400">*</span></label>
                <div className="relative">
                  <MapPin size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
                  <select
                    value={form.city}
                    onChange={(e) => setForm({ ...form, city: e.target.value })}
                    disabled={!form.state}
                    className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-9 py-3 text-white focus:outline-none focus:border-red-400/50 transition-colors appearance-none disabled:opacity-40"
                  >
                    <option value="" className="bg-gray-900">
                      {form.state ? "Select your district" : "Select state first"}
                    </option>
                    {districts.map((d) => (
                      <option key={d} value={d} className="bg-gray-900">{d}</option>
                    ))}
                  </select>
                  <ChevronDown size={15} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none" />
                </div>
              </div>

              <button
                onClick={() => setStep(2)}
                disabled={!form.full_name.trim() || !form.age || !form.gender || !form.state || !form.city}
                className="btn-primary w-full py-3 rounded-xl text-white font-semibold disabled:opacity-40 flex items-center justify-center gap-2"
              >
                Next <ChevronRight size={18} />
              </button>
            </div>
          )}

          {/* ── STEP 2: About You ── */}
          {step === 2 && (
            <div className="space-y-5">
              <h2 className="text-white font-semibold text-xl mb-4">About You</h2>

              <div>
                <label className="text-white/60 text-sm mb-1 block">Bio <span className="text-white/30">(optional)</span></label>
                <textarea
                  value={form.bio}
                  onChange={(e) => setForm({ ...form, bio: e.target.value })}
                  maxLength={200}
                  rows={4}
                  placeholder="Tell people about yourself..."
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 focus:outline-none focus:border-red-400/50 transition-colors resize-none"
                />
                <p className="text-white/20 text-xs mt-1">{form.bio.length}/200</p>
              </div>

              {/* Religion */}
              <div>
                <label className="text-white/60 text-sm mb-2 block">Religion <span className="text-red-400">*</span></label>
                <div className="flex flex-wrap gap-2">
                  {PRESET_RELIGIONS.map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => {
                        setShowCustomReligion(false);
                        setForm({ ...form, religion: form.religion === r ? "" : r });
                      }}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                        form.religion === r && !showCustomReligion
                          ? "btn-primary text-white"
                          : "bg-white/5 border border-white/10 text-white/60 hover:border-white/20"
                      }`}
                    >
                      {r}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => {
                      setShowCustomReligion(true);
                      setForm({ ...form, religion: "" });
                    }}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                      showCustomReligion
                        ? "btn-primary text-white"
                        : "bg-white/5 border border-white/10 text-white/60 hover:border-white/20"
                    }`}
                  >
                    Other
                  </button>
                </div>

                {showCustomReligion && (
                  <input
                    type="text"
                    value={form.religion}
                    onChange={(e) => setForm({ ...form, religion: e.target.value })}
                    placeholder="Enter your religion..."
                    autoFocus
                    className="mt-3 w-full bg-white/5 border border-red-400/30 rounded-xl px-4 py-3 text-white placeholder-white/20 focus:outline-none focus:border-red-400/60 transition-colors"
                  />
                )}
              </div>

              <div className="flex gap-3">
                <button onClick={() => setStep(1)} className="flex-1 py-3 rounded-xl text-white/60 glass hover:text-white transition-colors">Back</button>
                <button
                  onClick={() => setStep(3)}
                  disabled={!form.religion}
                  className="btn-primary flex-1 py-3 rounded-xl text-white font-semibold flex items-center justify-center gap-2 disabled:opacity-40"
                >
                  Next <ChevronRight size={18} />
                </button>
              </div>
            </div>
          )}

          {/* ── STEP 3: Interests ── */}
          {step === 3 && (
            <div className="space-y-5">
              <div>
                <h2 className="text-white font-semibold text-xl mb-1">Your Interests <span className="text-red-400">*</span></h2>
                <p className="text-white/40 text-sm mb-4">Pick at least 1, up to 6 things you love</p>
              </div>

              <div className="flex flex-wrap gap-2">
                {INTERESTS.map((interest) => (
                  <button
                    key={interest}
                    type="button"
                    onClick={() => toggleInterest(interest)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                      form.interests.includes(interest)
                        ? "btn-primary text-white"
                        : "bg-white/5 border border-white/10 text-white/60 hover:border-white/20"
                    }`}
                  >
                    {interest}
                  </button>
                ))}
              </div>
              <p className="text-white/30 text-xs">{form.interests.length}/6 selected</p>

              <div className="flex gap-3">
                <button onClick={() => setStep(2)} className="flex-1 py-3 rounded-xl text-white/60 glass hover:text-white transition-colors">Back</button>
                <button
                  onClick={handleFinish}
                  disabled={loading || uploadingPhotos || form.interests.length === 0}
                  className="btn-primary flex-1 py-3 rounded-xl text-white font-semibold disabled:opacity-40"
                >
                  {uploadingPhotos ? "Uploading photos…" : loading ? "Saving…" : isEditing ? "Save Changes" : "Start Matching!"}
                </button>
              </div>
            </div>
          )}
        </div>

        {!hasMainPhoto && step === 1 && (
          <p className="text-white/25 text-xs text-center mt-4">You can add a photo now or later from your profile</p>
        )}
      </div>
    </div>
  );
}
