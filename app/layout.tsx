import "./globals.css";

export const metadata = {
  title: "Motion Studio",
  description: "Personal motion-graphics studio for video ads",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
