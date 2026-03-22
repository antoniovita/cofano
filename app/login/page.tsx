import { LoginForm } from "./LoginForm";
import { Suspense } from "react";

export default function LoginPage() {
  return (
    <main className="p-6">
      <h1 className="text-xl font-semibold">Login</h1>
      <p className="mt-2 text-sm text-neutral-600">
        Entre para acessar áreas privadas.
      </p>
      <Suspense
        fallback={<p className="mt-6 text-sm text-neutral-600">Carregando...</p>}
      >
        <LoginForm />
      </Suspense>
      <p className="mt-6 text-xs text-neutral-500">
        Configure <code>DATABASE_URL</code> e <code>SESSION_SECRET</code> no{" "}
        <code>.env.local</code>. Crie o primeiro admin via seed do Prisma.
      </p>
    </main>
  );
}
