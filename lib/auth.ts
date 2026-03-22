import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/currentUser";

export async function requireBackendAccess(options?: {
  unauthorizedRedirectTo?: string;
}) {
  const unauthorizedRedirectTo =
    options?.unauthorizedRedirectTo ?? "/login";

  const user = await getCurrentUser();
  if (!user) redirect(unauthorizedRedirectTo);
  return user;
}
