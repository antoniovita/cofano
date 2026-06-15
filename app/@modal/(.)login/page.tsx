import { Modal } from "@/components/Modal";
import { LoginPanel } from "@/components/auth/LoginPanel";

export default function LoginModalPage({
  searchParams,
}: {
  searchParams?: { next?: string };
}) {
  const next = typeof searchParams?.next === "string" ? searchParams.next : null;
  return (
    <Modal title="Acesso" description="Entre para continuar.">
      <LoginPanel variant="modal" next={next} />
    </Modal>
  );
}
