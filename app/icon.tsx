import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 32,
          height: 32,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#13458B",
          borderRadius: 7,
        }}
      >
        <div
          style={{
            width: 14,
            height: 14,
            borderRadius: 999,
            border: "3.5px solid #FF9933",
            boxSizing: "border-box",
          }}
        />
      </div>
    ),
    { ...size },
  );
}
