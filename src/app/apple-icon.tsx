import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

const AppleIcon = () =>
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
          fontSize: 72,
          fontWeight: 700,
          letterSpacing: -2,
        }}
      >
        DB
      </div>
    ),
    size,
  );

export default AppleIcon;
