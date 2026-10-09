import { ImageResponse } from "next/og";

export const GET = () =>
  new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#1A1020",
          color: "#5B21B6",
          fontSize: 180,
          fontWeight: 700,
        }}
      >
        DB
      </div>
    ),
    { width: 512, height: 512 },
  );
