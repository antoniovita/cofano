"use client";

import { useRouter } from "next/navigation";
import { LoginPanel } from "@/components/auth/LoginPanel";

export default function LoginModalPage() {
  const router = useRouter();
  return <LoginPanel variant="modal" onClose={() => router.back()} />;
}
