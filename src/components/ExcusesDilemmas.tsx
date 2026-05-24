import React, { useState, useRef, useEffect } from "react";
import { DILEMMAS_DATA, DilemmaDetail, ConsensusType } from "../types";
import { 
  Compass, 
  Search, 
  Activity, 
  Globe, 
  BookOpen, 
  Scale, 
  HelpCircle, 
  ChevronRight, 
  Terminal, 
  ShieldAlert, 
  Brain,
  Sparkles,
  ChevronUp,
  ChevronDown,
  ExternalLink
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import TextRenderer from "./TextRenderer";

interface ExcusesDilemmasProps {
  onAnalyzeTrigger: (excuseText: string) => void;
}

export default function ExcusesDilemmas({ onAnalyzeTrigger }: ExcusesDilemmasProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedConsensus, setSelectedConsensus] = useState<string>("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [isBibliographyOpen, setIsBibliographyOpen] = useState(false);

  // Collapse bibliography when expanded dilemma changes
  useEffect(() => {
    setIsBibliographyOpen(false);
  }, [expandedId]);

  useEffect(() => {
    const handleExpand = (e: Event) => {
      const customEvent = e as CustomEvent<string>;
      const dilemmaId = customEvent.detail;
      if (!dilemmaId) return;

      const exists = DILEMMAS_DATA.some(d => d.id === dilemmaId);
      if (exists) {
        setExpandedId(dilemmaId);
        setSearchQuery("");
        setSelectedCategory("all");
        setSelectedConsensus("all");
        
        setTimeout(() => {
          const el = document.getElementById("excuses-dialectic-view");
          if (el) {
            el.scrollIntoView({ behavior: "smooth" });
          }
        }, 100);
      }
    };
    window.addEventListener("expand-dilemma", handleExpand);
    return () => window.removeEventListener("expand-dilemma", handleExpand);
  }, []);

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
      case "ecologia":
        return <Globe className="w-4 h-4 text-emerald-400" />;
      case "historia":
         return <BookOpen className="w-4 h-4 text-blue-400" />;
      case "etica":
        return <Scale className="w-4 h-4 text-purple-400" />;
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
      <div className="bg-white/40 dark:bg-zinc-900/10 backdrop-blur-md p-5 lg:p-6 border border-zinc-200 dark:border-zinc-800/80 rounded-3xl grid grid-cols-1 md:grid-cols-12 gap-4 items-center transition-all duration-300">
        
        {/* Search Input */}
        <div className="md:col-span-4 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 dark:text-zinc-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar justificación..."
            className="w-full bg-white dark:bg-zinc-950/60 border border-zinc-200 dark:border-zinc-800 focus:border-zinc-400 dark:focus:border-zinc-700 rounded-2xl pl-11 pr-4 py-3 text-xs text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500 outline-none focus:ring-1 focus:ring-zinc-300 dark:focus:ring-zinc-700/50 transition-all font-sans"
          />
        </div>

        {/* Category Filter */}
        <div className="md:col-span-4 select-none flex flex-wrap gap-1.5 items-center">
          <span className="text-[10px] font-mono text-zinc-400 dark:text-zinc-500 uppercase mr-1">Pilar:</span>
          <div className="flex gap-1.5 flex-wrap">
            {["all", "sintiencia", "historia", "ecologia", "etica"].map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`text-[10.5px] px-2.5 py-1.5 rounded-xl border transition-all cursor-pointer capitalize font-sans ${
                  selectedCategory === cat
                    ? "bg-zinc-900 dark:bg-white text-white dark:text-zinc-950 border-zinc-900 dark:border-white font-semibold"
                    : "bg-white dark:bg-zinc-950 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-800/80 hover:border-zinc-400 dark:hover:border-zinc-700 hover:text-zinc-900 dark:hover:text-white shadow-sm dark:shadow-none"
                }`}
              >
                {cat === "all" ? "Todos" : 
                 cat === "sintiencia" ? "Sintiencia" :
                 cat === "historia" ? "Historia" :
                 cat === "ecologia" ? "Ecología" : "Ética y Derechos"}
              </button>
            ))}
          </div>
        </div>

        {/* Consensus Filter */}
        <div className="md:col-span-4 select-none flex flex-wrap gap-1.5 items-center md:justify-end">
          <span className="text-[10px] font-mono text-zinc-400 dark:text-zinc-500 uppercase mr-1">Consenso:</span>
          <div className="flex gap-1.5 flex-wrap font-mono">
            {["all", "CONSENSO", "DILEMA", "ESCENARIO_GRIS", "FALACIA"].map((con) => (
              <button
                key={con}
                onClick={() => setSelectedConsensus(con)}
                className={`text-[10px] px-2.5 py-1.5 rounded-xl border transition-all cursor-pointer uppercase ${
                  selectedConsensus === con
                    ? "bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-950 border-zinc-900 dark:border-zinc-100 font-bold"
                    : "bg-white dark:bg-zinc-950 text-zinc-600 dark:text-zinc-500 border-zinc-200 dark:border-zinc-800/80 hover:border-zinc-400 dark:hover:border-zinc-700 hover:text-zinc-900 dark:hover:text-zinc-300 shadow-sm dark:shadow-none"
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
        <div className="bg-white/40 dark:bg-zinc-900/10 border border-zinc-200 dark:border-zinc-800 p-12 rounded-3xl text-center space-y-3 shadow-sm dark:shadow-none transition-all duration-300">
          <HelpCircle className="w-10 h-10 stroke-1 text-zinc-400 dark:text-zinc-700 mx-auto" />
          <div className="space-y-1">
            <h4 className="text-sm font-semibold text-zinc-900 dark:text-white tracking-tight border-none">Sin correspondencias</h4>
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
                className={`group border rounded-3xl p-5 lg:p-6 cursor-pointer select-none transition-all duration-200 ${
                  expandedId === dilemma.id 
                    ? "bg-white dark:bg-zinc-900/30 border-zinc-300 dark:border-zinc-700/80 shadow-md translate-y-[-1px]" 
                    : "bg-white/40 dark:bg-zinc-950/20 border-zinc-200 dark:border-zinc-800/80 hover:border-zinc-300 dark:hover:border-zinc-700 hover:bg-white dark:hover:bg-zinc-950/40 shadow-sm dark:shadow-none"
                }`}
              >
                <div className="flex items-center justify-between gap-4 mb-3">
                  <div className="flex items-center gap-1.5">
                    {getCategoryIconByString(dilemma.category)}
                    <span className="text-[10px] font-mono tracking-wider text-zinc-400 dark:text-zinc-500 uppercase font-light">
                      {dilemma.category === "sintiencia" ? "Sintiencia" :
                       dilemma.category === "historia" ? "Historia" :
                       dilemma.category === "ecologia" ? "Ecología" : "Ética y Derechos"}
                    </span>
                  </div>
                  <span className={`text-[9px] font-mono font-bold tracking-widest px-2.5 py-0.5 rounded ${getConsensusColor(dilemma.consensus)}`}>
                    {dilemma.consensus.replace("_", " ")}
                  </span>
                </div>

                <div className="flex justify-between items-start gap-4">
                  <h3 className="text-sm lg:text-base font-bold text-zinc-900 dark:text-white tracking-tight leading-snug transition-colors">
                    {dilemma.title}
                  </h3>
                  <ChevronRight className={`w-5 h-5 text-zinc-400 dark:text-zinc-600 shrink-0 transform transition-transform ${
                    expandedId === dilemma.id ? "rotate-90 text-zinc-800 dark:text-white" : ""
                  }`} />
                </div>

                <p className="text-xs text-zinc-600 dark:text-zinc-400 font-light leading-relaxed mt-2.5 italic border-l-2 border-zinc-200 dark:border-zinc-800 pl-3 transition-colors">
                  &ldquo;{dilemma.popularStatement}&rdquo;
                </p>

                {expandedId === dilemma.id && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.25 }}
                    className="overflow-hidden"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {/* Rich Deconstruction Inline for Mobile ONLY */}
                    <div className="md:hidden mt-5 pt-5 border-t border-zinc-200 dark:border-zinc-800/80 space-y-5 text-xs text-left cursor-default">
                      {/* Scientific panel */}
                      <div className="space-y-1.5">
                        <h4 className="text-[10px] font-mono font-bold text-cyan-600 dark:text-cyan-400 uppercase tracking-wider flex items-center gap-1">
                          <Terminal className="w-3.5 h-3.5" />
                          Análisis Fisiológico / Científico
                        </h4>
                        <p className="text-[11.5px] text-zinc-600 dark:text-zinc-400 font-light leading-relaxed select-text">
                           <TextRenderer text={dilemma.scientificDeconstruction} references={dilemma.references} />
                        </p>
                      </div>

                      {/* Philosophical panel */}
                      <div className="space-y-1.5">
                        <h4 className="text-[10px] font-mono font-bold text-amber-600 dark:text-amber-500 uppercase tracking-wider flex items-center gap-1">
                          <Brain className="w-3.5 h-3.5" />
                          Deconstrucción Ética / Lógica
                        </h4>
                        <p className="text-[11.5px] text-zinc-600 dark:text-zinc-400 font-light leading-relaxed select-text">
                           <TextRenderer text={dilemma.philosophicalDeconstruction} references={dilemma.references} />
                        </p>
                      </div>

                      {/* Bio-Coexistence summary */}
                      <div className="space-y-1.5 p-3 rounded-xl border border-zinc-200/85 dark:border-zinc-900 bg-zinc-50/50 dark:bg-zinc-950/20">
                        <h4 className="text-[9px] font-mono font-bold text-purple-500 dark:text-purple-400 uppercase tracking-wider flex items-center gap-1">
                          <ShieldAlert className="w-3.5 h-3.5" />
                          Impacto en la Coexistencia
                        </h4>
                        <p className="text-[10.5px] text-zinc-600 dark:text-zinc-400 leading-relaxed font-light select-text">
                           <TextRenderer text={dilemma.coexistenceImpact} references={dilemma.references} />
                        </p>
                      </div>

                      {/* Collapsible Bibliography Section */}
                      {dilemma.references && dilemma.references.length > 0 && (
                        <div className="pt-1">
                          <button
                            onClick={() => setIsBibliographyOpen(!isBibliographyOpen)}
                            className="flex items-center justify-between w-full py-1.5 px-2.5 bg-zinc-100/50 dark:bg-zinc-950/30 rounded-xl border border-zinc-200 dark:border-zinc-800/30 text-[9px] font-mono tracking-wider uppercase text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300 transition-all font-bold select-none cursor-pointer"
                          >
                            <span className="flex items-center gap-1">
                              <BookOpen className="w-3 h-3 text-zinc-400" />
                              BIBLIOGRAFÍA COMPLETA ({dilemma.references.length})
                            </span>
                            {isBibliographyOpen ? (
                              <ChevronUp className="w-3 h-3 text-zinc-400" />
                            ) : (
                              <ChevronDown className="w-3 h-3 text-zinc-400" />
                            )}
                          </button>
                          <AnimatePresence>
                            {isBibliographyOpen && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.2 }}
                                className="overflow-hidden"
                              >
                                <ul className="mt-2 space-y-2 pl-0.5">
                                  {dilemma.references.map((ref) => (
                                    <li
                                      key={ref.id}
                                      className="text-[10px] leading-relaxed text-zinc-500 dark:text-zinc-500 border-l border-zinc-200 dark:border-zinc-850 pl-2 py-0.5"
                                    >
                                      <span className="font-bold text-zinc-700 dark:text-zinc-300 font-mono mr-1">
                                        [{ref.id}]
                                      </span>
                                      {ref.citation}
                                      {ref.url && (
                                        <a
                                          href={ref.url}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="inline-flex items-center gap-0.5 text-cyan-500 dark:text-cyan-400 hover:underline ml-1 font-semibold cursor-pointer"
                                        >
                                          <span>Ver artículo</span>
                                          <ExternalLink className="w-2.5 h-2.5" />
                                        </a>
                                      )}
                                    </li>
                                  ))}
                                </ul>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      )}
                    </div>

                    <div className="mt-5 pt-4 border-t border-zinc-200 dark:border-zinc-800/80 flex justify-end">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onAnalyzeTrigger(dilemma.popularStatement);
                        }}
                        className="text-[10px] sm:text-[11px] font-semibold text-zinc-950 dark:text-zinc-950 bg-zinc-100 dark:bg-white hover:bg-zinc-200 dark:hover:bg-zinc-100 rounded-xl px-3.5 py-2 flex items-center gap-1.5 transition-all shadow-sm border border-zinc-300 dark:border-transparent cursor-pointer pointer-events-auto"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-zinc-800" />
                        Deconstruir con IA de Sintiens
                      </button>
                    </div>
                  </motion.div>
                )}
              </div>
            ))}
          </div>

          {/* Side panel for expanded dilemma details */}
          <div className="hidden md:flex md:col-span-5 sticky top-28 bg-white/40 dark:bg-zinc-950/40 border border-zinc-200 dark:border-zinc-800/80 p-6 rounded-3xl min-h-[350px] flex-col justify-between shadow-sm dark:shadow-none transition-all duration-300">
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
                            DECONSTRUCCIÓN CLÍNICA: {current.consensus}
                          </span>
                          <h2 className="text-lg font-extrabold text-zinc-900 dark:text-white tracking-tight pt-1 transition-colors">
                            {current.title}
                          </h2>
                        </div>

                        {/* Popular justification placeholder */}
                        <div className="bg-zinc-100 dark:bg-zinc-950 p-4 border border-zinc-200 dark:border-zinc-900 rounded-2xl relative overflow-hidden transition-colors">
                          <span className="text-[9px] font-mono text-zinc-400 dark:text-zinc-600 uppercase tracking-wider block mb-1">Premisa Popular Escuchada</span>
                          <blockquote className="text-zinc-700 dark:text-zinc-300 text-xs font-serif italic leading-relaxed transition-colors">
                            &ldquo;{current.popularStatement}&rdquo;
                          </blockquote>
                        </div>

                        {/* Scientific panel */}
                        <div className="space-y-1.5">
                          <h4 className="text-[11px] font-mono font-medium text-cyan-500 dark:text-cyan-400 uppercase tracking-wider flex items-center gap-1">
                            <Terminal className="w-3.5 h-3.5" />
                            Análisis Fisiológico / Científico
                          </h4>
                          <p className="text-xs text-zinc-600 dark:text-zinc-400 font-light leading-relaxed transition-colors select-text">
                             <TextRenderer text={current.scientificDeconstruction} references={current.references} />
                          </p>
                        </div>

                        {/* Philosophical panel */}
                        <div className="space-y-1.5">
                          <h4 className="text-[11px] font-mono font-medium text-amber-500 dark:text-amber-500 uppercase tracking-wider flex items-center gap-1">
                            <Brain className="w-3.5 h-3.5" />
                            Deconstrucción Ética / Lógica
                          </h4>
                          <p className="text-xs text-zinc-600 dark:text-zinc-400 font-light leading-relaxed transition-colors select-text">
                             <TextRenderer text={current.philosophicalDeconstruction} references={current.references} />
                          </p>
                        </div>

                        {/* Bio-Coexistence summary */}
                        <div className="space-y-1.5 p-3 rounded-xl border border-zinc-200 dark:border-zinc-900 bg-zinc-100/50 dark:bg-zinc-950/20 transition-colors">
                          <h4 className="text-[10px] font-mono font-medium text-purple-500 dark:text-purple-400 uppercase tracking-wider flex items-center gap-1">
                            <ShieldAlert className="w-3.5 h-3.5" />
                            Impacto en la Coexistencia
                          </h4>
                          <p className="text-[11px] text-zinc-600 dark:text-zinc-400 leading-relaxed font-light transition-colors select-text">
                             <TextRenderer text={current.coexistenceImpact} references={current.references} />
                          </p>
                        </div>

                        {/* Collapsible Bibliography Section */}
                        {current.references && current.references.length > 0 && (
                          <div className="pt-2">
                            <button
                              onClick={() => setIsBibliographyOpen(!isBibliographyOpen)}
                              className="flex items-center justify-between w-full py-2 px-3 bg-zinc-100/50 dark:bg-zinc-950/30 rounded-xl border border-zinc-200 dark:border-zinc-800/30 text-[10px] font-mono tracking-wider uppercase text-zinc-500 hover:text-zinc-850 dark:hover:text-zinc-300 transition-all cursor-pointer font-bold select-none"
                            >
                              <span className="flex items-center gap-1.5">
                                <BookOpen className="w-3.5 h-3.5 text-zinc-400 dark:text-zinc-500" />
                                BIBLIOGRAFÍA COMPLETA ({current.references.length})
                              </span>
                              {isBibliographyOpen ? (
                                <ChevronUp className="w-3.5 h-3.5 text-zinc-400" />
                              ) : (
                                <ChevronDown className="w-3.5 h-3.5 text-zinc-400" />
                              )}
                            </button>
                            <AnimatePresence>
                              {isBibliographyOpen && (
                                <motion.div
                                  initial={{ height: 0, opacity: 0 }}
                                  animate={{ height: "auto", opacity: 1 }}
                                  exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.2 }}
                                className="overflow-hidden"
                              >
                                <ul className="mt-2.5 space-y-2.5 pl-1.5">
                                  {current.references.map((ref) => (
                                    <li
                                      key={ref.id}
                                      className="text-[10.5px] leading-relaxed text-zinc-500 dark:text-zinc-500 font-sans border-l-2 border-zinc-200 dark:border-zinc-800/50 pl-3 py-0.5"
                                    >
                                      <span className="font-bold text-zinc-700 dark:text-zinc-300 font-mono mr-1.5">
                                        [{ref.id}]
                                      </span>
                                      {ref.citation}
                                      {ref.url && (
                                        <a
                                          href={ref.url}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="inline-flex items-center gap-0.5 text-cyan-500 dark:text-cyan-400 hover:underline ml-1.5 font-semibold"
                                        >
                                          <span>Ver artículo</span>
                                          <ExternalLink className="w-2.5 h-2.5" />
                                        </a>
                                      )}
                                    </li>
                                  ))}
                                </ul>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      )}

                      </div>

                    </motion.div>
                  );
                })()
              ) : (
                <div className="flex flex-col items-center justify-center text-center h-full text-zinc-400 dark:text-zinc-500 my-16 space-y-3">
                  <Compass className="w-12 h-12 stroke-1 text-zinc-400 dark:text-zinc-700 animate-spin-slow" />
                  <div className="space-y-1">
                    <h3 className="text-sm font-semibold text-zinc-600 dark:text-zinc-500">Tesis No Descolgada</h3>
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


