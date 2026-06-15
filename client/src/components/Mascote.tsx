import { useState } from 'react';

export type MascoteEstado = 'idle' | 'acerta' | 'erra' | 'comemora';

interface Props {
  estado?: MascoteEstado;
  size?: number;
  /** Texto opcional no balao de fala. */
  fala?: string;
}

// Um WebM transparente por estado: /arara-<estado>.webm.
// Idle roda em loop; reacoes tocam uma vez. SVG e fallback se o video faltar.
export default function Mascote({ estado = 'idle', size = 96, fala }: Props) {
  const efetivo: MascoteEstado = estado === 'erra' ? 'idle' : estado;
  const [erroVideo, setErroVideo] = useState<{ estado: MascoteEstado; erro: boolean }>({ estado: efetivo, erro: false });
  const erro = erroVideo.estado === efetivo && erroVideo.erro;

  return (
    <div className={'mascote mascote-' + efetivo} style={{ width: size }}>
      {fala && <div className="mascote-fala">{fala}</div>}
      {erro ? (
        <img src="/mascote.svg" alt="Arara mascote" className="mascote-img" draggable={false} />
      ) : (
        <video
          key={efetivo}
          className="mascote-video"
          style={{ width: size }}
          src={`/arara-${efetivo}.webm?v=3`}
          autoPlay
          loop={efetivo === 'idle'}
          muted
          playsInline
          onError={() => setErroVideo({ estado: efetivo, erro: true })}
        />
      )}
    </div>
  );
}
