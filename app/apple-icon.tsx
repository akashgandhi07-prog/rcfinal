import { ImageResponse } from "next/og"

export const size = { width: 180, height: 180 }
export const contentType = "image/png"

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 180,
          height: 180,
          background: "#0B1120",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <span
          style={{
            color: "#D4AF37",
            fontSize: 124,
            fontFamily: "Georgia, Times New Roman, serif",
            fontWeight: "bold",
            lineHeight: 1,
            letterSpacing: "-2px",
            marginTop: 4,
          }}
        >
          R
        </span>
      </div>
    ),
    { ...size }
  )
}
