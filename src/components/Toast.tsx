export interface ToastMessage { id: number; kind: 'success' | 'error' | 'info'; text: string }
export function Toast({ messages }: { messages: ToastMessage[] }) { return <div className="toast-stack" aria-live="polite">{messages.map((message) => <div className={`toast toast-${message.kind}`} key={message.id}><span>{message.kind === 'error' ? '!' : '✓'}</span>{message.text}</div>)}</div> }
