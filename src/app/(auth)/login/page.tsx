import { LoginForm } from "@/features/auth/login-form"

export default function LoginPage() {
  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-semibold">Sign in</h1>
        <p className="text-sm text-muted-foreground">
          Sign in to your SafeReady account
        </p>
      </div>
      <LoginForm />
    </div>
  )
}
