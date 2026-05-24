import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#0a0a0f",
          borderRadius: "38px",
        }}
      >
        {/* Gradient pill background */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "130px",
            height: "130px",
            borderRadius: "30px",
            background: "linear-gradient(135deg, #ff6b6b 0%, #ee5a24 60%, #f9ca24 100%)",
          }}
        >
          <div style={{ fontSize: 80, color: "white", lineHeight: 1 }}>♥</div>
        </div>
      </div>
    ),
    { ...size }
  );
}
