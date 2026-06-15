import { useState, useEffect } from 'react';

export type MascoteEstado = 'idle' | 'acerta' | 'erra' | 'comemora';

interface Props {
  estado?: MascoteEstado;
  size?: number;
  /** Texto opcional no balão de fala. */
  fala?: string;
}

// Um WebM transparente por estado: /arara-<estado>.webm
// idle em loop; reações tocam uma vez. SVG é fallback se o vídeo faltar/não tocar.
export default function Mascote({ estado = 'idle', size = 96, fala }: Props) {
  const [erro, setErro] = useState(false);

  // reseta o fallback ao trocar de estado (cada estado tem seu arquivo)
  useEffect(() => { setErro(false); }, [estado]);

  return (
    <div className={'mascote mascote-' + estado} style={{ width: size }}>
      {fala && <div className="mascote-fala">{fala}</div>}
      {erro ? (
        <img src="/mascote.svg" alt="Arara mascote" className="mascote-img" draggable={false} />
      ) : (
        <video
          key={estado}
          className="mascote-video"
          style={{ width: size }}
          src={`/arara-${estado}.webm`}
          autoPlay
          loop={estado === 'idle'}
          muted
          playsInline
          onError={() => setErro(true)}
        />
      )}
    </div>
  );
}
