export interface Toast { id: number; html: string; }

export default function Toasts({ toasts }: { toasts: Toast[] }) {
  return (
    <div id="toast-container">
      {toasts.map(t => (
        <div key={t.id} className="toast" dangerouslySetInnerHTML={{ __html: t.html }} />
      ))}
    </div>
  );
}
