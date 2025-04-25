import { LoginForm } from "@/components/auth/login-form"

export default function LoginPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-2 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">Iniciar Sesión</h1>
        <p className="text-sm text-muted-foreground">Ingresa tus credenciales para acceder al sistema</p>
      </div>
      <LoginForm />
    </div>
  )
}
