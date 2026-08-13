import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 180,
          height: 180,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#13458B",
          borderRadius: 40,
        }}
      >
        <div
          style={{
            width: 84,
            height: 84,
            borderRadius: 999,
            border: "18px solid #FF9933",
            boxSizing: "border-box",
          }}
        />
      </div>
    ),
    { ...size },
  );
}
