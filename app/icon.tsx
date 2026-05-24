import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
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
          borderRadius: "6px",
        }}
      >
        <div
          style={{
            fontSize: 22,
            color: "#ff6b6b",
            lineHeight: 1,
          }}
        >
          ♥
        </div>
      </div>
    ),
    { ...size }
  );
}
