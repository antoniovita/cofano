import { getCurrentUser } from "@/lib/currentUser";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return Response.json(
        { ok: false, error: "unauthorized" },
        { status: 401 }
      );
    }
    return Response.json({ ok: true, user }, { status: 200 });
  } catch {
    return Response.json(
      { ok: false, error: "server_misconfigured" },
      { status: 500 }
    );
  }
}

