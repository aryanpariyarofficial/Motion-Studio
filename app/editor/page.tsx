"use client";

import dynamic from "next/dynamic";

const EditorApp = dynamic(() => import("./EditorApp"), {
  ssr: false,
  loading: () => <div style={{ padding: 40, color: "#8aa097" }}>Loading editor…</div>,
});

export default function EditorPage() {
  return <EditorApp />;
}
