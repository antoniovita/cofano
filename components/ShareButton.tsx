"use client";

import { useCallback, useMemo, useState } from "react";
import { Share } from "lucide-react";

export function ShareButton({
  title,
  className,
}: {
  title: string;
  className?: string;
}) {
  const [copied, setCopied] = useState(false);

  const url = useMemo(() => {
    if (typeof window === "undefined") return "";
    return window.location.href;
  }, []);

  const onShare = useCallback(async () => {
    const shareUrl = typeof window === "undefined" ? "" : window.location.href;

    try {
      if (navigator.share) {
        await navigator.share({ title, url: shareUrl });
        return;
      }
    } catch {
    }

    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1200);
    } catch {
    }
  }, [title]);

  return (
    <button
      type="button"
      onClick={onShare}
      className={className}
      aria-label="Compartilhar"
      title={copied ? "Link copiado" : url ? "Compartilhar" : "Compartilhar"}
    >
      <Share size={14} />
      <span>{copied ? "Copiado" : "Share"}</span>
    </button>
  );
}

