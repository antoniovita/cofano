import { LoginPanel } from "@/components/auth/LoginPanel";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next: rawNext } = await searchParams;
  const next = typeof rawNext === "string" ? rawNext : null;

  return (
    <main className="flex-1 bg-[#0f0f0f] text-white">
      <section className="mx-auto max-w-6xl px-6 pt-10 pb-14">
        <div className="mx-auto max-w-[560px]">
          <LoginPanel variant="page" next={next} />
        </div>
      </section>
    </main>
  );
}

