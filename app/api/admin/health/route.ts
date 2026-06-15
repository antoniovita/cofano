import { getCurrentUser } from "@/lib/currentUser";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return Response.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }
  if (user.role !== "ADMIN") {
    return Response.json({ ok: false, error: "forbidden" }, { status: 403 });
  }

  return Response.json(
    {
      ok: true,
      user,
      now: new Date().toISOString(),
    },
    { status: 200 }
  );
}

