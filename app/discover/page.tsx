"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import { Heart, X, Star, MapPin, Zap, SlidersHorizontal, ChevronDown, Info } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { createClient } from "@/lib/supabase";

type Profile = {
  id: string;
  full_name: string;
  age: number;
  city: string;
  bio: string;
  interests: string[];
  photo_url: string;
  religion: string;
};

const CITIES = [
  "Agra", "Ahmedabad", "Ajmer", "Allahabad", "Amritsar", "Anand", "Aurangabad",
  "Bangalore", "Bareilly", "Bharuch", "Bhavnagar", "Bhopal", "Bhubaneswar",
  "Chandigarh", "Chennai", "Coimbatore",
  "Dehradun", "Delhi",
  "Faridabad",
  "Gandhinagar", "Ghaziabad", "Gurugram", "Guwahati", "Gwalior",
  "Hyderabad",
  "Indore",
  "Jabalpur", "Jaipur", "Jalandhar", "Jammu", "Jamnagar", "Jodhpur", "Junagadh",
  "Kanpur", "Kochi", "Kolkata", "Kota",
  "Lucknow", "Ludhiana",
  "Madurai", "Mangalore", "Meerut", "Mehsana", "Morbi", "Mumbai", "Mysore",
  "Nadiad", "Nagpur", "Nashik", "Navi Mumbai", "Noida",
  "Patna", "Porbandar", "Pune",
  "Raipur", "Rajkot", "Ranchi",
  "Srinagar", "Surat",
  "Thiruvananthapuram",
  "Udaipur",
  "Vadodara", "Valsad", "Vapi", "Varanasi", "Vijayawada", "Visakhapatnam",
];

const AVATAR_COLORS = ["#ff6b6b", "#6b9eff", "#6bffb8", "#ffb86b", "#b86bff"];

function getInitials(name: string) {
  return name.split(" ").map((n) => n[0]).join("").toUpperCase();
}

