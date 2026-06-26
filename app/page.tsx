"use client";

import dynamic from "next/dynamic";

// Load the studio entirely on the client — the Remotion Player and Google-font
// loaders must not run during server rendering.
const StudioApp = dynamic(() => import("./StudioApp"), {
  ssr: false,
  loading: () => <div style={{ padding: 40, color: "#8aa097" }}>Loading studio…</div>,
});

export default function Page() {
  return <StudioApp />;
}
