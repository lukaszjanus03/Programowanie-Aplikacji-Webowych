import { ReactNode, useEffect, useState } from "react";
import { store, EFFECTIVE_STORAGE_MODE } from "./storage";
import { activeProjectApi } from "./api/activeProjectApi";
import { userManager } from "./api/userManager";
import { STORAGE_MODE, IS_FIREBASE_CONFIGURED } from "./config";

interface BootstrapProps {
  children: ReactNode;
}

type BootState =
  | { kind: "loading" }
  | { kind: "ready" }
  | { kind: "error"; message: string };

export default function Bootstrap({ children }: BootstrapProps) {
  const [state, setState] = useState<BootState>({ kind: "loading" });

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        await store.bootstrap();
        await activeProjectApi.bootstrap();
        await userManager.bootstrapCurrentUser();
        if (!cancelled) setState({ kind: "ready" });
      } catch (e) {
        if (!cancelled) {
          setState({
            kind: "error",
            message:
              e instanceof Error
                ? e.message
                : "Nie udało się zainicjować magazynu danych.",
          });
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  if (state.kind === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-300 font-sans">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm uppercase tracking-widest text-slate-500">
            Ładowanie danych…
          </p>
          <p className="text-xs text-slate-600 mt-1 font-mono">
            Tryb: {EFFECTIVE_STORAGE_MODE}
          </p>
        </div>
      </div>
    );
  }

  if (state.kind === "error") {
    const wantedFirestore = STORAGE_MODE === "firestore";
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-200 font-sans px-6">
        <div className="max-w-lg bg-red-500/10 border border-red-500/30 rounded-2xl p-8">
          <div className="text-5xl mb-3">⚠️</div>
          <h1 className="text-xl font-bold mb-3 text-red-300">
            Nie udało się załadować danych
          </h1>
          <p className="text-sm text-slate-300 mb-3">{state.message}</p>
          {wantedFirestore && !IS_FIREBASE_CONFIGURED && (
            <p className="text-xs text-slate-400 mb-3">
              Wygląda na to, że wybrałeś tryb <code>firestore</code>, ale brakuje
              kluczy Firebase. Sprawdź plik <code>.env</code>.
            </p>
          )}
          <p className="text-xs text-slate-500 font-mono">
            Tryb: {EFFECTIVE_STORAGE_MODE}
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
