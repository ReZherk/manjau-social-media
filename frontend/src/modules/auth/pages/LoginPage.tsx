import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Eye, EyeOff, Loader2, CakeSlice } from "lucide-react";
import { useAuth } from "@/app/providers/AuthProvider";
import { getLandingPath } from "@/app/config/menu";

const loginSchema = z.object({
  email: z
    .string()
    .min(1, "El correo es obligatorio")
    .email("El correo no es válido"),
  password: z.string().min(1, "La contraseña es obligatoria"),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setServerError("");
    try {
      const response = await login(data);
      if (response.mustChangePassword) {
        navigate("/change-password");
      } else {
        const permissions = response.user.permissions ?? [];
        navigate(getLandingPath((p) => permissions.includes(p)));
      }
    } catch {
      setServerError("Credenciales incorrectas");
    }
  };

  return (
    <div className="min-h-screen bg-[#1a1a1a] flex items-center justify-center p-4">
      <div className="w-full max-w-[1200px] min-h-[90vh] flex rounded-3xl overflow-hidden">
        <div className="hidden md:flex w-[45%] relative bg-wine-dark">
          <div className="absolute top-6 left-6 z-10">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                <CakeSlice className="w-4 h-4 text-[#FF6B9A]" />
              </div>
              <span className="text-[#FF6B9A] text-xs uppercase tracking-widest">
                Pastelería
              </span>
            </div>
          </div>
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 z-10 text-center">
            <h1 className="font-script text-7xl md:text-8xl text-[#FF6B9A] drop-shadow-lg">
              Manjau
            </h1>
          </div>
          <div
            className="w-full h-full bg-cover bg-center"
            style={{
              backgroundImage: `url(/images/LOGIN.jpg)`,
            }}
          />
        </div>

        <div className="w-full md:w-[55%] bg-[#FDF2F0] flex items-center justify-center p-6">
          <div className="w-full max-w-[440px] bg-white rounded-3xl shadow-card p-10">
            <div className="text-center mb-8">
              <h2 className="text-xl font-semibold text-text">BIENVENIDO</h2>
              <p className="text-xs text-text-muted uppercase tracking-wider mt-1">
                Sistema de Gestión de Redes Sociales
              </p>
              <p className="text-sm text-text-muted mt-4">
                Ingresa tus credenciales para continuar
              </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-text mb-1.5"
                >
                  Usuario
                </label>
                <input
                  id="email"
                  type="email"
                  autoComplete="username"
                  placeholder="usuario@manjau.com"
                  {...register("email")}
                  className="input-field"
                />
                {errors.email && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.email.message}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-text mb-1.5"
                >
                  Contraseña
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    {...register("password")}
                    className="input-field pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text"
                    aria-label={
                      showPassword ? "Ocultar contraseña" : "Mostrar contraseña"
                    }
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.password.message}
                  </p>
                )}
              </div>

              {serverError && (
                <div className="bg-red-50 text-red-600 text-sm p-3 rounded-xl">
                  {serverError}
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="btn-primary w-full flex items-center justify-center gap-2"
              >
                {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                {isSubmitting ? "Iniciando sesión..." : "Iniciar sesión"}
              </button>
            </form>

            <p className="text-center text-xs text-text-muted mt-6">
              ¿Problemas para acceder? Contacta al administrador.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
