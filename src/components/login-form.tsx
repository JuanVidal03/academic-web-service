import { cn } from "cn";
import { useState } from "react";
import { z } from "zod";

import { useLogin } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

const credentialsSchema = z.object({
  email: z.string().min(1, "Ingresa tu correo.").email("Correo electrónico inválido."),
  password: z.string().min(1, "Ingresa tu contraseña.")
});

type FieldErrors = Partial<Record<"email" | "password", string>>;

export function LoginForm ({ className, ...props }: React.ComponentProps<"form">) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<FieldErrors>({});
  const { mutate: login, isPending } = useLogin();

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const parsed = credentialsSchema.safeParse({ email, password });

    if (!parsed.success) {
      const next: FieldErrors = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0];
        if (key === "email" || key === "password") {
          next[key] = next[key] ?? issue.message;
        }
      }
      setErrors(next);
      return;
    }

    setErrors({});
    login(parsed.data);
  };

  return (
    <form className={cn("flex flex-col gap-6", className)} onSubmit={handleSubmit} {...props}>
      <FieldGroup>
        <div className="flex flex-col items-center gap-1 text-center">
          <h1 className="text-2xl font-bold">Iniciar sesión</h1>
          <p className="text-sm text-balance text-muted-foreground">
            Ingresa con tu cuenta institucional
          </p>
        </div>
        <Field data-invalid={errors.email !== undefined}>
          <FieldLabel htmlFor="email">Correo electrónico</FieldLabel>
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="usuario@universidad.edu.co"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            disabled={isPending}
            aria-invalid={errors.email !== undefined}
            required
          />
          {errors.email !== undefined ? <FieldError>{errors.email}</FieldError> : null}
        </Field>
        <Field data-invalid={errors.password !== undefined}>
          <div className="flex items-center">
            <FieldLabel htmlFor="password">Contraseña</FieldLabel>
          </div>
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            disabled={isPending}
            aria-invalid={errors.password !== undefined}
            required
          />
          {errors.password !== undefined ? <FieldError>{errors.password}</FieldError> : null}
        </Field>
        <Field>
          <Button type="submit" disabled={isPending}>
            {isPending ? "Ingresando..." : "Iniciar sesión"}
          </Button>
        </Field>
      </FieldGroup>
    </form>
  );
}
