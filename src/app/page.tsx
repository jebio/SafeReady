import Link from "next/link"
import { ClipboardCheck, Shield, FileText, Users } from "lucide-react"

const features = [
  {
    icon: ClipboardCheck,
    title: "Recurring Checklists",
    description:
      "Pre-built templates for your sector. Daily, weekly, monthly checks that auto-renew.",
  },
  {
    icon: Shield,
    title: "Evidence Log",
    description:
      "Upload photos and documents as proof. Everything stored securely for inspection.",
  },
  {
    icon: Users,
    title: "Team Accountability",
    description:
      "Assign tasks to staff. See who completed what and when. Never miss a check.",
  },
  {
    icon: FileText,
    title: "Inspection Packs",
    description:
      "Generate printable inspection packs with all completed checks and evidence.",
  },
]

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="border-b">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
          <span className="text-lg font-semibold">SafeReady</span>
          <nav className="flex items-center gap-4">
            <Link href="/login" className="text-sm text-muted-foreground hover:text-foreground">
              Sign in
            </Link>
          </nav>
        </div>
      </header>

      <section className="flex-1">
        <div className="mx-auto max-w-3xl px-4 pt-16 text-center sm:pt-20">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Stay inspection-ready
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Track recurring safety and compliance checks, store evidence, assign
            responsibility, and generate inspection packs — all in one place.
          </p>
          <div className="mt-8 flex justify-center gap-4">
            <Link
              href="/login"
              className="rounded-md bg-primary px-6 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
              Get started
            </Link>
          </div>
        </div>

        <div className="mx-auto mt-20 grid max-w-5xl gap-6 px-4 pb-20 sm:grid-cols-2">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="rounded-lg border p-6 transition-all duration-200 hover:shadow-md"
            >
              <feature.icon className="h-8 w-8 text-primary" />
              <h3 className="mt-4 font-semibold">{feature.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                {feature.description}
              </p>
            </div>
          ))}
        </div>

        <div className="border-t bg-muted/50 py-12 text-center text-sm text-muted-foreground">
          <p>
            SafeReady is an organisational tool. It does not provide legal or
            regulatory advice. Templates are starting points based on public UK
            guidance.
          </p>
        </div>
      </section>
    </div>
  )
}
