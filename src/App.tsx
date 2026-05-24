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
  Moon
} from "lucide-react";
import NetworkGraph from "./components/NetworkGraph";
import ExcusesDilemmas from "./components/ExcusesDilemmas";
import ImpactCalculator from "./components/ImpactCalculator";
import AiValidator from "./components/AiValidator";
import { motion, AnimatePresence } from "motion/react";

type TabType = "grafo" | "dialectica" | "calculadora" | "validador";

export default function App() {
  const [activeTab, setActiveTab] = useState<TabType>("grafo");
  const [passedArgument, setPassedArgument] = useState<string | null>(null);
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

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 font-sans text-zinc-800 dark:text-zinc-200 selection:bg-zinc-200 dark:selection:bg-zinc-800 selection:text-zinc-900 dark:selection:text-white flex flex-col justify-between transition-colors duration-300">
      {/* Dynamic Upper Ambient Border Glow */}
      <div className="absolute top-0 left-0 right-0 h-[450px] bg-radial from-purple-950/5 dark:from-purple-950/15 via-transparent to-transparent pointer-events-none z-0" />

      {/* Primary header navbar container */}
      <header className="border-b border-zinc-200 dark:border-zinc-900 bg-white/80 dark:bg-zinc-950/85 backdrop-blur-md sticky top-0 z-50 transition-colors duration-300">
        <div id="navigation-bar" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          
          {/* Logo and Identity */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-red-500/10 via-purple-600/10 to-emerald-500/10 border border-zinc-200 dark:border-zinc-800 flex items-center justify-center relative overflow-hidden group transition-colors">
              <div className="absolute inset-0 bg-zinc-900/5 dark:bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity" />
              <Layers className="w-4 h-4 text-zinc-700 dark:text-zinc-300" />
            </div>
            <div>
              <h1 className="text-sm font-black text-zinc-900 dark:text-white tracking-widest font-mono uppercase">SITIENS</h1>
              <p className="text-[10px] text-zinc-500 font-medium tracking-tight">¿Qué vidas importan?</p>
            </div>
          </div>

          {/* Quick tab controllers & Theme Toggle */}
          <div className="flex items-center gap-3">
            <nav className="flex space-x-1 bg-zinc-100 dark:bg-zinc-900/60 p-1 rounded-xl border border-zinc-200 dark:border-zinc-900 transition-colors">
              {(
                [
                  { id: "grafo", label: "El Grafo" },
                  { id: "dialectica", label: "Tesis & Dilemas" },
                  { id: "calculadora", label: "El Cuantificador" },
                  { id: "validador", label: "Sitiens IA" }
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
            >
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 transition-colors">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse animate-duration-1500" />
                <span className="text-[10px] font-mono tracking-widest uppercase text-zinc-500 dark:text-zinc-400 font-bold">Iniciativa bioética laica</span>
              </div>
              <h2 className="text-3xl sm:text-5xl font-black text-zinc-900 dark:text-white tracking-tight leading-tight">
                ¿Qué vidas importan?
              </h2>
              <p className="text-zinc-600 dark:text-zinc-400 text-sm md:text-base font-light leading-relaxed max-w-3xl">
                Un análisis crítico sobre nuestra relación con los animales y los axiomas que la definen
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
                <NetworkGraph />
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
                <span className="font-bold text-zinc-900 dark:text-white text-xs">Mapeo del dolor</span>
              </div>
              <p className="text-zinc-500 dark:text-zinc-400 text-xs font-light leading-relaxed">
                Investiga las evidencias empíricas sobre el sistema nervioso central, la presencia de dolor consciente y la deconstrucción de la frontera vegetal.
              </p>
            </div>
            <div className="bg-white dark:bg-zinc-950 p-6 border border-zinc-200 dark:border-zinc-900 rounded-2xl space-y-2 transition-colors">
              <div className="flex items-center gap-2 mb-1">
                <span className="p-1 px-2 rounded bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-mono text-emerald-500 dark:text-emerald-400 font-bold">2</span>
                <span className="font-bold text-zinc-900 dark:text-white text-xs">Soterrar el Desgaste</span>
              </div>
              <p className="text-zinc-500 dark:text-zinc-400 text-xs font-light leading-relaxed">
                Analiza las variables de metano del ganado rumiante, la termodinámica ineficiente del filtrado de piensos y la deforestación de bosques para monocultivos de soja.
              </p>
            </div>
            <div className="bg-white dark:bg-zinc-950 p-6 border border-zinc-200 dark:border-zinc-900 rounded-2xl space-y-2 transition-colors">
              <div className="flex items-center gap-2 mb-1">
                <span className="p-1 px-2 rounded bg-amber-500/10 border border-amber-500/20 text-[10px] font-mono text-amber-600 dark:text-amber-400 font-bold">3</span>
                <span className="font-bold text-zinc-900 dark:text-white text-xs">Deconstrucción</span>
              </div>
              <p className="text-zinc-500 dark:text-zinc-400 text-xs font-light leading-relaxed">
                Examina los dogmas y axiomas morales de nuestra cultura con una aproximación socrática y asimila los recursos modernos de la suplementación de B12.
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
            <span>Sitiens es un proyecto educativo de libre deconstrucción moral.</span>
          </div>
          <div>
            <span>Nutrido socráticamente con neurobiología y física de ecosistemas.</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
