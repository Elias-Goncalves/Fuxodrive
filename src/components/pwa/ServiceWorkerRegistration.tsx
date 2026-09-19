"use client";

import { useEffect } from "react";

export function ServiceWorkerRegistration() {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {
        // Instalação como PWA continua funcionando via manifest; o SW é um
        // reforço para cache do shell e não deve quebrar a navegação normal.
      });
    }
  }, []);

  return null;
}
