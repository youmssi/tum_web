import { ImageResponse } from "next/og";

export const runtime = "edge";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Tûm — Project execution & workflow visibility";

export default function OgImage() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-start",
        justifyContent: "center",
        background: "linear-gradient(135deg, #0a0a0f 0%, #0f0f1a 60%, #12102a 100%)",
        padding: "80px 88px",
        fontFamily: "system-ui, -apple-system, sans-serif",
      }}
    >
      {/* Logo mark + wordmark */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "18px",
          marginBottom: "48px",
        }}
      >
        <div
          style={{
            width: "60px",
            height: "60px",
            borderRadius: "16px",
            background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "30px",
            fontWeight: "800",
            color: "#ffffff",
          }}
        >
          T
        </div>
        <div
          style={{
            fontSize: "42px",
            fontWeight: "700",
            color: "#ffffff",
            letterSpacing: "-1.5px",
          }}
        >
          Tûm
        </div>
        <div
          style={{
            fontSize: "16px",
            color: "#6366f1",
            background: "rgba(99,102,241,0.15)",
            border: "1px solid rgba(99,102,241,0.3)",
            borderRadius: "20px",
            padding: "4px 14px",
            marginLeft: "4px",
            letterSpacing: "0.5px",
            fontWeight: "500",
          }}
        >
          Open source
        </div>
      </div>

      {/* Main headline */}
      <div
        style={{
          fontSize: "56px",
          fontWeight: "700",
          color: "#ffffff",
          lineHeight: 1.05,
          marginBottom: "28px",
          maxWidth: "880px",
          letterSpacing: "-2px",
        }}
      >
        Tasks. Timelines. <span style={{ color: "#818cf8" }}>Team visibility.</span>
      </div>

      {/* Sub-tagline */}
      <div
        style={{
          fontSize: "26px",
          color: "#94a3b8",
          maxWidth: "760px",
          lineHeight: 1.45,
          fontWeight: "400",
        }}
      >
        One workspace. Every kind of project.
      </div>

      {/* Bottom domain */}
      <div
        style={{
          position: "absolute",
          bottom: "64px",
          right: "88px",
          fontSize: "20px",
          color: "#3f3f5c",
          letterSpacing: "0.5px",
        }}
      >
        tum-app.vercel.app
      </div>

      {/* Subtle grid decoration */}
      <div
        style={{
          position: "absolute",
          top: 0,
          right: 0,
          width: "480px",
          height: "100%",
          background:
            "radial-gradient(ellipse at 80% 50%, rgba(99,102,241,0.08) 0%, transparent 70%)",
        }}
      />
    </div>,
    size,
  );
}
