"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { authClient } from "@/lib/auth-client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { acceptInvite } from "@/actions/invite"

interface SignupFormProps {
  email: string
  token: string
}

export function SignupForm({ email, token }: SignupFormProps) {
  const router = useRouter()
  const [name, setName] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [accepting, setAccepting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const { error: signupError } = await authClient.signUp.email({
      name,
      email,
      password,
    })

    if (signupError) {
      setError(signupError.message ?? "Something went wrong")
      setLoading(false)
      return
    }

    setAccepting(true)
    const fd = new FormData()
    fd.set("token", token)
    const result = await acceptInvite(fd)

    if (result.error) {
      setError(result.error)
      setAccepting(false)
      setLoading(false)
      return
    }

    router.push("/dashboard")
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Full name</Label>
        <Input
          id="name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          placeholder="Your name"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          value={email}
          disabled
        />
        <p className="text-xs text-muted-foreground">
          This email was used for your invitation.
        </p>
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={8}
          placeholder="At least 8 characters"
        />
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
      <Button type="submit" disabled={loading} className="w-full">
        {loading ? (accepting ? "Joining workspace..." : "Creating account...") : "Create account"}
      </Button>
    </form>
  )
}