export default function DiscoverPage() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [current, setCurrent] = useState(0);
  const [action, setAction] = useState<"like" | "skip" | null>(null);
  const [likeCount, setLikeCount] = useState(0);
  const [isPremium, setIsPremium] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [matchAlert, setMatchAlert] = useState(false);
  const [superLikeAlert, setSuperLikeAlert] = useState(false);
  const [superLikeCount, setSuperLikeCount] = useState(0);
  const [photoError, setPhotoError] = useState(false);

  const dragStartX = useRef<number | null>(null);
  const [dragDeltaX, setDragDeltaX] = useState(0);
  const isDragging = useRef(false);

  // Filters
  const [showFilters, setShowFilters] = useState(false);
  const [filterCity, setFilterCity] = useState("");
  const [filterAgeMin, setFilterAgeMin] = useState(18);
  const [filterAgeMax, setFilterAgeMax] = useState(40);
  const [filterGender, setFilterGender] = useState("Everyone");
  const [filterReligion, setFilterReligion] = useState("");
  const [appliedCity, setAppliedCity] = useState("");
  const [appliedAgeMin, setAppliedAgeMin] = useState(18);
  const [appliedAgeMax, setAppliedAgeMax] = useState(40);
  const [appliedGender, setAppliedGender] = useState("Everyone");
  const [appliedReligion, setAppliedReligion] = useState("");

  const FREE_LIKES = 3;
  const FREE_SUPER_LIKES = 1;
  const PREMIUM_SUPER_LIKES = 5;
  const superLikeLimit = isPremium ? PREMIUM_SUPER_LIKES : FREE_SUPER_LIKES;
  const hasActiveFilter = appliedCity !== "" || appliedAgeMin !== 18 || appliedAgeMax !== 40 || appliedGender !== "Everyone" || appliedReligion !== "";

  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const fetchProfiles = useCallback(async (
    uid: string,
    city: string,
    ageMin: number,
    ageMax: number,
    gender: string,
    religion: string,
    excludeExtra: string[] = []
  ) => {
    const supabase = createClient();

    const { data: likedRows } = await supabase
      .from("likes")
      .select("to_user_id")
      .eq("from_user_id", uid);
    const alreadyLikedIds = likedRows?.map((l) => l.to_user_id) || [];

    const { data: blockRows } = await supabase
      .from("blocks")
      .select("blocker_id, blocked_id")
      .or(`blocker_id.eq.${uid},blocked_id.eq.${uid}`);
    const blockedIds = blockRows?.map((b) =>
      b.blocker_id === uid ? b.blocked_id : b.blocker_id
    ) || [];

    const excludeIds = [...new Set([...alreadyLikedIds, ...blockedIds, ...excludeExtra])];

    let query = supabase
      .from("profiles")
      .select("*")
      .neq("id", uid)
      .gte("age", ageMin)
      .lte("age", ageMax)
      .order("boost_active_until", { ascending: false, nullsFirst: false })
      .limit(20);

    if (city) query = query.eq("city", city);
    if (gender && gender !== "Everyone") {
      query = query.eq("gender", gender === "Men" ? "Man" : "Woman");
    }
    if (religion) query = query.eq("religion", religion);
    if (excludeIds.length > 0) {
      query = query.not("id", "in", `(${excludeIds.join(",")})`);
    }

    const { data } = await query;
    return data || [];
  }, []);

  const loadProfiles = useCallback(async (
    uid: string,
    city: string,
    ageMin: number,
    ageMax: number,
    gender: string,
    religion: string
  ) => {
    setLoading(true);
    setHasMore(true);
    const data = await fetchProfiles(uid, city, ageMin, ageMax, gender, religion);
    setProfiles(data);
    setHasMore(data.length === 20);
    setLoading(false);
  }, [fetchProfiles]);

  const loadMore = useCallback(async (
    uid: string,
    city: string,
    ageMin: number,
    ageMax: number,
    gender: string,
    religion: string,
    currentProfiles: Profile[]
  ) => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    const existingIds = currentProfiles.map((p) => p.id);
    const data = await fetchProfiles(uid, city, ageMin, ageMax, gender, religion, existingIds);
    if (data.length > 0) {
      setProfiles((prev) => [...prev, ...data]);
      setHasMore(data.length === 20);
    } else {
      setHasMore(false);
    }
    setLoadingMore(false);
  }, [fetchProfiles, loadingMore, hasMore]);

  useEffect(() => {
    async function init() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setUserId(user.id);

      const { data: profile } = await supabase
        .from("profiles")
        .select("is_premium, premium_expires_at, looking_for")
        .eq("id", user.id)
        .single();

      const premiumActive =
        profile?.is_premium === true &&
        (!profile.premium_expires_at || new Date(profile.premium_expires_at) > new Date());
      setIsPremium(premiumActive);

      const userGender = profile?.looking_for || "Everyone";
      setFilterGender(userGender);
      setAppliedGender(userGender);

      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);

      if (!premiumActive) {
        const { count: todayLikes } = await supabase
          .from("likes")
          .select("id", { count: "exact", head: true })
          .eq("from_user_id", user.id)
          .gte("created_at", todayStart.toISOString());
        if (todayLikes) setLikeCount(todayLikes);
      }

      const { count: todaySuperLikes } = await supabase
        .from("likes")
        .select("id", { count: "exact", head: true })
        .eq("from_user_id", user.id)
        .eq("super_like", true)
        .gte("created_at", todayStart.toISOString());
      if (todaySuperLikes) setSuperLikeCount(todaySuperLikes);

      await loadProfiles(user.id, "", 18, 40, userGender, "");
    }
    init();
  }, [loadProfiles]);

  function applyFilters() {
    if (!userId) return;
    setAppliedCity(filterCity);
    setAppliedAgeMin(filterAgeMin);
    setAppliedAgeMax(filterAgeMax);
    setAppliedGender(filterGender);
    setAppliedReligion(filterReligion);
    setShowFilters(false);
    setCurrent(0);
    loadProfiles(userId, filterCity, filterAgeMin, filterAgeMax, filterGender, filterReligion);
  }

  function clearFilters() {
    setFilterCity("");
    setFilterAgeMin(18);
    setFilterAgeMax(40);
    setFilterGender("Everyone");
    setFilterReligion("");
    setAppliedCity("");
    setAppliedAgeMin(18);
    setAppliedAgeMax(40);
    setAppliedGender("Everyone");
    setAppliedReligion("");
    setShowFilters(false);
    setCurrent(0);
    if (userId) loadProfiles(userId, "", 18, 40, "Everyone", "");
  }

  async function handleAction(type: "like" | "skip") {
    if (type === "like" && !isPremium && likeCount >= FREE_LIKES) return;
    setAction(type);

    if (type === "like" && userId && profiles[current]) {
      const toUserId = profiles[current].id;
      const supabase = createClient();
      await supabase.from("likes").insert({ from_user_id: userId, to_user_id: toUserId });

      const { data: mutualLike } = await supabase
        .from("likes")
        .select("id")
        .eq("from_user_id", toUserId)
        .eq("to_user_id", userId)
        .maybeSingle();

      if (mutualLike) {
        setMatchAlert(true);
        setTimeout(() => setMatchAlert(false), 3000);
        fetch("/api/push/send", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ to_user_id: toUserId, title: "New Match! 💕", body: "You have a new match on Dil Milao!", url: "/matches" }),
        }).catch(() => {});
      }
      setLikeCount((c) => c + 1);
    }

    setTimeout(() => {
      setAction(null);
      setPhotoError(false);
      setCurrent((c) => {
        const next = c + 1;
        if (userId && next >= profiles.length - 3) {
          loadMore(userId, appliedCity, appliedAgeMin, appliedAgeMax, appliedGender, appliedReligion, profiles);
        }
        return next;
      });
    }, 400);
  }

  async function handleSuperLike() {
    if (superLikeCount >= superLikeLimit) return;
    setAction("like");

    if (userId && profiles[current]) {
      const toUserId = profiles[current].id;
      const supabase = createClient();
      await supabase.from("likes").insert({
        from_user_id: userId,
        to_user_id: toUserId,
        super_like: true,
      });

      const { data: mutualLike } = await supabase
        .from("likes")
        .select("id")
        .eq("from_user_id", toUserId)
        .eq("to_user_id", userId)
        .maybeSingle();

      if (mutualLike) {
        setMatchAlert(true);
        setTimeout(() => setMatchAlert(false), 3000);
        fetch("/api/push/send", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ to_user_id: toUserId, title: "New Match! 💕", body: "You have a new match on Dil Milao!", url: "/matches" }),
        }).catch(() => {});
      }

      setSuperLikeCount((c) => c + 1);
      setLikeCount((c) => c + 1);
    }

    setSuperLikeAlert(true);
    setTimeout(() => setSuperLikeAlert(false), 2500);
    setTimeout(() => {
      setAction(null);
      setPhotoError(false);
      setCurrent((c) => {
        const next = c + 1;
        if (userId && next >= profiles.length - 3) {
          loadMore(userId, appliedCity, appliedAgeMin, appliedAgeMax, appliedGender, appliedReligion, profiles);
        }
        return next;
      });
    }, 400);
  }

  const profile = profiles[current];
  const isDone = current >= profiles.length;

  const SWIPE_THRESHOLD = 80;

  function onPointerDown(e: React.PointerEvent) {
    if (isDone || action) return;
    dragStartX.current = e.clientX;
    isDragging.current = true;
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  }

  function onPointerMove(e: React.PointerEvent) {
    if (!isDragging.current || dragStartX.current === null) return;
    setDragDeltaX(e.clientX - dragStartX.current);
  }

  function onPointerUp() {
    if (!isDragging.current) return;
    isDragging.current = false;
    const delta = dragDeltaX;
    setDragDeltaX(0);
    dragStartX.current = null;
    if (delta > SWIPE_THRESHOLD) handleAction("like");
    else if (delta < -SWIPE_THRESHOLD) handleAction("skip");
  }

  const swipeRotation = dragDeltaX / 15;
  const swipeOpacity = Math.max(0.6, 1 - Math.abs(dragDeltaX) / 300);

  return (
    <div className="min-h-screen pb-20" style={{ background: "#0a0a0f" }}>
      <Navbar />

      {matchAlert && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 btn-primary px-6 py-3 rounded-full text-white font-bold flex items-center gap-2 shadow-2xl">
          <Heart size={20} fill="white" /> It&apos;s a Match! Check your matches!
        </div>
      )}

      {superLikeAlert && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-full text-white font-bold flex items-center gap-2 shadow-2xl" style={{ background: "linear-gradient(135deg, #f59e0b, #fbbf24)" }}>
          <Star size={20} fill="white" /> Super Liked!
        </div>
      )}

      <div className="max-w-md mx-auto px-4 pt-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-white">Discover</h1>
            <p className="text-white/40 text-sm">Find your perfect match</p>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/my-likes" className="text-right hover:opacity-80 transition-opacity">
              <div className="text-white/40 text-xs">Likes sent</div>
              <div className="text-sm font-semibold">
                <span className="gradient-text">{likeCount}</span>
                <span className="text-white/30">/{isPremium ? "∞" : FREE_LIKES}</span>
              </div>
              <div className="text-yellow-400/70 text-[10px]">
                ⭐ {superLikeCount}/{superLikeLimit} super
              </div>
            </Link>
            <button
              onClick={() => setShowFilters((o) => !o)}
              className={`relative w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                showFilters || hasActiveFilter
                  ? "btn-primary text-white"
                  : "glass text-white/50 hover:text-white"
              }`}
            >
              <SlidersHorizontal size={18} />
              {hasActiveFilter && (
                <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-red-400" />
              )}
            </button>
          </div>
        </div>

        {/* Filter Panel */}
        {showFilters && (
          <div className="glass rounded-2xl p-4 mb-4">
            <h3 className="text-white font-semibold text-sm mb-4">Filter Profiles</h3>

            {/* Show me */}
            <div className="mb-4">
              <label className="text-white/50 text-xs mb-1.5 block">Show me</label>
              <div className="grid grid-cols-3 gap-2">
                {["Men", "Women", "Everyone"].map((g) => (
                  <button
                    key={g}
                    type="button"
                    onClick={() => setFilterGender(g)}
                    className={`py-2 rounded-xl text-xs font-medium transition-all ${
                      filterGender === g
                        ? "btn-primary text-white"
                        : "bg-white/5 border border-white/10 text-white/60 hover:border-white/20"
                    }`}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>

            {/* Religion */}
            <div className="mb-4">
              <label className="text-white/50 text-xs mb-1.5 block">Religion</label>
              <div className="relative">
                <select
                  value={filterReligion}
                  onChange={(e) => setFilterReligion(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 pr-8 py-2.5 text-white text-sm focus:outline-none focus:border-red-400/50 appearance-none"
                >
                  <option value="" className="bg-gray-900">Any religion</option>
                  {["Hindu", "Muslim", "Sikh", "Christian", "Jain", "Buddhist", "Parsi", "Swaminarayan", "Other"].map((r) => (
                    <option key={r} value={r} className="bg-gray-900">{r}</option>
                  ))}
                </select>
                <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none" />
              </div>
            </div>

            {/* City */}
            <div className="mb-4">
              <label className="text-white/50 text-xs mb-1.5 block">City</label>
              <div className="relative">
                <MapPin size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
                <select
                  value={filterCity}
                  onChange={(e) => setFilterCity(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl pl-8 pr-8 py-2.5 text-white text-sm focus:outline-none focus:border-red-400/50 appearance-none"
                >
                  <option value="" className="bg-gray-900">Any city</option>
                  {CITIES.map((c) => (
                    <option key={c} value={c} className="bg-gray-900">{c}</option>
                  ))}
                </select>
                <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none" />
              </div>
            </div>

            {/* Age range */}
            <div className="mb-5">
              <label className="text-white/50 text-xs mb-1.5 block">
                Age Range: <span className="text-white">{filterAgeMin}–{filterAgeMax}</span>
              </label>
              <div className="flex items-center gap-3">
                <div className="flex-1">
                  <p className="text-white/30 text-[10px] mb-1">Min</p>
                  <input
                    type="range"
                    min={18}
                    max={filterAgeMax}
                    value={filterAgeMin}
                    onChange={(e) => setFilterAgeMin(Number(e.target.value))}
                    className="w-full accent-red-400"
                  />
                </div>
                <div className="flex-1">
                  <p className="text-white/30 text-[10px] mb-1">Max</p>
                  <input
                    type="range"
                    min={filterAgeMin}
                    max={40}
                    value={filterAgeMax}
                    onChange={(e) => setFilterAgeMax(Number(e.target.value))}
                    className="w-full accent-red-400"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={clearFilters}
                className="flex-1 py-2.5 rounded-xl text-white/50 glass text-sm hover:text-white transition-colors"
              >
                Clear
              </button>
              <button
                onClick={applyFilters}
                className="btn-primary flex-1 py-2.5 rounded-xl text-white text-sm font-semibold"
              >
                Apply Filters
              </button>
            </div>
          </div>
        )}

        {/* Active filter chips */}
        {hasActiveFilter && !showFilters && (
          <div className="flex flex-wrap gap-2 mb-4">
            {appliedGender !== "Everyone" && (
              <span className="flex items-center gap-1 px-3 py-1 rounded-full text-xs btn-primary text-white">
                {appliedGender}
              </span>
            )}
            {appliedReligion && (
              <span className="flex items-center gap-1 px-3 py-1 rounded-full text-xs btn-primary text-white">
                {appliedReligion}
              </span>
            )}
            {appliedCity && (
              <span className="flex items-center gap-1 px-3 py-1 rounded-full text-xs btn-primary text-white">
                <MapPin size={10} /> {appliedCity}
              </span>
            )}
            {(appliedAgeMin !== 18 || appliedAgeMax !== 40) && (
              <span className="flex items-center gap-1 px-3 py-1 rounded-full text-xs btn-primary text-white">
                {appliedAgeMin}–{appliedAgeMax} yrs
              </span>
            )}
            <button
              onClick={clearFilters}
              className="px-3 py-1 rounded-full text-xs glass text-white/50 hover:text-white transition-colors"
            >
              Clear
            </button>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 rounded-full border-2 border-red-400 border-t-transparent animate-spin" />
          </div>
        ) : isDone ? (
          <div className="text-center py-16">
            <div className="w-24 h-24 rounded-full glass flex items-center justify-center mx-auto mb-6">
              <Heart size={40} className="text-red-400/40" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">
              {hasActiveFilter ? "No profiles match your filters!" : "You've seen everyone!"}
            </h2>
            <p className="text-white/40 text-sm mb-8">
              {hasActiveFilter
                ? "Try widening your city or age range."
                : "New people join every day. Check back soon!"}
            </p>
            <div className="flex flex-col gap-3 max-w-xs mx-auto">
              {hasActiveFilter ? (
                <button onClick={clearFilters} className="btn-primary px-8 py-3 rounded-full text-white font-semibold">
                  Clear Filters
                </button>
              ) : (
                <button
                  onClick={() => {
                    setCurrent(0);
                    if (userId) loadProfiles(userId, appliedCity, appliedAgeMin, appliedAgeMax, appliedGender, appliedReligion);
                  }}
                  className="btn-primary px-8 py-3 rounded-full text-white font-semibold"
                >
                  Start Over
                </button>
              )}
              <a href="/matches" className="px-8 py-3 rounded-full glass text-white/60 text-sm font-medium hover:text-white transition-colors">
                Browse Your Matches
              </a>
            </div>
          </div>
        ) : (
          <>
            {/* Profile Card */}
            <div
              className={`profile-card rounded-3xl overflow-hidden mb-6 ${
                action ? "transition-all duration-300" : "transition-opacity duration-100"
              } ${
                action === "like" ? "translate-x-16 rotate-6 opacity-0" :
                action === "skip" ? "-translate-x-16 -rotate-6 opacity-0" : ""
              }`}
              style={
                !action && dragDeltaX !== 0
                  ? {
                      transform: `translateX(${dragDeltaX}px) rotate(${swipeRotation}deg)`,
                      opacity: swipeOpacity,
                      cursor: "grabbing",
                    }
                  : { cursor: "grab" }
              }
              onPointerDown={onPointerDown}
              onPointerMove={onPointerMove}
              onPointerUp={onPointerUp}
              onPointerCancel={onPointerUp}
            >
              <div
                className="h-96 flex items-center justify-center relative overflow-hidden"
                style={{ background: `linear-gradient(135deg, ${AVATAR_COLORS[current % AVATAR_COLORS.length]}22, ${AVATAR_COLORS[(current + 2) % AVATAR_COLORS.length]}22)` }}
              >
                {profile.photo_url && !photoError ? (
                  <Image
                    src={profile.photo_url}
                    alt={profile.full_name}
                    fill
                    className="object-cover"
                    sizes="(max-width: 448px) 100vw, 448px"
                    onError={() => setPhotoError(true)}
                  />
                ) : (
                  <div
                    className="w-32 h-32 rounded-full flex items-center justify-center text-5xl font-bold"
                    style={{ background: `linear-gradient(135deg, ${AVATAR_COLORS[current % AVATAR_COLORS.length]}, ${AVATAR_COLORS[(current + 1) % AVATAR_COLORS.length]})` }}
                  >
                    {getInitials(profile.full_name)}
                  </div>
                )}
                {(action === "like" || dragDeltaX > 40) && (
                  <div
                    className="absolute top-6 left-6 rotate-[-20deg] border-4 border-green-400 text-green-400 font-extrabold text-2xl px-4 py-1 rounded-xl"
                    style={{ opacity: action ? 1 : Math.min(1, (dragDeltaX - 40) / 60) }}
                  >
                    LIKE
                  </div>
                )}
                {(action === "skip" || dragDeltaX < -40) && (
                  <div
                    className="absolute top-6 right-6 rotate-[20deg] border-4 border-red-400 text-red-400 font-extrabold text-2xl px-4 py-1 rounded-xl"
                    style={{ opacity: action ? 1 : Math.min(1, (-dragDeltaX - 40) / 60) }}
                  >
                    SKIP
                  </div>
                )}
                {/* Info button — view full profile */}
                <Link
                  href={`/profile/${profile.id}`}
                  onClick={(e) => e.stopPropagation()}
                  onPointerDown={(e) => e.stopPropagation()}
                  className="absolute bottom-3 right-3 z-10 w-9 h-9 rounded-full glass flex items-center justify-center text-white/70 hover:text-white transition-colors border border-white/20"
                >
                  <Info size={16} />
                </Link>
              </div>

              <div className="p-5">
                <h2 className="text-2xl font-bold text-white mb-2">
                  {profile.full_name}, <span className="gradient-text">{profile.age}</span>
                </h2>
                <div className="flex flex-wrap items-center gap-2 mb-3">
                  <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs glass text-white/60 border border-white/10">
                    <MapPin size={11} /> {profile.city}
                  </span>
                  {profile.religion && (
                    <span className="px-2.5 py-1 rounded-full text-xs glass text-white/60 border border-white/10">
                      {profile.religion}
                    </span>
                  )}
                </div>
                <p className="text-white/60 text-sm leading-relaxed mb-4">{profile.bio}</p>
                <div className="flex flex-wrap gap-2">
                  {profile.interests?.map((interest) => (
                    <span key={interest} className="px-3 py-1 rounded-full text-xs glass text-white/60">
                      {interest}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {!isPremium && likeCount >= FREE_LIKES ? (
              <div className="glass rounded-2xl p-5 text-center">
                <Zap size={32} className="text-yellow-400 mx-auto mb-3" />
                <p className="text-white font-semibold mb-1">Daily limit reached!</p>
                <p className="text-white/40 text-sm mb-4">Upgrade to Premium for unlimited likes</p>
                <a href="/premium" className="btn-primary px-8 py-3 rounded-full text-white font-semibold inline-block">
                  Go Premium ₹199/mo
                </a>
              </div>
            ) : (
              <div className="flex items-center justify-center gap-6">
                <button onClick={() => handleAction("skip")} className="skip-btn w-16 h-16 rounded-full flex items-center justify-center">
                  <X size={28} className="text-white/60" />
                </button>
                <button onClick={() => handleAction("like")} className="heart-btn w-20 h-20 rounded-full flex items-center justify-center">
                  <Heart size={36} fill="white" className="text-white" />
                </button>
                <button
                  onClick={handleSuperLike}
                  disabled={superLikeCount >= superLikeLimit}
                  title={superLikeCount >= superLikeLimit ? `${superLikeLimit} super like${superLikeLimit > 1 ? "s" : ""} used today` : "Super Like"}
                  className={`w-16 h-16 rounded-full flex items-center justify-center transition-all ${
                    superLikeCount >= superLikeLimit
                      ? "glass opacity-40 cursor-not-allowed"
                      : "skip-btn hover:scale-110"
                  }`}
                >
                  <Star size={24} className={superLikeCount >= superLikeLimit ? "text-white/30" : "text-yellow-400"} fill={superLikeCount >= superLikeLimit ? "none" : "#facc15"} />
                </button>
              </div>
            )}

            <p className="text-center text-white/20 text-xs mt-4">
              {current + 1} of {profiles.length} profiles
            </p>
          </>
        )}
      </div>
    </div>
  );
}
