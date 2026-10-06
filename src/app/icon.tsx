import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

const Icon = () =>
  new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#0B3D2E",
          color: "#FFFFFF",
          fontSize: 14,
          fontWeight: 700,
          letterSpacing: -0.5,
        }}
      >
        DB
      </div>
    ),
    size,
  );

export default Icon;
