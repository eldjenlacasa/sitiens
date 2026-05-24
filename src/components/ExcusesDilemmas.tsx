import { useState } from "react";
import { DILEMMAS_DATA, DilemmaDetail, ConsensusType } from "../types";
import { 
  Compass, 
  Search, 
  Activity, 
  Globe, 
  Scale, 
  HelpCircle, 
  BookOpen, 
  Flame, 
  Grid, 
  ChevronRight, 
  Terminal, 
  ShieldAlert, 
  Brain,
  Sparkles
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface ExcusesDilemmasProps {
  onAnalyzeTrigger: (excuseText: string) => void;
}

export default function ExcusesDilemmas({ onAnalyzeTrigger }: ExcusesDilemmasProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedConsensus, setSelectedConsensus] = useState<string>("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const getConsensusColor = (consensus: ConsensusType) => {
    switch (consensus) {
      case "CONSENSO":
        return "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20";
      case "DILEMA":
        return "bg-amber-500/10 text-amber-400 border border-amber-500/20";
      case "ESCENARIO_GRIS":
        return "bg-purple-500/10 text-purple-400 border border-purple-500/20";
      case "FALACIA":
        return "bg-red-500/10 text-red-500 border border-red-500/20";
      default:
        return "bg-zinc-800 text-zinc-400 border border-zinc-700";
    }
  };

  const getCategoryIconByString = (cat: string) => {
    switch (cat) {
      case "sintiencia":
        return <Activity className="w-4 h-4 text-red-400" />;
      case "clima":
        return <Globe className="w-4 h-4 text-emerald-400" />;
      case "historia":
         return <BookOpen className="w-4 h-4 text-blue-400" />;
      case "eleccion":
        return <Scale className="w-4 h-4 text-amber-400" />;
      default:
        return <HelpCircle className="w-4 h-4 text-zinc-500" />;
    }
  };

  const filteredDilemmas = DILEMMAS_DATA.filter((dilemma) => {
    const matchesSearch =
      dilemma.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dilemma.popularStatement.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dilemma.scientificDeconstruction.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dilemma.philosophicalDeconstruction.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = selectedCategory === "all" || dilemma.category === selectedCategory;
    const matchesConsensus = selectedConsensus === "all" || dilemma.consensus === selectedConsensus;

    return matchesSearch && matchesCategory && matchesConsensus;
  });

  return (
    <div id="excuses-dialectic-view" className="space-y-8 w-full max-w-6xl mx-auto">
      
      {/* Search and Filters Layout */}
      <div className="bg-zinc-900/10 backdrop-blur-md p-5 lg:p-6 border border-zinc-800/80 rounded-3xl grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
        
        {/* Search Input */}
        <div className="md:col-span-4 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar justificación..."
            className="w-full bg-zinc-950/60 border border-zinc-800 focus:border-zinc-750 rounded-2xl pl-11 pr-4 py-3 text-xs text-white placeholder-zinc-500 outline-none focus:ring-1 focus:ring-zinc-700/50 transition-all font-sans"
          />
        </div>

        {/* Category Filter */}
        <div className="md:col-span-4 select-none flex flex-wrap gap-1.5 items-center">
          <span className="text-[10px] font-mono text-zinc-500 uppercase mr-1">Pilar:</span>
          <div className="flex gap-1.5 flex-wrap">
            {["all", "sintiencia", "historia", "clima", "eleccion"].map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`text-[10.5px] px-2.5 py-1.5 rounded-xl border transition-all cursor-pointer capitalize font-sans ${
                  selectedCategory === cat
                    ? "bg-white text-zinc-950 border-white font-medium"
                    : "bg-zinc-950 text-zinc-400 border-zinc-800/80 hover:border-zinc-700 hover:text-white"
                }`}
              >
                {cat === "all" ? "Todos" : cat}
              </button>
            ))}
          </div>
        </div>

        {/* Consensus Filter */}
        <div className="md:col-span-4 select-none flex flex-wrap gap-1.5 items-center md:justify-end">
          <span className="text-[10px] font-mono text-zinc-500 uppercase mr-1">Consenso:</span>
          <div className="flex gap-1.5 flex-wrap font-mono">
            {["all", "CONSENSO", "DILEMA", "ESCENARIO_GRIS", "FALACIA"].map((con) => (
              <button
                key={con}
                onClick={() => setSelectedConsensus(con)}
                className={`text-[10px] px-2.5 py-1.5 rounded-xl border transition-all cursor-pointer uppercase ${
                  selectedConsensus === con
                    ? "bg-zinc-100 text-zinc-950 border-zinc-100 font-bold"
                    : "bg-zinc-950 text-zinc-500 border-zinc-800/80 hover:border-zinc-700 hover:text-zinc-300"
                }`}
              >
                {con === "all" ? "Todos" : con.replace("_", " ")}
              </button>
            ))}
          </div>
        </div>

      </div>

      {/* Grid representation */}
      {filteredDilemmas.length === 0 ? (
        <div className="bg-zinc-900/10 border border-zinc-850 p-12 rounded-3xl text-center space-y-3">
          <HelpCircle className="w-10 h-10 stroke-1 text-zinc-700 mx-auto" />
          <div className="space-y-1">
            <h4 className="text-sm font-semibold text-white tracking-tight">Sin correspondencias</h4>
            <p className="text-xs text-zinc-500 font-light">Ninguna justificación coincide con los filtros especificados.</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
          
          {/* Main dilemmas cards flow */}
          <div className="md:col-span-7 space-y-4">
            {filteredDilemmas.map((dilemma) => (
              <div 
                key={dilemma.id}
                onClick={() => setExpandedId(expandedId === dilemma.id ? null : dilemma.id)}
                className={`group border rounded-3xl p-5 lg:p-6 cursor-pointer select-none transition-all ${
                  expandedId === dilemma.id 
                    ? "bg-zinc-900/30 border-zinc-700/80 shadow-md translate-y-[-1px]" 
                    : "bg-zinc-950/20 border-zinc-800/80 hover:border-zinc-750 hover:bg-zinc-950/40"
                }`}
              >
                <div className="flex items-center justify-between gap-4 mb-3">
                  <div className="flex items-center gap-1.5">
                    {getCategoryIconByString(dilemma.category)}
                    <span className="text-[10px] font-mono tracking-wider text-zinc-500 uppercase font-light">
                      {dilemma.category}
                    </span>
                  </div>
                  <span className={`text-[9px] font-mono font-bold tracking-widest px-2.5 py-0.5 rounded ${getConsensusColor(dilemma.consensus)}`}>
                    {dilemma.consensus.replace("_", " ")}
                  </span>
                </div>

                <div className="flex justify-between items-start gap-4">
                  <h3 className="text-sm lg:text-base font-bold text-white tracking-tight leading-snug group-hover:text-white transition-colors">
                    {dilemma.title}
                  </h3>
                  <ChevronRight className={`w-5 h-5 text-zinc-650 shrink-0 transform transition-transform ${
                    expandedId === dilemma.id ? "rotate-90 text-white" : ""
                  }`} />
                </div>

                <p className="text-xs text-zinc-440 font-light leading-relaxed mt-2.5 italic border-l-2 border-zinc-800 pl-3">
                  &ldquo;{dilemma.popularStatement}&rdquo;
                </p>

                {expandedId === dilemma.id && (
                  <div className="mt-4 pt-4 border-t border-zinc-800/80 flex justify-end">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onAnalyzeTrigger(dilemma.popularStatement);
                      }}
                      className="text-[11px] font-semibold text-zinc-950 bg-white hover:bg-zinc-100 rounded-xl px-4 py-2 flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-zinc-800" />
                      Deconstruir con IA de Sitiens
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Side panel for expanded dilemma details */}
          <div className="md:col-span-5 sticky top-28 bg-zinc-950/40 border border-zinc-800/80 p-6 rounded-3xl min-h-[350px] flex flex-col justify-between">
            <AnimatePresence mode="wait">
              {expandedId ? (
                (() => {
                  const current = DILEMMAS_DATA.find((d) => d.id === expandedId)!;
                  return (
                    <motion.div
                      key={current.id}
                      initial={{ opacity: 0, scale: 0.98 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.98 }}
                      transition={{ duration: 0.2 }}
                      className="space-y-6 flex-1 flex flex-col justify-between"
                    >
                      <div className="space-y-5">
                        
                        {/* Title and Badge */}
                        <div className="space-y-1">
                          <span className={`text-[9px] font-mono tracking-widest px-2.5 py-0.5 rounded font-bold ${getConsensusColor(current.consensus)}`}>
                            DECONSTRUCCIÓN CLINICA: {current.consensus}
                          </span>
                          <h2 className="text-lg font-extrabold text-white tracking-tight pt-1">
                            {current.title}
                          </h2>
                        </div>

                        {/* Popular justification placeholder */}
                        <div className="bg-zinc-950 p-4 border border-zinc-900 rounded-2xl relative overflow-hidden">
                          <span className="text-[9px] font-mono text-zinc-600 uppercase tracking-wider block mb-1">Premisa Popular Escuchada</span>
                          <blockquote className="text-zinc-350 text-xs font-serif italic leading-relaxed">
                            &ldquo;{current.popularStatement}&rdquo;
                          </blockquote>
                        </div>

                        {/* Scientific panel */}
                        <div className="space-y-1.5">
                          <h4 className="text-[11px] font-mono font-medium text-cyan-400 uppercase tracking-wider flex items-center gap-1">
                            <Terminal className="w-3.5 h-3.5" />
                            Análisis Fisiológico / Científico
                          </h4>
                          <p className="text-xs text-zinc-400 font-light leading-relaxed">
                            {current.scientificDeconstruction}
                          </p>
                        </div>

                        {/* Philosophical panel */}
                        <div className="space-y-1.5">
                          <h4 className="text-[11px] font-mono font-medium text-amber-500 uppercase tracking-wider flex items-center gap-1">
                            <Brain className="w-3.5 h-3.5" />
                            Deconstrucción Ética / Lógica
                          </h4>
                          <p className="text-xs text-zinc-400 font-light leading-relaxed">
                            {current.philosophicalDeconstruction}
                          </p>
                        </div>

                        {/* Bio-Coexistence summary */}
                        <div className="space-y-1.5 p-3 rounded-xl border border-zinc-900 bg-zinc-950/20">
                          <h4 className="text-[10px] font-mono font-medium text-purple-400 uppercase tracking-wider flex items-center gap-1">
                            <ShieldAlert className="w-3.5 h-3.5" />
                            Impacto en la Coexistencia
                          </h4>
                          <p className="text-[11px] text-zinc-450 leading-relaxed font-light">
                            {current.coexistenceImpact}
                          </p>
                        </div>

                      </div>

                    </motion.div>
                  );
                })()
              ) : (
                <div className="flex flex-col items-center justify-center text-center h-full text-zinc-500 my-16 space-y-3">
                  <Compass className="w-12 h-12 stroke-1 text-zinc-700 animate-spin-slow" />
                  <div className="space-y-1">
                    <h3 className="text-sm font-semibold text-zinc-400">Tesis No Descolgada</h3>
                    <p className="text-xs text-zinc-500 font-light max-w-xs mx-auto">Selecciona cualquiera de las premisas dialécticas de la izquierda para desglosar su precisión científica y refutación filosófica.</p>
                  </div>
                </div>
              )}
            </AnimatePresence>
          </div>

        </div>
      )}

    </div>
  );
}
