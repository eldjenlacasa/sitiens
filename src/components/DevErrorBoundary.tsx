import React, { ErrorInfo, ReactNode } from "react";
import { AlertCircle, RotateCcw } from "lucide-react";

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export default class DevErrorBoundary extends React.Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error inside DevMode:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="fixed bottom-24 right-6 z-[100] p-6 bg-white dark:bg-zinc-950 border border-rose-500/30 rounded-3xl space-y-4 max-w-sm w-[90vw] text-left shadow-2xl animate-fadeIn backdrop-blur-md dev-mode-ui">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-rose-500/10 rounded-xl text-rose-500 shrink-0">
              <AlertCircle className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h3 className="font-bold text-xs text-rose-600 dark:text-rose-400">
                Error en Tablero de Desarrollo
              </h3>
              <p className="text-[10px] text-zinc-500 dark:text-zinc-450 font-light mt-0.5 leading-relaxed">
                React capturó una excepción en el renderizado del tablero. La web principal sigue a salvo.
              </p>
            </div>
          </div>

          <div className="bg-zinc-950 border border-zinc-900 p-3 rounded-xl text-[9px] font-mono text-rose-400/90 overflow-x-auto max-h-[120px] leading-relaxed shadow-inner select-text">
            <strong>{this.state.error && this.state.error.toString()}</strong>
            {this.state.error && this.state.error.stack && (
              <pre className="mt-1.5 text-zinc-500 text-[8px] leading-normal font-sans">
                {this.state.error.stack.split("\n").slice(0, 3).join("\n")}
              </pre>
            )}
          </div>

          <button
            onClick={() => {
              (this as any).setState({ hasError: false, error: null });
              window.location.reload();
            }}
            className="w-full bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-zinc-200 text-white dark:text-zinc-950 font-bold text-[10px] py-2 rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer active:scale-95"
          >
            <RotateCcw className="w-3 h-3" />
            Recargar y Restaurar
          </button>
        </div>
      );
    }

    return (this as any).props.children;
  }
}
