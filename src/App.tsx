import { useState, useEffect } from "react";
import { 
  Compass, 
  Layers, 
  Activity, 
  HelpCircle, 
  Scale, 
  Leaf, 
  Flame, 
  Network, 
  Sparkles, 
  Heart,
  ChevronRight,
  TrendingDown,
  Info,
  Sun,
  Moon,
  Clock
} from "lucide-react";
import ConceptExplorer from "./components/ConceptExplorer";
import TimelineExplorer from "./components/TimelineExplorer";
import ExcusesDilemmas from "./components/ExcusesDilemmas";
import ImpactCalculator from "./components/ImpactCalculator";
import AiValidator from "./components/AiValidator";
import { motion, AnimatePresence } from "motion/react";

type TabType = "grafo" | "cronologia" | "dialectica" | "calculadora" | "validador";

export default function App() {
  const [activeTab, setActiveTab] = useState<TabType>("grafo");
  const [passedArgument, setPassedArgument] = useState<string | null>(null);
  const [redirectNodeId, setRedirectNodeId] = useState<string | null>(null);
  const [theme, setTheme] = useState<"dark" | "light">(() => {
    const saved = localStorage.getItem("theme");
    if (saved === "light" || saved === "dark") return saved;
    // Default to dark for premium bioethical vibe
    return "dark";
  });

  useEffect(() => {
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    localStorage.setItem("theme", theme);
  }, [theme]);

  const handleDeconstructTrigger = (excuse: string) => {
    setPassedArgument(excuse);
    setActiveTab("validador");
  };

  const handleClearTrigger = () => {
    setPassedArgument(null);
  };

  const handleRedirectToConcept = (nodeId: string) => {
    setRedirectNodeId(nodeId);
    setActiveTab("grafo");
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 font-sans text-zinc-800 dark:text-zinc-200 selection:bg-zinc-200 dark:selection:bg-zinc-800 selection:text-zinc-900 dark:selection:text-white flex flex-col justify-between transition-colors duration-300 pb-24 md:pb-0">
      {/* Dynamic Upper Ambient Border Glow */}
      <div className="absolute top-0 left-0 right-0 h-[450px] bg-radial from-purple-950/5 dark:from-purple-950/15 via-transparent to-transparent pointer-events-none z-0" />

      {/* Primary header navbar container */}
      <header className="border-b border-zinc-200 dark:border-zinc-900 bg-white/80 dark:bg-zinc-950/85 backdrop-blur-md sticky top-0 z-50 transition-colors duration-300">
        <div id="navigation-bar" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          
          {/* Logo and Identity */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-rose-500/10 via-purple-600/10 to-emerald-500/10 border border-zinc-200/80 dark:border-zinc-800/85 flex items-center justify-center relative overflow-hidden group transition-all duration-300 shadow-inner">
              <div className="absolute inset-0 bg-zinc-900/5 dark:bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity" />
              {/* Custom SVG logo representing sentience (heart + neural connection + leaf) */}
              <svg className="w-5 h-5 transition-transform duration-300 group-hover:scale-110" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2C8 2 4.5 5.5 4.5 9.5C4.5 15 12 22 12 22C12 22 19.5 15 19.5 9.5C19.5 5.5 16 2 12 2Z" className="stroke-zinc-700 dark:stroke-zinc-300" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M12 6C10.5 7.5 9.5 9 9.5 10.5C9.5 12 10.5 13.5 12 15C13.5 13.5 14.5 12 14.5 10.5C14.5 9 13.5 7.5 12 6Z" className="fill-rose-500/80 dark:fill-rose-400/90 stroke-rose-500 dark:stroke-rose-400" strokeWidth="0.8" />
                <circle cx="12" cy="10.5" r="2.5" className="fill-white dark:fill-zinc-950 stroke-purple-500 dark:stroke-purple-400" strokeWidth="1.2" />
              </svg>
            </div>
            <h1 className="text-sm font-black text-zinc-900 dark:text-white tracking-widest font-mono uppercase">SINTIENS</h1>
          </div>

          {/* Quick tab controllers & Theme Toggle */}
          <div className="flex items-center gap-3">
            <nav className="hidden md:flex space-x-1 bg-zinc-100 dark:bg-zinc-900/60 p-1 rounded-xl border border-zinc-200 dark:border-zinc-900 transition-colors">
              {(
                [
                  { id: "grafo", label: "Conceptos" },
                  { id: "cronologia", label: "Cronología" },
                  { id: "dialectica", label: "Tesis & Dilemas" },
                  { id: "calculadora", label: "El Cuantificador" },
                  { id: "validador", label: "Sintiens IA" }
                ] as { id: TabType; label: string }[]
              ).map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium tracking-tight transition-all duration-200 cursor-pointer ${
                    activeTab === tab.id
                      ? "bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-sm border border-zinc-200/50 dark:border-transparent"
                      : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-200/50 dark:hover:bg-zinc-900/50"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>

            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="p-2 rounded-xl bg-zinc-100 dark:bg-zinc-900 hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white border border-zinc-200 dark:border-zinc-800 transition-all cursor-pointer flex items-center justify-center"
              title={theme === "dark" ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
            >
              {theme === "dark" ? (
                <motion.div initial={{ rotate: -30 }} animate={{ rotate: 0 }} transition={{ duration: 0.25 }}>
                  <Sun className="w-4 h-4 text-amber-400" />
                </motion.div>
              ) : (
                <motion.div initial={{ rotate: 30 }} animate={{ rotate: 0 }} transition={{ duration: 0.25 }}>
                  <Moon className="w-4 h-4 text-violet-600" />
                </motion.div>
              )}
            </button>
          </div>

        </div>
      </header>

      {/* Main core layout wrapper */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12 relative z-10 space-y-12">
                {/* Welcome Section */}
        <AnimatePresence mode="wait">
          {activeTab === "grafo" && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
              className="space-y-4 max-w-4xl"
              key="welcome-grafo"
            >
              {/* Badge removed for cleaner header spacing */}
              <h2 className="text-3xl sm:text-5xl font-black text-zinc-900 dark:text-white tracking-tight leading-tight">
                ¿Qué vidas importan?
              </h2>
              <p className="text-zinc-650 dark:text-zinc-400 text-sm md:text-base font-light leading-relaxed max-w-3xl">
                Un análisis crítico sobre nuestra relación con los animales y los axiomas que la definen
              </p>
            </motion.div>
          )}

          {activeTab === "cronologia" && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
              className="space-y-4 max-w-4xl"
              key="welcome-cronologia"
            >
              <h2 className="text-3xl sm:text-5xl font-black text-zinc-900 dark:text-white tracking-tight leading-tight">
                La Brecha del Progreso
              </h2>
              <p className="text-zinc-650 dark:text-zinc-400 text-sm md:text-base font-light leading-relaxed max-w-3xl">
                Explora la evolución de la instrumentalización animal y el retraso histórico de la moral humana
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Selected View Space */}
        <div className="w-full">
          <AnimatePresence mode="wait">
            {activeTab === "grafo" && (
              <motion.div
                key="grafo"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.25 }}
                className="w-full"
              >
                <ConceptExplorer 
                  initialNodeId={redirectNodeId} 
                  onClearInitialNodeId={() => setRedirectNodeId(null)} 
                />
              </motion.div>
            )}

            {activeTab === "cronologia" && (
              <motion.div
                key="cronologia"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.25 }}
                className="w-full"
              >
                <TimelineExplorer onRedirectToConcept={handleRedirectToConcept} />
              </motion.div>
            )}

            {activeTab === "dialectica" && (
              <motion.div
                key="dialectica"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.25 }}
                className="w-full"
              >
                <ExcusesDilemmas onAnalyzeTrigger={handleDeconstructTrigger} />
              </motion.div>
            )}

            {activeTab === "calculadora" && (
              <motion.div
                key="calculadora"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.25 }}
                className="w-full"
              >
                <ImpactCalculator />
              </motion.div>
            )}

            {activeTab === "validador" && (
              <motion.div
                key="validador"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.25 }}
                className="w-full"
              >
                <AiValidator argumentToAnalyze={passedArgument} clearArgument={handleClearTrigger} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Dynamic Static Information Segment */}
        {activeTab === "grafo" && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6">
            <div className="bg-white dark:bg-zinc-950 p-6 border border-zinc-200 dark:border-zinc-900 rounded-2xl space-y-2 transition-colors">
              <div className="flex items-center gap-2 mb-1">
                <span className="p-1 px-2 rounded bg-red-500/10 border border-red-500/20 text-[10px] font-mono text-red-500 dark:text-red-400 font-bold">1</span>
                <span className="font-bold text-zinc-900 dark:text-white text-xs">Mapeo Sintiente</span>
              </div>
              <p className="text-zinc-500 dark:text-zinc-400 text-xs font-light leading-relaxed">
                Investiga la neurobiología del dolor físico consciente, la Declaración de Cambridge sobre la Conciencia y la deconstrucción de la frontera vegetal.
              </p>
            </div>
            <div className="bg-white dark:bg-zinc-950 p-6 border border-zinc-200 dark:border-zinc-900 rounded-2xl space-y-2 transition-colors">
              <div className="flex items-center gap-2 mb-1">
                <span className="p-1 px-2 rounded bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-mono text-emerald-500 dark:text-emerald-400 font-bold">2</span>
                <span className="font-bold text-zinc-900 dark:text-white text-xs">Desgaste Biosférico</span>
              </div>
              <p className="text-zinc-500 dark:text-zinc-400 text-xs font-light leading-relaxed">
                Analiza la ineficiencia termodinámica del filtrado calórico a través del ganado, el forzamiento del metano y la deforestación de hábitats silvestres colaterales.
              </p>
            </div>
            <div className="bg-white dark:bg-zinc-950 p-6 border border-zinc-200 dark:border-zinc-900 rounded-2xl space-y-2 transition-colors">
              <div className="flex items-center gap-2 mb-1">
                <span className="p-1 px-2 rounded bg-purple-500/10 border border-purple-500/20 text-[10px] font-mono text-purple-600 dark:text-purple-400 font-bold">3</span>
                <span className="font-bold text-zinc-900 dark:text-white text-xs">Justicia y Deconstrucción</span>
              </div>
              <p className="text-zinc-500 dark:text-zinc-400 text-xs font-light leading-relaxed">
                Explora el especismo, los derechos de los animales y el veganismo como imperativos de consistencia ética frente a excusas culturales tradicionales.
              </p>
            </div>
          </div>
        )}

      </main>

      {/* Simple, descriptive minimal footer */}
      <footer className="border-t border-zinc-200 dark:border-zinc-900/60 py-6 mt-16 bg-white dark:bg-zinc-950 transition-colors">
        <div id="footer-section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-4 text-[11px] font-mono text-zinc-500 dark:text-zinc-600">
          <div className="flex items-center gap-1.5">
            <Heart className="w-3.5 h-3.5 text-zinc-400 dark:text-zinc-700" />
            <span>Sintiens es un proyecto educativo de libre deconstrucción moral.</span>
          </div>
          <div>
            <span>Nutrido socráticamente con neurobiología y física de ecosistemas.</span>
          </div>
        </div>
      </footer>

      {/* Floating Sticky Bottom Mobile Navigation Bar */}
      <div className="md:hidden fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-[92%] max-w-[400px] bg-white/80 dark:bg-zinc-950/85 backdrop-blur-xl border border-zinc-200/80 dark:border-zinc-900/80 p-2 rounded-2xl flex items-center justify-around shadow-2xl transition-all duration-300">
        {(
          [
            { id: "grafo", label: "Conceptos", icon: Network },
            { id: "cronologia", label: "Historia", icon: Clock },
            { id: "dialectica", label: "Tesis", icon: Scale },
            { id: "calculadora", label: "Impacto", icon: Activity },
            { id: "validador", label: "Sintiens IA", icon: Sparkles }
          ] as { id: TabType; label: string; icon: any }[]
        ).map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-col items-center gap-1 py-1.5 px-3 rounded-xl transition-all duration-200 relative cursor-pointer ${
                isActive
                  ? "text-zinc-950 dark:text-white"
                  : "text-zinc-400 dark:text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300"
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId="activeBottomTabGlow"
                  className="absolute inset-0 bg-zinc-100 dark:bg-zinc-900 rounded-xl -z-10 border border-zinc-200/30 dark:border-zinc-850"
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              )}
              <Icon className={`w-4 h-4 transition-transform duration-200 ${isActive ? "scale-110" : ""}`} />
              <span className="text-[9px] font-mono tracking-tight font-bold">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
