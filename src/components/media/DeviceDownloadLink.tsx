import { Save } from "lucide-react";

interface DeviceDownloadLinkProps {
  streamUrl: string;
  fileName: string;
}

/**
 * Aciona o download nativo do navegador/sistema operacional (não o cache
 * OPFS do app): o arquivo é salvo na pasta Downloads do dispositivo,
 * visível no Files/Galeria e abrível com qualquer player instalado —
 * inclusive formatos que o <video> do navegador não sabe reproduzir
 * (AVI/Xvid, por exemplo), já que a reprodução passa a ser do app externo.
 */
export function DeviceDownloadLink({
  streamUrl,
  fileName,
}: DeviceDownloadLinkProps) {
  return (
    <a
      href={streamUrl}
      download={fileName}
      aria-label={`Salvar ${fileName} no dispositivo`}
      title="Salvar no dispositivo (Downloads)"
      className="flex h-9 w-9 items-center justify-center rounded-full text-text-secondary hover:bg-surface-3 hover:text-text-primary"
    >
      <Save size={16} strokeWidth={1.75} />
    </a>
  );
}
