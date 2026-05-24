import React, { useState, useEffect, useRef } from "react";
import { 
  TIMELINE_DATA, 
  TimelineMilestone, 
  TimelineGroup, 
  ReferenceDetail, 
  CORE_NODES 
} from "../types";
import { 
  Search, 
  BookOpen, 
  ChevronUp, 
  ChevronDown, 
  ExternalLink, 
  X, 
  GitCompare, 
  Clock, 
  ArrowRight, 
  Sparkles,
  Info,
  Calendar,
  Activity,
  Globe,
  Scale,
  Activity as DietIcon
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

// Tooltip component for academic citations (matching ConceptExplorer cohesion)
interface ReferenceTooltipProps {
  refDetail: ReferenceDetail;
  children: React.ReactNode;
  key?: any;
}

function ReferenceTooltip({ refDetail, children }: ReferenceTooltipProps) {
  const [isOpen, setIsOpen] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleMouseEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setIsOpen(true);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setIsOpen(false);
    }, 150);
  };

  return (
    <span 
      className="relative inline-block"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={(e) => {
        e.stopPropagation();
        setIsOpen(!isOpen);
      }}
    >
      {children}
      <AnimatePresence>
        {isOpen && (
          <motion.span
            initial={{ opacity: 0, y: 5, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 5, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-64 p-3 bg-zinc-900 dark:bg-zinc-950 text-white rounded-xl shadow-xl border border-zinc-800/80 z-50 text-left font-sans block pointer-events-auto cursor-default normal-case tracking-normal whitespace-normal font-normal"
            onClick={(e) => e.stopPropagation()}
            onMouseEnter={() => {
              if (timeoutRef.current) clearTimeout(timeoutRef.current);
            }}
            onMouseLeave={handleMouseLeave}
          >
            <span className="block text-[9px] font-mono uppercase tracking-wider text-cyan-400 font-bold mb-1">
              Referencia [{refDetail.id}]
            </span>
            <span className="block text-[10.5px] leading-relaxed text-zinc-200 font-light font-sans select-text">
              {refDetail.citation}
            </span>
            {refDetail.url && (
              <a
                href={refDetail.url}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2.5 inline-flex items-center gap-1 text-[9px] font-mono uppercase font-bold text-cyan-400 hover:text-cyan-300 transition-colors cursor-pointer select-none"
              >
                <span>Ver artículo completo</span>
                <ExternalLink className="w-2.5 h-2.5" />
              </a>
            )}
            <span className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-zinc-900 dark:border-t-zinc-950" />
          </motion.span>
        )}
      </AnimatePresence>
    </span>
  );
}

const renderTextWithReferences = (text: string, references?: ReferenceDetail[]) => {
  if (!references || references.length === 0) return <span>{text}</span>;

  const parts = text.split(/(\[[0-9,\s]+\])/g);
  
  return (
    <>
      {parts.map((part, idx) => {
        const match = part.match(/^\[([0-9,\s]+)\]$/);
        if (match) {
          const numbers = match[1].split(",").map((num) => num.trim());
          return (
            <span key={idx} className="inline-flex gap-0.5">
              {numbers.map((refId, nIdx) => {
                const ref = references.find((r) => r.id === refId);
                if (ref) {
                  return (
                    <ReferenceTooltip key={nIdx} refDetail={ref}>
                      <sup className="text-cyan-500 dark:text-cyan-400 font-bold hover:text-cyan-600 dark:hover:text-cyan-300 transition-colors px-0.5 cursor-pointer select-none">
                        [{refId}]
                      </sup>
                    </ReferenceTooltip>
                  );
                }
                return <sup key={nIdx}>[{refId}]</sup>;
              })}
            </span>
          );
        }
        return <span key={idx}>{part}</span>;
      })}
    </>
  );
};

interface TimelineExplorerProps {
  onRedirectToConcept?: (nodeId: string) => void;
}

export default function TimelineExplorer({ onRedirectToConcept }: TimelineExplorerProps) {
  const [activeTimelineId, setActiveTimelineId] = useState<"usos" | "etica" | "regulaciones" | "alimentacion">("usos");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMilestone, setSelectedMilestone] = useState<TimelineMilestone | null>(null);
  const [isBibliographyOpen, setIsBibliographyOpen] = useState(false);
  const [isMobileDetailOpen, setIsMobileDetailOpen] = useState(false);

  // Comparison Mode States
  const [isCompareMode, setIsCompareMode] = useState(false);
  const [compareA, setCompareA] = useState<TimelineMilestone | null>(null);
  const [compareB, setCompareB] = useState<TimelineMilestone | null>(null);

  // Reset bibliography collapse on milestone change
  useEffect(() => {
    setIsBibliographyOpen(false);
  }, [selectedMilestone]);

  const activeGroup = TIMELINE_DATA.find((g) => g.id === activeTimelineId)!;

  const filteredMilestones = activeGroup.milestones.filter((milestone) => {
    const matchesSearch = 
      milestone.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      milestone.shortDesc.toLowerCase().includes(searchQuery.toLowerCase()) ||
      milestone.longDesc.toLowerCase().includes(searchQuery.toLowerCase()) ||
      milestone.yearLabel.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  const getTimelineColorClasses = (id: string) => {
    switch (id) {
      case "usos":
        return {
          bg: "bg-blue-500/10 dark:bg-blue-500/5",
          border: "border-blue-500/20 dark:border-blue-500/30",
          text: "text-blue-600 dark:text-blue-400",
          glow: "bg-blue-500",
          badge: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/30"
        };
      case "etica":
        return {
          bg: "bg-purple-500/10 dark:bg-purple-500/5",
          border: "border-purple-500/20 dark:border-purple-500/30",
          text: "text-purple-600 dark:text-purple-400",
          glow: "bg-purple-500",
          badge: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/30"
        };
      case "regulaciones":
        return {
          bg: "bg-emerald-500/10 dark:bg-emerald-500/5",
          border: "border-emerald-500/20 dark:border-emerald-500/30",
          text: "text-emerald-600 dark:text-emerald-400",
          glow: "bg-emerald-500",
          badge: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30"
        };
      case "alimentacion":
        return {
          bg: "bg-amber-500/10 dark:bg-amber-500/5",
          border: "border-amber-500/20 dark:border-amber-500/30",
          text: "text-amber-600 dark:text-amber-400",
          glow: "bg-amber-500",
          badge: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30"
        };
      default:
        return {
          bg: "bg-zinc-500/10",
          border: "border-zinc-500/20",
          text: "text-zinc-500",
          glow: "bg-zinc-500",
          badge: "bg-zinc-800 text-zinc-400"
        };
    }
  };

  const colors = getTimelineColorClasses(activeTimelineId);

  const handleSelectMilestone = (m: TimelineMilestone) => {
    if (isCompareMode) {
      // In comparison mode, assign to A first or B next
      if (!compareA) {
        setCompareA(m);
      } else if (!compareB && compareA.id !== m.id) {
        setCompareB(m);
      } else {
        // Shift A to B, and make new selected as A
        setCompareA(m);
        setCompareB(null);
      }
    } else {
      setSelectedMilestone(m);
      if (window.innerWidth < 1024) {
        setIsMobileDetailOpen(true);
      }
    }
  };

  // Dedicated Lag Analysis Calculator
  const getLagAnalysis = (mA: TimelineMilestone, mB: TimelineMilestone) => {
    const diff = Math.abs(mA.year - mB.year);
    
    // Custom analysis for famous comparisons
    const combinedIds = [mA.id, mB.id];
    
    if (combinedIds.includes("macrogranjas-mediados-siglo") && combinedIds.includes("declaracion-cambridge")) {
      return {
        years: 62,
        title: "Brecha entre Explotación Masiva y Validación Científica",
        desc: "Durante 62 años de confinamiento industrial masivo bajo el auge de las macrogranjas (procesando billones de vidas), la industria operó a máxima eficiencia calórica y mercantil, mientras que la Declaración de Cambridge sobre la Consciencia no formalizó el consenso neurocientífico definitivo hasta 2012. Esto ilustra cómo la mercantilización práctica corre décadas por delante de los límites bioéticos fundamentales."
      };
    }
    
    if (combinedIds.includes("cartesianismo-maquina") && combinedIds.includes("declaracion-cambridge")) {
      return {
        years: 375,
        title: "El Largo Letargo del Negacionismo de la Consciencia",
        desc: "Transcurrieron 375 años desde que René Descartes teorizó en 1637 que los animales eran autómatas mecánicos desprovistos de alma y dolor consciente, hasta que en 2012 la comunidad neurobiológica oficial certificó la presencia de sustratos de consciencia equivalentes. Este prolongado desfase de casi cuatro siglos sirvió como 'anestésico teológico e intelectual' para justificar el uso utilitario irrestricto de la fauna."
      };
    }

    if (combinedIds.includes("informe-brambell-ley") && combinedIds.includes("end-the-cage-age-initiative")) {
      return {
        years: 55,
        title: "Inercia entre Mínimos Éticos Acordados e Implantación Legal",
        desc: "A pesar de que el Informe Brambell decretó científicamente en 1965 las 'Cinco Libertades' (exigiendo que un animal no sea confinado de forma que le impida girarse o estirar sus extremidades), la cría en jaulas extremas de confinamiento continuó siendo la práctica hegemónica en Europa hasta que la iniciativa ciudadana 'End the Cage Age' la puso en jaque definitivo 55 años después. Esto ejemplifica la profunda inercia de los sistemas productivos ante los consensos del bienestar."
      };
    }

    if (combinedIds.includes("sintesis-b12") && combinedIds.includes("consenso-nutricional-and")) {
      return {
        years: 68,
        title: "La Resistencia Cultural a la Independencia Calórica",
        desc: "Pasaron 68 años desde el aislamiento industrial de la vitamina B12 microbiana en 1948 (que extirpó la necesidad evolutiva y médica de ingerir carne) hasta la ratificación formal de la Academia de Nutrición y Dietética en 2016 que validó científicamente la idoneidad nutricional de la dieta vegetal estricta para todo ciclo vital. Este retardo refleja la inmensa inercia cultural, gastronómica e ideológica que envuelve a la alimentación humana."
      };
    }

    // Dynamic Fallback
    const older = mA.year < mB.year ? mA : mB;
    const newer = mA.year < mB.year ? mB : mA;
    return {
      years: diff,
      title: `Desfase Cronológico de ${diff} años`,
      desc: `Este intervalo de ${diff} años separa el hito "${older.title}" (${older.yearLabel}) del desarrollo "${newer.title}" (${newer.yearLabel}). Este vacío temporal ilustra el desfase sistémico existente entre el desarrollo de infraestructuras de instrumentalización animal, la teorización filosófica de los deberes de compasión y los retrasos históricos del ordenamiento jurídico para codificar estos avances en los marcos de justicia de los Estados.`
    };
  };

  const renderDetailsContent = (milestone: TimelineMilestone) => {
    const isUsos = TIMELINE_DATA[0].milestones.some(m => m.id === milestone.id);
    const isEtica = TIMELINE_DATA[1].milestones.some(m => m.id === milestone.id);
    const isRegulaciones = TIMELINE_DATA[2].milestones.some(m => m.id === milestone.id);
    const mColor = isUsos ? getTimelineColorClasses("usos") :
                   isEtica ? getTimelineColorClasses("etica") :
                   isRegulaciones ? getTimelineColorClasses("regulaciones") : getTimelineColorClasses("alimentacion");

    const relatedNode = milestone.relatedNodeId ? CORE_NODES.find(n => n.id === milestone.relatedNodeId) : null;

    return (
      <div className="flex-1 flex flex-col justify-between h-full space-y-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className={`text-[10px] tracking-widest font-mono uppercase px-2.5 py-1 rounded-full font-bold ${mColor.badge}`}>
              {milestone.yearLabel}
            </span>
            <div className="flex items-center gap-1 text-zinc-500 text-xs">
              <Calendar className="w-3.5 h-3.5 text-zinc-400" />
              <span className="font-mono text-[9px] uppercase tracking-wider font-semibold">Registro Histórico</span>
            </div>
          </div>

          <h2 className="text-xl font-extrabold text-zinc-900 dark:text-white tracking-tight border-b border-zinc-200 dark:border-zinc-800 pb-3 transition-colors">
            {milestone.title}
          </h2>

          <p className="text-xs sm:text-sm text-zinc-650 dark:text-zinc-400 font-light leading-relaxed transition-colors select-text">
            {renderTextWithReferences(milestone.longDesc, milestone.references)}
          </p>

          <div className="space-y-3 pt-2">
            <h4 className="text-[10px] font-bold tracking-wider text-zinc-700 dark:text-zinc-300 font-mono flex items-center gap-1.5 transition-colors">
              <span className="h-1.5 w-1.5 rounded-full bg-zinc-800 dark:bg-white animate-pulse" />
              HECHOS HISTÓRICOS Y CIENTÍFICOS:
            </h4>
            <ul className="space-y-2 text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed font-light select-text">
              {milestone.scientificFacts.map((fact, i) => (
                <li key={i} className="flex items-start gap-2 bg-white dark:bg-zinc-950/40 p-3 rounded-xl border border-zinc-200/60 dark:border-zinc-800/40 transition-colors">
                  <span className="text-zinc-450 dark:text-zinc-650 font-mono font-semibold mt-0.5 select-none">[{i + 1}]</span>
                  <span>{renderTextWithReferences(fact, milestone.references)}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Bibliography references */}
          {milestone.references && milestone.references.length > 0 && (
            <div className="pt-2">
              <button
                onClick={() => setIsBibliographyOpen(!isBibliographyOpen)}
                className="flex items-center justify-between w-full py-2 px-3 bg-zinc-150/40 dark:bg-zinc-950/30 rounded-xl border border-zinc-200 dark:border-zinc-800/30 text-[10px] font-mono tracking-wider uppercase text-zinc-500 hover:text-zinc-850 dark:hover:text-zinc-350 transition-all cursor-pointer font-bold select-none"
              >
                <span className="flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-zinc-400 dark:text-zinc-500" />
                  BIBLIOGRAFÍA COMPLETA ({milestone.references.length})
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
                      {milestone.references.map((ref) => (
                        <li
                          key={ref.id}
                          className="text-[10.5px] leading-relaxed text-zinc-500 dark:text-zinc-500 font-sans border-l-2 border-zinc-200 dark:border-zinc-850 pl-3 py-0.5"
                        >
                          <span className="font-bold text-zinc-700 dark:text-zinc-350 font-mono mr-1.5">
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

        {/* Redirect button to related Concept Explorer node */}
        {relatedNode && onRedirectToConcept && (
          <div className="pt-6 border-t border-zinc-200 dark:border-zinc-800/60 transition-colors">
            <span className="text-[9px] font-mono tracking-widest uppercase text-zinc-400 dark:text-zinc-500 block mb-2">
              Concepto Bioético Asociado:
            </span>
            <button
              onClick={() => onRedirectToConcept(relatedNode.id)}
              className="w-full flex items-center justify-between text-xs p-3.5 rounded-xl bg-gradient-to-r from-zinc-100 to-zinc-50 dark:from-zinc-900 dark:to-zinc-950 border border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 text-zinc-700 dark:text-zinc-350 transition-all font-semibold cursor-pointer shadow-xs group"
            >
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${
                  relatedNode.category === 'sintiencia' ? 'bg-red-500' :
                  relatedNode.category === 'ecologia' ? 'bg-emerald-500' :
                  relatedNode.category === 'historia' ? 'bg-blue-500' : 'bg-purple-500'
                }`} />
                <span>Explorar concepto: {relatedNode.title}</span>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-zinc-400 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        )}
      </div>
    );
  };

  const getTimelineIcon = (id: string) => {
    switch (id) {
      case "usos":
        return <Activity className="w-4 h-4" />;
      case "etica":
        return <Scale className="w-4 h-4" />;
      case "regulaciones":
        return <Globe className="w-4 h-4" />;
      case "alimentacion":
        return <Clock className="w-4 h-4" />;
      default:
        return <Calendar className="w-4 h-4" />;
    }
  };

  const getComparisonYearScale = (mA: TimelineMilestone, mB: TimelineMilestone) => {
    const oldest = mA.year < mB.year ? mA : mB;
    const newest = mA.year < mB.year ? mB : mA;
    return (
      <div className="w-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800/80 rounded-2xl p-6 relative overflow-hidden flex flex-col justify-between items-stretch gap-6">
        <div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-0.5 bg-zinc-300 dark:bg-zinc-800 pointer-events-none" />
        
        <div className="flex items-center justify-between relative z-10">
          <div className="w-[45%] text-left">
            <span className="text-[10px] font-mono tracking-widest text-zinc-400 uppercase block mb-1">HITO INICIAL</span>
            <div className="font-extrabold text-sm text-zinc-900 dark:text-white leading-tight">{oldest.title}</div>
            <div className="font-mono text-xs text-zinc-500 mt-1 font-semibold">{oldest.yearLabel}</div>
          </div>
          <div className="w-10 h-10 rounded-full bg-zinc-250 dark:bg-zinc-800/80 border border-zinc-300 dark:border-zinc-700 flex items-center justify-center font-mono text-[10px] font-bold text-zinc-650 dark:text-zinc-300">
            A
          </div>
          <div className="w-[45%] text-right">
            <span className="text-[10px] font-mono tracking-widest text-zinc-400 uppercase block mb-1">HITO POSTERIOR</span>
            <div className="font-extrabold text-sm text-zinc-900 dark:text-white leading-tight">{newest.title}</div>
            <div className="font-mono text-xs text-zinc-500 mt-1 font-semibold">{newest.yearLabel}</div>
          </div>
        </div>

        <div className="w-full bg-zinc-200 dark:bg-zinc-950/80 h-3 rounded-full relative border border-zinc-300/40 dark:border-zinc-850">
          <div className="absolute top-0 bottom-0 left-0 right-0 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-emerald-500/20 rounded-full" />
          <motion.div 
            initial={{ left: "0%", right: "100%" }}
            animate={{ left: "12%", right: "12%" }}
            transition={{ type: "spring", duration: 1 }}
            className="absolute top-0 bottom-0 bg-zinc-900 dark:bg-white rounded-full"
          />
          <div className="absolute top-1/2 -translate-y-1/2 left-[12%] w-2 h-2 rounded-full bg-zinc-900 dark:bg-white ring-4 ring-zinc-500/20" />
          <div className="absolute top-1/2 -translate-y-1/2 right-[12%] w-2 h-2 rounded-full bg-zinc-900 dark:bg-white ring-4 ring-zinc-500/20" />
        </div>

        <div className="text-center relative z-10 bg-zinc-50 dark:bg-zinc-950 p-4 rounded-xl border border-zinc-200 dark:border-zinc-850">
          <div className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500 font-mono tracking-tight">
            {Math.abs(mA.year - mB.year)} años
          </div>
          <span className="text-[9px] font-mono text-zinc-450 dark:text-zinc-500 uppercase font-semibold">BRECHA DE INERCIA MORAL</span>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 w-full select-none">
      
      {/* Upper Mode Selectors: Chronology Selection & Comparison Toggle */}
      <div className="flex flex-col lg:flex-row gap-4 items-center justify-between w-full">
        
        {/* Selector de Pestañas de Línea Temporal (oculto en CompareMode si se prefiere, o activo para filtrar) */}
        <div className="flex flex-wrap bg-zinc-150 dark:bg-zinc-900/60 p-1 rounded-2xl border border-zinc-200 dark:border-zinc-900/60 transition-all shadow-inner w-full lg:w-auto overflow-x-auto custom-scrollbar">
          {TIMELINE_DATA.map((t) => {
            const isActive = activeTimelineId === t.id;
            const tColor = getTimelineColorClasses(t.id);
            return (
              <button
                key={t.id}
                onClick={() => setActiveTimelineId(t.id)}
                className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-semibold tracking-tight transition-all duration-300 cursor-pointer shrink-0 ${
                  isActive
                    ? `bg-white dark:bg-zinc-800 ${tColor.text} shadow-sm border border-zinc-200/80 dark:border-transparent scale-102`
                    : "text-zinc-500 dark:text-zinc-450 hover:text-zinc-800 dark:hover:text-white"
                }`}
              >
                {getTimelineIcon(t.id)}
                <span>{t.title}</span>
              </button>
            );
          })}
        </div>

        {/* Toggle del Modo Comparador */}
        <button
          onClick={() => {
            setIsCompareMode(!isCompareMode);
            // Reset comparators
            setCompareA(null);
            setCompareB(null);
            setSelectedMilestone(null);
          }}
          className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold tracking-tight transition-all duration-300 cursor-pointer border ${
            isCompareMode
              ? "bg-gradient-to-r from-cyan-500/10 to-purple-500/10 border-cyan-500 text-cyan-600 dark:text-cyan-400 shadow-md ring-1 ring-cyan-500/30"
              : "bg-white dark:bg-zinc-950 hover:bg-zinc-150/40 dark:hover:bg-zinc-900 border-zinc-200 dark:border-zinc-850 text-zinc-650 dark:text-zinc-400"
          }`}
        >
          <GitCompare className="w-4 h-4" />
          <span>{isCompareMode ? "Desactivar Comparador" : "Modo Desfase Ético-Industrial"}</span>
        </button>

      </div>

      {/* Main timeline explorer layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch w-full min-h-[620px] border border-zinc-200 dark:border-zinc-850 rounded-3xl bg-white/40 dark:bg-zinc-900/10 backdrop-blur-md overflow-hidden transition-all duration-300">
        
        {/* Left Side: Timeline vertical flow (lg:col-span-7) */}
        <div className="lg:col-span-7 p-6 bg-zinc-50/50 dark:bg-zinc-950/30 relative min-h-[480px] lg:min-h-[580px] transition-colors duration-300 flex flex-col justify-between space-y-6">
          
          <div className="space-y-4 flex-1">
            {/* Header info / Search bar */}
            <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
              
              <div className="flex-1 space-y-1">
                <h3 className="text-sm font-extrabold text-zinc-900 dark:text-white tracking-tight uppercase font-mono">
                  {isCompareMode ? "🔍 SELECCIONA DOS HITOS PARA COMPARAR" : activeGroup.title}
                </h3>
                <p className="text-[11px] leading-relaxed text-zinc-500 dark:text-zinc-500 font-light select-text">
                  {isCompareMode 
                    ? "Haz clic en dos hitos cualesquiera de la lista (incluso cambiando de pestaña) para proyectar su inercia temporal." 
                    : activeGroup.description
                  }
                </p>
              </div>

              {!isCompareMode && (
                <div className="relative shrink-0 w-full md:w-56">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-450" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Buscar hito..."
                    className="w-full bg-white dark:bg-zinc-950/60 border border-zinc-200 dark:border-zinc-800 focus:border-zinc-400 dark:focus:border-zinc-700 rounded-xl pl-9 pr-3 py-2 text-xs text-zinc-900 dark:text-white placeholder-zinc-450 outline-none focus:ring-1 focus:ring-zinc-300 dark:focus:ring-zinc-750 transition-all font-sans"
                  />
                </div>
              )}

            </div>

            {/* Comparison states indicator when CompareMode is active */}
            {isCompareMode && (
              <div className="grid grid-cols-2 gap-4 p-3 bg-zinc-100/50 dark:bg-zinc-950/40 rounded-2xl border border-zinc-200 dark:border-zinc-850">
                <div className="text-left space-y-1">
                  <span className="text-[9px] font-mono tracking-widest text-zinc-450 block uppercase">HITO A</span>
                  {compareA ? (
                    <div className="flex items-center gap-1.5">
                      <span className="p-1 px-1.5 rounded bg-cyan-500/10 border border-cyan-500/30 text-[9px] font-mono text-cyan-600 dark:text-cyan-400 font-bold select-none">{compareA.yearLabel}</span>
                      <span className="text-xs font-bold text-zinc-850 dark:text-zinc-200 truncate">{compareA.title}</span>
                    </div>
                  ) : (
                    <span className="text-xs font-light text-zinc-450 italic">Selecciona un hito...</span>
                  )}
                </div>
                <div className="text-left space-y-1 border-l border-zinc-200 dark:border-zinc-800 pl-4">
                  <span className="text-[9px] font-mono tracking-widest text-zinc-450 block uppercase">HITO B</span>
                  {compareB ? (
                    <div className="flex items-center gap-1.5">
                      <span className="p-1 px-1.5 rounded bg-purple-500/10 border border-purple-500/30 text-[9px] font-mono text-purple-600 dark:text-purple-400 font-bold select-none">{compareB.yearLabel}</span>
                      <span className="text-xs font-bold text-zinc-850 dark:text-zinc-200 truncate">{compareB.title}</span>
                    </div>
                  ) : (
                    <span className="text-xs font-light text-zinc-450 italic">Selecciona otro hito...</span>
                  )}
                </div>
              </div>
            )}

            {/* Timeline Vertical Container Scroll Area */}
            <div className="relative pl-6 lg:pl-8 border-l border-zinc-300 dark:border-zinc-800 space-y-6 max-h-[440px] lg:max-h-[460px] overflow-y-auto pr-1.5 custom-scrollbar py-2">
              
              {filteredMilestones.length === 0 ? (
                <div className="py-16 text-center space-y-3 -ml-6 lg:-ml-8 border-l-0">
                  <Clock className="w-10 h-10 stroke-1 text-zinc-400 dark:text-zinc-700 mx-auto animate-pulse" />
                  <div className="space-y-1">
                    <h4 className="text-sm font-semibold text-zinc-900 dark:text-white">Sin correspondencias</h4>
                    <p className="text-xs text-zinc-500 font-light">Ningún hito coincide con el término de búsqueda.</p>
                  </div>
                </div>
              ) : (
                filteredMilestones.map((m) => {
                  const isSelected = selectedMilestone?.id === m.id;
                  const isComparingA = compareA?.id === m.id;
                  const isComparingB = compareB?.id === m.id;
                  
                  // Active borders
                  let borderClass = "border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 hover:bg-zinc-100/30 dark:hover:bg-zinc-900/10";
                  let bgGlow = "";
                  
                  if (isCompareMode) {
                    if (isComparingA) {
                      borderClass = "border-cyan-500 ring-1 ring-cyan-500/25";
                      bgGlow = "bg-cyan-500/5";
                    } else if (isComparingB) {
                      borderClass = "border-purple-500 ring-1 ring-purple-500/25";
                      bgGlow = "bg-purple-500/5";
                    }
                  } else if (isSelected) {
                    borderClass = `border-${activeTimelineId}-500 ring-1 ring-${activeTimelineId}-500/25`;
                    borderClass = activeTimelineId === "usos" ? "border-blue-500 ring-1 ring-blue-500/25" :
                                  activeTimelineId === "etica" ? "border-purple-500 ring-1 ring-purple-500/25" :
                                  activeTimelineId === "regulaciones" ? "border-emerald-500 ring-1 ring-emerald-500/25" :
                                  "border-amber-500 ring-1 ring-amber-500/25";
                    bgGlow = colors.bg;
                  }

                  return (
                    <motion.div
                      key={m.id}
                      onClick={() => handleSelectMilestone(m)}
                      className={`group p-4.5 rounded-2xl border text-left cursor-pointer transition-all duration-300 relative overflow-hidden bg-white/40 dark:bg-zinc-950/15 ${borderClass} ${bgGlow} ${
                        (isSelected || isComparingA || isComparingB) ? "shadow-md" : "hover:-translate-y-0.5"
                      }`}
                    >
                      {/* Left vertical axis timeline bullet */}
                      <div className="absolute -left-[31px] lg:-left-[39px] top-[26px] z-10 flex h-4 w-4 shrink-0 relative items-center justify-center">
                        <span className={`absolute inline-flex rounded-full h-2.5 w-2.5 transition-transform group-hover:scale-125 ${
                          (isSelected || isComparingA || isComparingB) ? colors.glow : "bg-zinc-300 dark:bg-zinc-700"
                        }`} />
                        {(isSelected || isComparingA || isComparingB) && (
                          <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-40 ${colors.glow}`} />
                        )}
                      </div>

                      {/* Header containing year badge and comparisons */}
                      <div className="flex items-center justify-between gap-3 mb-2">
                        <span className={`text-[9px] font-mono tracking-wider px-2 py-0.5 rounded-md font-bold ${
                          isComparingA ? "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/30" :
                          isComparingB ? "bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/30" :
                          colors.badge
                        }`}>
                          {m.yearLabel}
                        </span>
                        
                        {isCompareMode && (
                          <div className="text-[8px] font-mono font-bold uppercase tracking-wider flex items-center gap-1 text-zinc-450 dark:text-zinc-555">
                            {isComparingA && <span className="text-cyan-500">Seleccionado Hito A</span>}
                            {isComparingB && <span className="text-purple-500">Seleccionado Hito B</span>}
                            {!isComparingA && !isComparingB && <span>Comparar +</span>}
                          </div>
                        )}
                      </div>

                      {/* Title & Short Description */}
                      <h4 className="text-xs sm:text-sm font-extrabold text-zinc-900 dark:text-white tracking-tight leading-snug group-hover:text-black dark:group-hover:text-white transition-colors mb-1">
                        {m.title}
                      </h4>

                      <p className="text-[11px] leading-relaxed text-zinc-500 dark:text-zinc-400 font-light line-clamp-2">
                        {m.shortDesc}
                      </p>

                      <div className="mt-3 pt-3 border-t border-zinc-200/50 dark:border-zinc-800/40 flex justify-between items-center text-[9px] font-mono text-zinc-450">
                        <span>Evidencias: {m.scientificFacts.length}</span>
                        <span className={`${
                          isComparingA ? "text-cyan-400 hover:underline font-bold" :
                          isComparingB ? "text-purple-400 hover:underline font-bold" :
                          "text-zinc-650 dark:text-zinc-350 hover:underline font-bold"
                        } transition-all`}>
                          {isCompareMode ? "Vincular a Comparativa →" : "Detalles Académicos →"}
                        </span>
                      </div>

                    </motion.div>
                  );
                })
              )}

            </div>
          </div>
        </div>

        {/* Right Side: Detailed analysis panel / Comparison Mode Dashboard (lg:col-span-5) */}
        <div className="lg:col-span-5 border-t lg:border-t-0 lg:border-l border-zinc-200 dark:border-zinc-850 p-6 lg:p-8 flex flex-col justify-between bg-zinc-50/20 dark:bg-zinc-900/25 transition-colors duration-300 sticky top-24 self-start max-h-[85vh] overflow-y-auto custom-scrollbar">
          
          <AnimatePresence mode="wait">
            
            {/* COMPARISON MODE ACTIVE */}
            {isCompareMode ? (
              <motion.div
                key="comparison-dashboard"
                initial={{ opacity: 0, x: 15 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -15 }}
                transition={{ duration: 0.2 }}
                className="space-y-6 h-full flex flex-col justify-between"
              >
                <div className="space-y-4">
                  <div className="flex items-center gap-1.5">
                    <span className="p-1 rounded bg-cyan-500/10 border border-cyan-500/20 text-[9px] font-mono text-cyan-600 dark:text-cyan-400 font-bold">HERRAMIENTA</span>
                    <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-400">DESFASE ÉTICO-INDUSTRIAL</h4>
                  </div>
                  
                  <p className="text-xs text-zinc-500 dark:text-zinc-500 font-light leading-relaxed">
                    Compara el retraso o "gap" cultural entre los hitos históricos de opresión y el reconocimiento filosófico o legal de la sintiencia animal.
                  </p>

                  {compareA && compareB ? (
                    <div className="space-y-6 pt-2">
                      {/* Graphics scale */}
                      {getComparisonYearScale(compareA, compareB)}

                      {/* Deconstruction text */}
                      <div className="bg-white dark:bg-zinc-950/60 p-4.5 rounded-2xl border border-zinc-200 dark:border-zinc-850 space-y-3">
                        <div className="flex items-start gap-1.5">
                          <Sparkles className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
                          <h5 className="text-xs font-bold text-zinc-900 dark:text-white font-sans leading-snug">
                            {getLagAnalysis(compareA, compareB).title}
                          </h5>
                        </div>
                        <p className="text-xs leading-relaxed text-zinc-650 dark:text-zinc-400 font-light select-text">
                          {getLagAnalysis(compareA, compareB).desc}
                        </p>
                      </div>

                      {/* Scientific Facts Comparison bullet */}
                      <div className="space-y-2 text-[10.5px] leading-relaxed text-zinc-550 dark:text-zinc-500 font-sans border-l-2 border-zinc-300 dark:border-zinc-800 pl-3">
                        💡 **Reflexión Socrática:** Las leyes de mercado y las inercias culturales actúan como diques de contención ante los hechos empíricos y lógicos demostrados. Reducir esta brecha depende del compromiso moral individual directo.
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center text-center py-20 text-zinc-500">
                      <GitCompare className="w-12 h-12 stroke-1 text-zinc-300 dark:text-zinc-700 mb-3 animate-pulse" />
                      <p className="text-xs font-light max-w-xs">
                        Selecciona un hito de la lista de la izquierda (A) y luego otro diferente (B) para calibrar el retardo histórico.
                      </p>
                    </div>
                  )}
                </div>

                {compareA && compareB && (
                  <button
                    onClick={() => {
                      setCompareA(null);
                      setCompareB(null);
                    }}
                    className="w-full mt-6 py-2 px-4 bg-zinc-200/50 hover:bg-zinc-200 dark:bg-zinc-900 dark:hover:bg-zinc-800/80 rounded-xl border border-zinc-300/40 dark:border-zinc-800 text-[10px] font-mono tracking-wider font-bold uppercase text-zinc-500 hover:text-zinc-800 dark:hover:text-white transition-all cursor-pointer select-none"
                  >
                    Resetear Hitos de Comparación
                  </button>
                )}
              </motion.div>
            ) : (
              
              /* STANDARD MILESTONE DETAIL PANEL */
              <motion.div
                key={selectedMilestone ? selectedMilestone.id : "empty-detail"}
                initial={{ opacity: 0, x: 15 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -15 }}
                transition={{ duration: 0.2 }}
                className="h-full flex flex-col justify-between"
              >
                {selectedMilestone ? (
                  renderDetailsContent(selectedMilestone)
                ) : (
                  <div className="flex flex-col items-center justify-center text-center h-full text-zinc-500 py-20 lg:py-28">
                    <Clock className="w-12 h-12 stroke-1 text-zinc-300 dark:text-zinc-700 mb-2 animate-pulse" />
                    <p className="text-xs font-light max-w-[240px]">
                      Selecciona un hito cronológico para profundizar en su análisis de evidencias e implicaciones civilizatorias.
                    </p>
                  </div>
                )}
              </motion.div>
            )}

          </AnimatePresence>
        </div>

      </div>

      {/* Mobile Drawer/Modal Overlay for Details (Screens < 1024px) */}
      <AnimatePresence>
        {isMobileDetailOpen && selectedMilestone && !isCompareMode && (
          <div className="lg:hidden fixed inset-0 z-50 flex items-end justify-center select-none pointer-events-auto">
            {/* Dark glass backdrop overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileDetailOpen(false)}
              className="absolute inset-0 bg-black/60 dark:bg-black/85 backdrop-blur-xs cursor-pointer pointer-events-auto"
            />
            {/* Sheet drawer content container */}
            <motion.div
              initial={{ y: "100%", borderTopLeftRadius: 30, borderTopRightRadius: 30 }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 220 }}
              className="relative w-full max-h-[85vh] overflow-y-auto bg-zinc-50 dark:bg-zinc-950 border-t border-zinc-200 dark:border-zinc-800 p-6 sm:p-8 flex flex-col z-10 pointer-events-auto shadow-2xl rounded-t-3xl custom-scrollbar"
            >
              {/* Drag bar indicator */}
              <div className="w-12 h-1 rounded-full bg-zinc-300 dark:bg-zinc-800 mx-auto mb-5 shrink-0" />

              {/* Close Button absolute positioning */}
              <button
                onClick={() => setIsMobileDetailOpen(false)}
                className="absolute top-5 right-5 p-2 rounded-full bg-zinc-200/50 dark:bg-zinc-900/60 border border-zinc-300/40 dark:border-zinc-800 hover:bg-zinc-300/70 dark:hover:bg-zinc-800/80 text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-all cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="select-text overflow-y-auto pb-8">
                {renderDetailsContent(selectedMilestone)}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
