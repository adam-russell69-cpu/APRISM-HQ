import { ImageResponse } from "next/og";

export const alt = "APRISM — Luxury Asset Stewardship. Managing What Matters.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", padding: "64px 72px", color: "#f1efe9", background: "linear-gradient(135deg, #0b0d0d 0%, #171c1a 58%, #211d16 100%)", fontFamily: "serif" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}><div style={{ fontFamily: "sans-serif", fontSize: 24, letterSpacing: 10, fontWeight: 700 }}>APRISM</div><div style={{ fontFamily: "sans-serif", fontSize: 14, letterSpacing: 4, color: "#c7a76b" }}>PARK CITY · WASATCH BACK</div></div>
      <div style={{ display: "flex", flexDirection: "column" }}><div style={{ fontFamily: "sans-serif", fontSize: 18, letterSpacing: 5, color: "#c7a76b" }}>LUXURY ASSET STEWARDSHIP</div><div style={{ marginTop: 28, fontSize: 82, lineHeight: 0.95, letterSpacing: -2 }}>Managing What Matters.</div></div>
      <div style={{ width: "100%", height: 1, background: "rgba(199,167,107,.45)" }} />
    </div>,
    size,
  );
}
