import { ImageResponse } from "next/og"

export const size = { width: 32, height: 32 }
export const contentType = "image/png"

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 32,
          height: 32,
          background: "#0B1120",
          borderRadius: 7,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <span
          style={{
            color: "#D4AF37",
            fontSize: 23,
            fontFamily: "Georgia, Times New Roman, serif",
            fontWeight: "bold",
            lineHeight: 1,
            letterSpacing: "-0.5px",
            marginTop: 1,
          }}
        >
          R
        </span>
      </div>
    ),
    { ...size }
  )
}
