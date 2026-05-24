import { ImageResponse } from "next/og";

export const runtime = "edge";

export function GET() {
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
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "380px",
            height: "380px",
            borderRadius: "88px",
            background: "linear-gradient(135deg, #ff6b6b 0%, #ee5a24 60%, #f9ca24 100%)",
          }}
        >
          <div style={{ fontSize: 240, color: "white", lineHeight: 1 }}>♥</div>
        </div>
      </div>
    ),
    { width: 512, height: 512 }
  );
}
