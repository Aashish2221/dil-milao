import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Dil Milao — Indian Dating App";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #0a0a0f 0%, #1a0a1e 50%, #0a0a0f 100%)",
          fontFamily: "sans-serif",
        }}
      >
        {/* Glow blobs */}
        <div style={{ position: "absolute", top: 80, left: 200, width: 300, height: 300, borderRadius: "50%", background: "rgba(255,107,107,0.15)", filter: "blur(80px)", display: "flex" }} />
        <div style={{ position: "absolute", bottom: 80, right: 200, width: 250, height: 250, borderRadius: "50%", background: "rgba(238,90,36,0.12)", filter: "blur(80px)", display: "flex" }} />

        {/* Heart icon */}
        <div style={{ fontSize: 72, marginBottom: 24, display: "flex" }}>❤️</div>

        {/* App name */}
        <div style={{
          fontSize: 80,
          fontWeight: 900,
          background: "linear-gradient(135deg, #ff6b6b, #ee5a24)",
          backgroundClip: "text",
          color: "transparent",
          marginBottom: 16,
          display: "flex",
        }}>
          Dil Milao
        </div>

        {/* Tagline */}
        <div style={{ fontSize: 32, color: "rgba(255,255,255,0.7)", marginBottom: 48, display: "flex" }}>
          Find Your Dil Ka Rishta ✨
        </div>

        {/* Stats row */}
        <div style={{ display: "flex", gap: 40 }}>
          {[
            { n: "2L+", l: "Active Users" },
            { n: "50K+", l: "Happy Couples" },
            { n: "4.8★", l: "Rating" },
          ].map((s) => (
            <div key={s.l} style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: 16,
              padding: "16px 32px",
            }}>
              <span style={{ fontSize: 36, fontWeight: 800, color: "#ff6b6b" }}>{s.n}</span>
              <span style={{ fontSize: 18, color: "rgba(255,255,255,0.5)", marginTop: 4 }}>{s.l}</span>
            </div>
          ))}
        </div>

        {/* Bottom label */}
        <div style={{ position: "absolute", bottom: 40, fontSize: 22, color: "rgba(255,255,255,0.3)", display: "flex" }}>
          dil-milao.vercel.app
        </div>
      </div>
    ),
    { ...size }
  );
}
