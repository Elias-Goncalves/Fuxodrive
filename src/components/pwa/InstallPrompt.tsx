"use client";

import { useEffect, useState } from "react";
import { Download, X } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const DISMISSED_KEY = "drivestream:install-dismissed";

function isStandalone(): boolean {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    // iOS Safari expõe isso em vez do media query acima.
    (navigator as { standalone?: boolean }).standalone === true
  );
}

function isIosDevice(): boolean {
  return (
    typeof window !== "undefined" &&
    /iphone|ipad|ipod/i.test(window.navigator.userAgent)
  );
}

function getInitialVisibility(ios: boolean): boolean {
  if (typeof window === "undefined") return false;
  if (isStandalone()) return false;
  if (window.localStorage.getItem(DISMISSED_KEY)) return false;
  return ios;
}

/**
 * Botão flutuante "Instalar app": no Android/Chrome/Google TV captura o
 * evento nativo `beforeinstallprompt` para oferecer a instalação sem
 * depender do usuário achar o menu do navegador. Em iOS (que não dispara
 * esse evento) mostra instruções manuais de "Adicionar à Tela de Início".
 */
export function InstallPrompt() {
  const [isIos] = useState(isIosDevice);
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [visible, setVisible] = useState(() => getInitialVisibility(isIos));

  useEffect(() => {
    if (isIos || isStandalone() || window.localStorage.getItem(DISMISSED_KEY)) {
      return;
    }

    function handleBeforeInstallPrompt(event: Event) {
      event.preventDefault();
      setDeferredPrompt(event as BeforeInstallPromptEvent);
      setVisible(true);
    }

    function handleAppInstalled() {
      setVisible(false);
      setDeferredPrompt(null);
    }

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, [isIos]);

  function dismiss() {
    setVisible(false);
    window.localStorage.setItem(DISMISSED_KEY, "1");
  }

  async function handleInstall() {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") setVisible(false);
    setDeferredPrompt(null);
  }

  if (!visible) return null;

  return (
    <div className="fixed inset-x-4 bottom-20 z-40 mx-auto flex max-w-sm items-center gap-3 rounded-xl border border-border-subtle bg-surface-1 p-3 shadow-2xl md:bottom-6 md:left-6 md:right-auto">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent-primary/15 text-accent-primary">
        <Download size={16} strokeWidth={1.75} />
      </div>
      <div className="flex-1 text-xs text-text-secondary">
        {isIos ? (
          <>
            Instale o DriveStream: toque em{" "}
            <span className="font-semibold text-text-primary">Compartilhar</span>{" "}
            e depois em{" "}
            <span className="font-semibold text-text-primary">
              Adicionar à Tela de Início
            </span>
            .
          </>
        ) : (
          <>
            Instale o <span className="font-semibold text-text-primary">DriveStream</span>{" "}
            no seu dispositivo para acesso rápido e tela cheia.
          </>
        )}
      </div>
      {!isIos && (
        <button
          onClick={handleInstall}
          className="shrink-0 rounded-lg bg-accent-primary px-3 py-1.5 text-xs font-semibold text-white hover:bg-accent-hover"
        >
          Instalar
        </button>
      )}
      <button
        onClick={dismiss}
        aria-label="Dispensar"
        className="shrink-0 text-text-muted hover:text-text-primary"
      >
        <X size={16} strokeWidth={1.75} />
      </button>
    </div>
  );
}
