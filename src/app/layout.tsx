import type { Metadata } from "next"
import "./globals.css"

export const metadata: Metadata = {
  title: "SafeReady",
  description:
    "Stay inspection-ready with recurring safety checklists, evidence logs, and team accountability.",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-background antialiased">{children}</body>
    </html>
  )
}
