import { Capacitor } from '@capacitor/core';
import { App } from '@capacitor/app';
import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics';
import { StatusBar, Style } from '@capacitor/status-bar';

const isNative = Capacitor.isNativePlatform();

// ---- Botão voltar do Android ----
// Pilha de handlers: quem tem UI aberta (lição, modal) registra um handler que
// devolve true se consumiu o back. Sem ninguém consumindo: volta no histórico
// do router; sem histórico: minimiza o app (comportamento nativo esperado —
// nunca fechar o app no meio de uma lição).
type BackHandler = () => boolean;
const backStack: BackHandler[] = [];

export function pushBackHandler(handler: BackHandler): () => void {
  backStack.push(handler);
  return () => {
    const i = backStack.indexOf(handler);
    if (i >= 0) backStack.splice(i, 1);
  };
}

export function initNative() {
  if (!isNative) return;

  void App.addListener('backButton', ({ canGoBack }) => {
    for (let i = backStack.length - 1; i >= 0; i--) {
      if (backStack[i]()) return;
    }
    if (canGoBack) window.history.back();
    else void App.minimizeApp();
  });

  // barra de status na cor do fundo do app (tema escuro)
  void StatusBar.setStyle({ style: Style.Dark }).catch(() => {});
  void StatusBar.setBackgroundColor({ color: '#131f2e' }).catch(() => {}); // = --bg do app.css
}

// ---- Haptics ----
// No-op na web; no nativo, feedback tátil curto. Falha silenciosa em aparelho
// sem vibração.
export function hapticSuccess() {
  if (!isNative) return;
  void Haptics.notification({ type: NotificationType.Success }).catch(() => {});
}

export function hapticError() {
  if (!isNative) return;
  void Haptics.notification({ type: NotificationType.Error }).catch(() => {});
}

export function hapticTap() {
  if (!isNative) return;
  void Haptics.impact({ style: ImpactStyle.Light }).catch(() => {});
}
