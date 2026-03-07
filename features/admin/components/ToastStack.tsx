import type { Toast } from "../types";

type ToastStackProps = {
  toasts: Toast[];
};

export function ToastStack({ toasts }: ToastStackProps) {
  return (
    <div className="toast-stack">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`toast ${toast.type === "error" ? "error" : "success"}`}
        >
          {toast.message}
        </div>
      ))}
    </div>
  );
}
