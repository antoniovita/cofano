import { requireBackendAccess } from "@/lib/auth";
import { connection } from "next/server";

export default async function PrivateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await connection();
  await requireBackendAccess();
  return children;
}
