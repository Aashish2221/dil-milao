import { ImageResponse } from "next/og";
import { createClient } from "@supabase/supabase-js";

export const runtime = "edge";
export const alt = "Profile on Dil Milao";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function ProfileOgImage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const { data } = await supabase
    .from("profiles")
    .select("full_name, age, city, state, photo_url")
    .eq("id", id)
    .single();

  const name = data?.full_name ?? "Someone";
  const age = data?.age ? ` · ${data.age}` : "";
  const location = [data?.city, data?.state].filter(Boolean).join(", ");
  const photoUrl = data?.photo_url;
  const initials = name.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          background: "linear-gradient(135deg, #0a0a0f 0%, #1a0a1e 50%, #0a0a0f 100%)",
          fontFamily: "sans-serif",
          alignItems: "center",
          padding: "60px 80px",
          gap: 60,
        }}
      >
        {/* Glow */}
        <div style={{ position: "absolute", top: 0, left: 0, width: 400, height: 400, borderRadius: "50%", background: "rgba(255,107,107,0.12)", filter: "blur(120px)", display: "flex" }} />
        <div style={{ position: "absolute", bottom: 0, right: 0, width: 350, height: 350, borderRadius: "50%", background: "rgba(238,90,36,0.1)", filter: "blur(100px)", display: "flex" }} />

        {/* Avatar */}
        <div style={{
          width: 260,
          height: 260,
          borderRadius: "50%",
          overflow: "hidden",
          border: "4px solid rgba(255,107,107,0.5)",
          flexShrink: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, rgba(255,107,107,0.3), rgba(238,90,36,0.3))",
        }}>
          {photoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={photoUrl} alt={name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          ) : (
            <span style={{ fontSize: 100, fontWeight: 800, color: "rgba(255,255,255,0.8)" }}>{initials}</span>
          )}
        </div>

        {/* Info */}
        <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
          <div style={{ fontSize: 22, color: "rgba(255,107,107,0.8)", fontWeight: 600, marginBottom: 12, display: "flex" }}>
            ❤️ Dil Milao
          </div>
          <div style={{ fontSize: 72, fontWeight: 900, color: "white", lineHeight: 1.1, marginBottom: 16, display: "flex" }}>
            {name}{age}
          </div>
          {location && (
            <div style={{ fontSize: 30, color: "rgba(255,255,255,0.55)", marginBottom: 40, display: "flex" }}>
              📍 {location}
            </div>
          )}
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
            background: "linear-gradient(135deg, #ff6b6b, #ee5a24)",
            borderRadius: 60,
            padding: "20px 40px",
            width: "fit-content",
          }}>
            <span style={{ fontSize: 28, color: "white", fontWeight: 800, display: "flex" }}>
              Match with {name.split(" ")[0]} — Join Free
            </span>
          </div>
          <div style={{ fontSize: 22, color: "rgba(255,255,255,0.3)", marginTop: 28, display: "flex" }}>
            dil-milao.vercel.app
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
