// Client helpers to download a rendered file to the browser's Downloads folder.

export function filenameFromResponse(res: Response, fallback: string): string {
  const cd = res.headers.get("Content-Disposition") || "";
  const m = /filename="?([^"]+)"?/.exec(cd);
  return m ? m[1] : fallback;
}

export function downloadBlob(blob: Blob, name: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1500);
}
