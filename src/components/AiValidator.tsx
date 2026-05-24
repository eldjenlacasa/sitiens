import { useState, useEffect } from "react";
import { 
  Send, 
  HelpCircle, 
  AlertCircle, 
  PlusCircle, 
  Loader2, 
  Compass, 
  Brain, 
  FileText, 
  ShieldAlert, 
  Workflow, 
  Activity, 
  CheckCircle2, 
  Flame, 
  Sparkles 
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface AIAnalysisResult {
  argumentSummary: string;
  axioms: string[];
  scientificAccuracy: {
    rating: string;
    analysis: string;
  };
  logicalFailures: string[];
  impactAnalysis: {
    sintiente: string;
    ecosistemic: string;
  };
  alternativeReflection: string;
}

interface AiValidatorProps {
  argumentToAnalyze: string | null;
  clearArgument: () => void;
}

const PRESET_EXCUSAS = [
  "Los seres humanos somos omnívoros por evolución fáctica.",
  "La ganadería extensiva respeta el bienestar animal y no daña nada.",
  "Comer carne estimula la economía, da empleo y mantiene tradiciones místicas.",
  "Si dejamos de comer animales, se reproducirían sin control y extinguirían los pastos."
];

export default function AiValidator({ argumentToAnalyze, clearArgument }: AiValidatorProps) {
  const [userInput, setUserInput] = useState("");
  const [analysis, setAnalysis] = useState<AIAnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (argumentToAnalyze) {
      setUserInput(argumentToAnalyze);
      handleOnSubmit(argumentToAnalyze);
      clearArgument(); // reset trigger on parent
    }
  }, [argumentToAnalyze]);

  const handleOnSubmit = async (textToSend: string) => {
    const finalVal = textToSend || userInput;
    if (!finalVal.trim()) return;

    setLoading(true);
    setError(null);
    setAnalysis(null);

    try {
      const response = await fetch("/api/analyze-argument", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ argument: finalVal, context: "Sitiens AI Validator" })
      });

      if (!response.ok) {
        throw new Error("El servidor no pudo procesar la solicitud de análisis. Comprueba la API key o reinténtalo.");
      }

      const data = await response.json();
      if (data.error) {
        throw new Error(data.error);
      }
      setAnalysis(data);
    } catch (err: any) {
      console.error(err);
      setError(err?.message || "Algo salió mal procesando el análisis.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div id="ai-validator-view" className="space-y-8 w-full max-w-6xl mx-auto">
      {/* Intro section */}
      <div className="bg-white dark:bg-zinc-950/40 p-6 lg:p-8 border border-zinc-200 dark:border-zinc-800/80 rounded-3xl grid grid-cols-1 md:grid-cols-12 gap-6 items-center transition-all duration-300">
        <div className="md:col-span-8 space-y-3">
          <h3 className="text-sm font-semibold tracking-wider font-mono text-zinc-800 dark:text-zinc-300 uppercase flex items-center gap-1.5">
            <Brain className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            Descompresor de Axiomas No Examinados
          </h3>
          <p className="text-zinc-600 dark:text-zinc-400 text-sm font-light leading-relaxed">
            Escribe cualquier argumento, justificación, dogma o excusa que utilices (o escuches) para continuar consumiendo animales. La Inteligencia Artificial Sitiens, equipada con datos empíricos de neurobiología, termodinámica y bioética laica, deconstruirá críticamente su validez lógica y expondrá sus sesgos de forma socrática.
          </p>
        </div>
        <div className="md:col-span-4 flex flex-wrap gap-2 justify-end">
          <span className="text-[10px] font-mono text-zinc-500 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 px-3 py-1.5 rounded-xl">
             Modo: Dialéctica Clínica
          </span>
        </div>
      </div>

      {/* Input Form Panel */}
      <div className="bg-white/40 dark:bg-zinc-900/10 backdrop-blur-md border border-zinc-200 dark:border-zinc-800/80 p-5 lg:p-6 rounded-3xl space-y-4 transition-all duration-300 shadow-sm dark:shadow-none">
        <div className="flex gap-2">
          <input
            type="text"
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") handleOnSubmit(""); }}
            placeholder="Introduce una excusa: ej. 'Los leones consumen carne y es natural que hagamos lo mismo'..."
            className="flex-1 bg-white dark:bg-zinc-950/60 border border-zinc-300 dark:border-zinc-800 focus:border-zinc-500 dark:focus:border-zinc-700 rounded-2xl px-5 py-4 text-xs font-sans placeholder-zinc-400 dark:placeholder-zinc-600 text-zinc-900 dark:text-white outline-none focus:ring-1 focus:ring-zinc-300 dark:focus:ring-zinc-700/50 transition-all shadow-sm dark:shadow-none"
            disabled={loading}
          />
          <button
            onClick={() => handleOnSubmit("")}
            disabled={loading || !userInput.trim()}
            className="px-6 py-4 rounded-2xl bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-zinc-200 text-white dark:text-zinc-950 font-semibold text-xs flex items-center gap-2 transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shadow-md dark:shadow-none"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            {loading ? "Analizando" : "Someter"}
          </button>
        </div>

        {/* Suggestion presets */}
        <div className="space-y-1.5">
          <span className="text-[10px] font-mono text-zinc-500 dark:text-zinc-500 uppercase tracking-widest block font-bold">
            Ejemplos clásicos para testear:
          </span>
          <div className="flex flex-wrap gap-2">
            {PRESET_EXCUSAS.map((preset, i) => (
              <button
                key={i}
                type="button"
                onClick={() => {
                  setUserInput(preset);
                  handleOnSubmit(preset);
                }}
                disabled={loading}
                className="text-xs px-3.5 py-2 rounded-xl bg-white hover:bg-zinc-50 hover:text-zinc-900 dark:bg-zinc-950 dark:hover:bg-zinc-900 dark:hover:text-white text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-800/80 transition-all flex items-center gap-1.5 hover:border-zinc-500 dark:hover:border-zinc-700 text-left cursor-pointer shadow-sm dark:shadow-none"
              >
                <PlusCircle className="w-3.5 h-3.5 text-zinc-400 dark:text-zinc-500 shrink-0" />
                {preset}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Loading Block */}
      {loading && (
        <div className="bg-white/60 dark:bg-zinc-950/20 p-12 border border-zinc-200 dark:border-zinc-800 rounded-3xl flex flex-col items-center justify-center text-center space-y-4 shadow-sm dark:shadow-none">
          <Loader2 className="w-10 h-10 animate-spin text-zinc-400 dark:text-zinc-600" />
          <div className="space-y-1">
            <h4 className="text-sm font-semibold text-zinc-900 dark:text-white tracking-tight">Diseccionando premisas lógicas...</h4>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 font-light max-w-sm">Evaluando nocicepción, termodinámica y buscando sesgos lógicos con la IA de Sitiens.</p>
          </div>
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-2xl p-4 flex gap-3 text-xs text-red-600 dark:text-red-400 shadow-sm dark:shadow-none">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <div className="space-y-1">
            <span className="font-semibold block">Error de deconstrucción</span>
            <span>{error}</span>
          </div>
        </div>
      )}

      {/* Structured report representation */}
      <AnimatePresence>
        {analysis && !loading && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.35 }}
            className="space-y-6 w-full"
          >
            <div className="border border-zinc-200 dark:border-zinc-800 rounded-3xl overflow-hidden bg-white/60 dark:bg-zinc-950/40 shadow-sm dark:shadow-none transition-all duration-300">
              
              {/* Header Box */}
              <div className="bg-zinc-50/50 dark:bg-zinc-900/35 border-b border-zinc-200 dark:border-zinc-800 p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 transition-colors">
                <div className="space-y-1">
                  <span className="text-[10px] font-mono tracking-widest text-zinc-500 dark:text-zinc-400 uppercase flex items-center gap-1 font-bold">
                    <Workflow className="w-3.5 h-3.5 text-zinc-500 dark:text-zinc-500" /> DIAGNÓSTICO DIALÉCTICO SITIENS
                  </span>
                  <h3 className="text-lg font-bold text-zinc-900 dark:text-white tracking-tight leading-normal font-serif">
                    &ldquo;{analysis.argumentSummary}&rdquo;
                  </h3>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono px-2.5 py-1 rounded bg-purple-50 dark:bg-purple-500/10 text-purple-700 dark:text-purple-400 border border-purple-200 dark:border-purple-500/20 font-semibold">
                    Sintaxis: Deconstruida
                  </span>
                </div>
              </div>

              {/* Body Modules */}
              <div className="p-6 grid grid-cols-1 lg:grid-cols-12 gap-8 text-xs font-light">
                
                {/* Section A: Axioms */}
                <div className="lg:col-span-5 space-y-4">
                  
                  {/* Axiomas list */}
                  <div className="space-y-2 bg-zinc-50/60 dark:bg-zinc-950/40 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800/80 transition-all">
                    <h4 className="text-xs font-semibold tracking-wider font-mono text-zinc-800 dark:text-zinc-300 uppercase flex items-center gap-1.5 border-b border-zinc-200 dark:border-zinc-900 pb-1.5 mb-2 transition-colors">
                      <ShieldAlert className="w-3.5 h-3.5 text-orange-600 dark:text-orange-400" />
                      Axiomas Implícitos No Examinados
                    </h4>
                    <p className="text-[11px] text-zinc-500 dark:text-zinc-500 leading-relaxed mb-3 transition-colors">
                      Estas son las verdades absolutas que tu mente da por válidas automáticamente para sostener tu justificación sin que te des cuenta:
                    </p>
                    <ul className="space-y-1.5">
                      {analysis.axioms.map((ax, i) => (
                        <li key={i} className="flex items-center gap-2 text-zinc-700 dark:text-zinc-300 bg-white/80 dark:bg-zinc-900/40 px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800/40 transition-colors shadow-sm dark:shadow-none">
                          <CheckCircle2 className="w-3.5 h-3.5 text-zinc-400 dark:text-zinc-600 shrink-0" />
                          <span>{ax}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Accuracy ratings */}
                  <div className="space-y-2 bg-zinc-50/60 dark:bg-zinc-950/40 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800/80 transition-all">
                    <h4 className="text-xs font-semibold tracking-wider font-mono text-zinc-800 dark:text-zinc-300 uppercase flex items-center gap-1.5 border-b border-zinc-200 dark:border-zinc-900 pb-1.5 mb-2 transition-colors">
                      <FileText className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                      Precisión Científica Real
                    </h4>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-[10px] font-mono px-2.5 py-0.5 rounded uppercase font-bold bg-zinc-200 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 transition-colors">
                        Calificación: {analysis.scientificAccuracy.rating}
                      </span>
                    </div>
                    <p className="text-[11px] text-zinc-600 dark:text-zinc-400/90 leading-relaxed font-light transition-colors">
                      {analysis.scientificAccuracy.analysis}
                    </p>
                  </div>

                </div>

                {/* Section B: Logical errors and environmental metrics */}
                <div className="lg:col-span-7 space-y-6 flex flex-col justify-between">
                  
                  {/* Logical fallacies */}
                  <div className="space-y-2 bg-zinc-50/60 dark:bg-zinc-950/40 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800/80 transition-all">
                    <h4 className="text-xs font-semibold tracking-wider font-mono text-zinc-800 dark:text-zinc-300 uppercase flex items-center gap-1.5 border-b border-zinc-200 dark:border-zinc-900 pb-1.5 mb-2 transition-colors">
                      <Compass className="w-3.5 h-3.5 text-pink-600 dark:text-pink-400" />
                      Deconstrucción Dialéctica y Sesgos
                    </h4>
                    <div className="space-y-3 font-light text-zinc-600 dark:text-zinc-400 transition-colors">
                      {analysis.logicalFailures.map((fail, i) => (
                        <p key={i} className="leading-relaxed text-xs">
                          {fail}
                        </p>
                      ))}
                    </div>
                  </div>

                  {/* Impact split details */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    
                    {/* Animal suffering */}
                    <div className="bg-zinc-50/60 dark:bg-zinc-950/40 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800/80 space-y-2 transition-colors">
                      <div className="flex items-center gap-1.5 text-red-600 dark:text-red-400 font-semibold font-mono text-[10px] tracking-wider uppercase transition-colors">
                        <Activity className="w-3.5 h-3.5 text-red-600 dark:text-red-500 animate-pulse" />
                        Variables de Sintiencia Aludidas
                      </div>
                      <p className="text-[10.5px] text-zinc-600 dark:text-zinc-400 leading-relaxed font-light transition-colors">
                        {analysis.impactAnalysis.sintiente}
                      </p>
                    </div>

                    {/* Green impact */}
                    <div className="bg-zinc-50/60 dark:bg-zinc-950/40 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800/80 space-y-2 transition-colors">
                      <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-semibold font-mono text-[10px] tracking-wider uppercase transition-colors">
                        <Flame className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-500" />
                        Desgaste Térmico Colateral
                      </div>
                      <p className="text-[10.5px] text-zinc-600 dark:text-zinc-400 leading-relaxed font-light transition-colors">
                        {analysis.impactAnalysis.ecosistemic}
                      </p>
                    </div>

                  </div>

                </div>

              </div>

              {/* Socratic concluding reflection */}
              <div className="bg-zinc-50/80 dark:bg-zinc-900/40 p-6 border-t border-zinc-200 dark:border-zinc-800 text-center space-y-3 relative overflow-hidden transition-colors">
                <div className="absolute left-6 top-1/2 -translate-y-1/2 opacity-[0.02] dark:opacity-[0.02] text-zinc-900 dark:text-white pointer-events-none">
                  <Brain className="w-24 h-24" />
                </div>
                <div className="flex items-center justify-center gap-1.5 text-zinc-500 dark:text-zinc-400 text-[10px] font-mono tracking-widest uppercase">
                  <Sparkles className="w-3 h-3 text-amber-600 dark:text-amber-500" />
                  PREGUNTA SOCRÁTICA FINAL SITIENS:
                </div>
                <p className="text-sm md:text-base font-serif italic text-zinc-900 dark:text-zinc-100 max-w-2xl mx-auto leading-relaxed transition-colors">
                  &ldquo;{analysis.alternativeReflection}&rdquo;
                </p>
              </div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
