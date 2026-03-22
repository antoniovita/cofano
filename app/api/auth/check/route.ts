import { getCurrentUser } from "@/lib/currentUser";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return Response.json({ allowed: false }, { status: 401 });
    }
    return Response.json({ allowed: true, user }, { status: 200 });
  } catch {
    return Response.json({ allowed: false }, { status: 500 });
  }
}
