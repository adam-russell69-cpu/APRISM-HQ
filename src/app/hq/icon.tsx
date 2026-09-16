import { ImageResponse } from "next/og";

export const size = { width: 512, height: 512 };
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
          background: "#10100f",
          border: "20px solid #b79a62",
          borderRadius: 112,
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            color: "#f2eee5",
          }}
        >
          <div style={{ fontSize: 70, letterSpacing: 12, fontWeight: 700 }}>APRISM</div>
          <div style={{ marginTop: 10, fontSize: 34, letterSpacing: 18, color: "#d7c08f" }}>HQ</div>
        </div>
      </div>
    ),
    size,
  );
}
