"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Lock, Eye, EyeOff, ArrowLeft, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
        credentials: "include",
      });

      const data = await response.json();

      if (response.ok) {
        router.push("/admin");
        router.refresh();
      } else {
        setError(data.error || "Credenciales invalidas");
      }
    } catch (err) {
      console.error("Auth error:", err);
      setError("Error de conexion. Intente de nuevo.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen">
      {/* Left Side - Branding */}
      {/* Left Side - Branding */}
      <div className="relative hidden w-1/2 bg-gradient-to-br from-primary via-primary to-secondary lg:flex lg:items-center lg:justify-center">
        <div className="absolute inset-0 opacity-10">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)`,
              backgroundSize: "32px 32px",
            }}
          />
        </div>

        {/* Botón separado, arriba a la izquierda */}
        <Link
          href="/"
          className="group absolute left-8 top-8 inline-flex items-center gap-2 text-primary-foreground/70 transition-colors hover:text-primary-foreground"
        >
          <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
          Volver al inicio
        </Link>

        {/* Logo y título centrados */}
        <div className="relative text-center px-8">
          <Image
            src="/images/aoslogoo.png"
            alt="AOS"
            width={220}
            height={80}
            className="mx-auto brightness-0 invert"
            style={{ width: "100", height: "100" }}
            priority
          />
          <h1 className="mt-10 font-sans text-4xl font-bold tracking-tight text-primary-foreground">
            Panel de Administracion
          </h1>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="flex w-full items-center justify-center bg-background px-6 lg:w-1/2">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="mb-10 text-center lg:hidden">
            <Link href="/">
              <Image
                src="/images/aoslogoo.png"
                alt="AOS"
                width={160}
                height={55}
                className="mx-auto"
                style={{ width: "100", height: "100" }}
              />
            </Link>
            <h1 className="mt-4 font-sans text-2xl font-bold text-foreground">
              Panel de Administracion
            </h1>
          </div>

          <div className="mb-10 text-center">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-secondary shadow-lg shadow-primary/20">
              <Lock className="h-10 w-10 text-primary-foreground" />
            </div>
            <h2 className="font-sans text-3xl font-bold text-foreground">
              Bienvenido
            </h2>
            <p className="mt-3 text-muted-foreground">
              Ingresa tus credenciales para continuar
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="mb-2.5 block text-sm font-semibold text-foreground">
                Usuario
              </label>
              <Input
                type="text"
                placeholder="Ingresa tu usuario"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                autoComplete="username"
                className="h-14 rounded-xl border-border bg-muted/30 px-5 text-base transition-all duration-200 placeholder:text-muted-foreground/60 focus:border-primary focus:bg-background focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <div>
              <label className="mb-2.5 block text-sm font-semibold text-foreground">
                Contrasena
              </label>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="Ingresa tu contrasena"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  className="h-14 rounded-xl border-border bg-muted/30 px-5 pr-14 text-base transition-all duration-200 placeholder:text-muted-foreground/60 focus:border-primary focus:bg-background focus:ring-2 focus:ring-primary/20"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-5 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
                  aria-label={
                    showPassword ? "Ocultar contrasena" : "Mostrar contrasena"
                  }
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            {error && (
              <div className="rounded-xl border border-destructive/20 bg-destructive/10 p-4 text-sm font-medium text-destructive">
                {error}
              </div>
            )}

            <Button
              type="submit"
              size="lg"
              className="h-14 w-full gap-3 rounded-xl bg-gradient-to-r from-primary to-secondary text-base font-semibold text-primary-foreground shadow-lg shadow-primary/25 transition-all duration-200 hover:shadow-xl hover:shadow-primary/30"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                  Iniciando sesion...
                </div>
              ) : (
                <>
                  <Shield className="h-5 w-5" />
                  Iniciar Sesion
                </>
              )}
            </Button>
          </form>

          <p className="mt-10 text-center text-sm text-muted-foreground">
            Acceso restringido para personal autorizado
          </p>
        </div>
      </div>
    </div>
  );
}
