import { useState, useEffect, useRef } from "react";
import { 
  TIMELINE_DATA, 
  TimelineMilestone, 
  TimelineGroup 
} from "../types";
import { 
  Search, 
  ArrowRight, 
  ArrowLeft, 
  BookOpen, 
  ExternalLink, 
  Info, 
  Clock, 
  Activity, 
  Scale, 
  Layers,
  ChevronDown,
  Sparkles,
  HelpCircle
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

// Track metadata for coloring and labels
const TRACK_META: Record<string, { label: string; icon: any; color: string; textClass: string; bgClass: string; borderClass: string; glowClass: string }> = {
  usos: {
    label: "Usos e Instrumentalización",
    icon: Layers,
    color: "sky",
    textClass: "text-sky-600 dark:text-sky-400",
    bgClass: "bg-sky-50 dark:bg-sky-950/20",
    borderClass: "border-sky-200 dark:border-sky-900/50",
    glowClass: "shadow-sky-500/10 dark:shadow-sky-400/5",
  },
  etica: {
    label: "Ética, Filosofía y Consciencia",
    icon: Scale,
    color: "violet",
    textClass: "text-violet-600 dark:text-violet-400",
    bgClass: "bg-violet-50 dark:bg-violet-950/20",
    borderClass: "border-violet-200 dark:border-violet-900/50",
    glowClass: "shadow-violet-500/10 dark:shadow-violet-400/5",
  },
  regulaciones: {
    label: "Regulaciones y Leyes",
    icon: Clock,
    color: "emerald",
    textClass: "text-emerald-600 dark:text-emerald-400",
    bgClass: "bg-emerald-50 dark:bg-emerald-950/20",
    borderClass: "border-emerald-200 dark:border-emerald-900/50",
    glowClass: "shadow-emerald-500/10 dark:shadow-emerald-400/5",
  },
  alimentacion: {
    label: "Alimentación y Evolución",
    icon: Activity,
    color: "amber",
    textClass: "text-amber-600 dark:text-amber-400",
    bgClass: "bg-amber-50 dark:bg-amber-950/20",
    borderClass: "border-amber-200 dark:border-amber-900/50",
    glowClass: "shadow-amber-500/10 dark:shadow-amber-400/5",
  }
};

// Map of causal connections between milestones
const TIMELINE_CONNECTIONS: Record<string, string[]> = {
  "domesticacion-neolitica": ["mutacion-lactasa"],
  "mutacion-lactasa": ["domesticacion-neolitica"],
  
  "bentham-sufrimiento": ["martins-act"],
  "martins-act": ["bentham-sufrimiento"],
  
  "chicago-stock-yards": ["macrogranjas-mediados-siglo"],
  
  "watson-veganismo-origen": ["sintesis-b12"],
  "sintesis-b12": ["watson-veganismo-origen", "consenso-nutricional-and", "agricultura-celular-era"],
  
  "macrogranjas-mediados-siglo": ["informe-brambell-ley", "singer-regan-auge", "chicago-stock-yards"],
  "informe-brambell-ley": ["macrogranjas-mediados-siglo", "tratado-lisboa", "end-the-cage-age-initiative"],
  "singer-regan-auge": ["macrogranjas-mediados-siglo", "declaracion-montreal"],
  
  "tratado-lisboa": ["informe-brambell-ley", "reforma-codigo-civil-es"],
  
  "declaracion-cambridge": ["reforma-codigo-civil-es", "declaracion-montreal"],
  "declaracion-montreal": ["declaracion-cambridge", "singer-regan-auge"],
  
  "consenso-nutricional-and": ["sintesis-b12"],
  "agricultura-celular-era": ["sintesis-b12"],
  
  "end-the-cage-age-initiative": ["informe-brambell-ley"],
  "reforma-codigo-civil-es": ["declaracion-cambridge", "tratado-lisboa"]
};

interface MilestoneWithTrack extends TimelineMilestone {
  trackId: string;
  color: string;
}

interface Era {
  id: string;
  name: string;
  period: string;
  minYear: number;
  maxYear: number;
}

const ERAS: Era[] = [
  { id: "antiguedad", name: "Orígenes y Antigüedad", period: "Hasta el año 500 d.C.", minYear: -Infinity, maxYear: 500 },
  { id: "medieval-ilustracion", name: "Medievo a la Ilustración", period: "Años 500 a 1800 d.C.", minYear: 501, maxYear: 1800 },
  { id: "industrializacion", name: "Industrialización y Siglo XIX", period: "Años 1800 a 1940 d.C.", minYear: 1801, maxYear: 1940 },
  { id: "siglo-xx", name: "El Siglo XX Moderno", period: "Años 1940 a 2000 d.C.", minYear: 1941, maxYear: 2000 },
  { id: "siglo-xxi", name: "El Siglo XXI y el Futuro", period: "Años 2001 al presente", minYear: 2001, maxYear: Infinity }
];

export default function HistoryTimeline() {
  const [searchQuery, setSearchQuery] = useState("");
  const [hoveredMilestoneId, setHoveredMilestoneId] = useState<string | null>(null);
  const [selectedMilestoneId, setSelectedMilestoneId] = useState<string | null>(null);
  const [expandedMilestones, setExpandedMilestones] = useState<Record<string, boolean>>({});
  const [mobileActiveTrack, setMobileActiveTrack] = useState<string>("todos");
  const [svgPaths, setSvgPaths] = useState<{ path: string; color: string; fromId: string; toId: string }[]>([]);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  // Flatten all milestones from groups and add track information
  const allMilestones: MilestoneWithTrack[] = TIMELINE_DATA.flatMap((group: TimelineGroup) =>
    group.milestones.map((milestone: TimelineMilestone) => ({
      ...milestone,
      trackId: group.id,
      color: group.color
    }))
  ).sort((a, b) => a.year - b.year);

  // Toggle card expansion
  const toggleExpand = (id: string) => {
    setExpandedMilestones(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
    // Re-render SVG connections after height transition completes
    setTimeout(calculateConnections, 250);
  };

  // Focus and scroll to a milestone card
  const focusMilestone = (id: string) => {
    setSelectedMilestoneId(id);
    setHoveredMilestoneId(id);
    
    // Autoexpand focused card so details are visible immediately
    setExpandedMilestones(prev => ({ ...prev, [id]: true }));

    const cardElement = document.getElementById(`milestone-card-${id}`);
    if (cardElement) {
      cardElement.scrollIntoView({ behavior: "smooth", block: "center" });
      // Apply temporary visual border flash
      cardElement.classList.add("ring-2", "ring-purple-500", "dark:ring-purple-400");
      setTimeout(() => {
        cardElement.classList.remove("ring-2", "ring-purple-500", "dark:ring-purple-400");
      }, 1500);
    }
    setTimeout(calculateConnections, 250);
  };

  // Helper to retrieve causes and effects dynamically based on year order
  const getCausality = (id: string) => {
    const connectedIds = TIMELINE_CONNECTIONS[id] || [];
    const current = allMilestones.find(m => m.id === id);
    if (!current) return { causes: [], effects: [] };

    const causes: MilestoneWithTrack[] = [];
    const effects: MilestoneWithTrack[] = [];

    connectedIds.forEach(connId => {
      const linked = allMilestones.find(m => m.id === connId);
      if (linked) {
        if (linked.year < current.year) {
          causes.push(linked);
        } else {
          effects.push(linked);
        }
      }
    });

    return { causes, effects };
  };

  // Calculate coordinates of connection lines relative to main container
  const calculateConnections = () => {
    if (!containerRef.current || !hoveredMilestoneId) {
      setSvgPaths([]);
      return;
    }

    const activeId = hoveredMilestoneId;
    const connectedIds = TIMELINE_CONNECTIONS[activeId] || [];
    if (connectedIds.length === 0) {
      setSvgPaths([]);
      return;
    }

    const cRect = containerRef.current.getBoundingClientRect();
    const fromEl = document.getElementById(`milestone-card-${activeId}`);
    if (!fromEl) {
      setSvgPaths([]);
      return;
    }

    const paths: { path: string; color: string; fromId: string; toId: string }[] = [];

    connectedIds.forEach(toId => {
      const toEl = document.getElementById(`milestone-card-${toId}`);
      if (!toEl) return;

      const fRect = fromEl.getBoundingClientRect();
      const tRect = toEl.getBoundingClientRect();

      // Find center points relative to timeline wrapper container
      const fX = fRect.left + fRect.width / 2 - cRect.left;
      const fY = fRect.top + fRect.height / 2 - cRect.top;
      const tX = tRect.left + tRect.width / 2 - cRect.left;
      const tY = tRect.top + tRect.height / 2 - cRect.top;

      let startX = fX, startY = fY;
      let endX = tX, endY = tY;

      // Attachment points on card borders
      if (Math.abs(fX - tX) > Math.abs(fY - tY)) {
        // Horizontal connection
        if (fX < tX) {
          startX = fRect.right - cRect.left;
          endX = tRect.left - cRect.left;
        } else {
          startX = fRect.left - cRect.left;
          endX = tRect.right - cRect.left;
        }
      } else {
        // Vertical connection
        if (fY < tY) {
          startY = fRect.bottom - cRect.top;
          endY = tRect.top - cRect.top;
        } else {
          startY = fRect.top - cRect.top;
          endY = tRect.bottom - cRect.top;
        }
      }

      // Draw dynamic Bezier paths with controls extending outward
      const dx = Math.abs(startX - endX);
      const dy = Math.abs(startY - endY);
      
      let cp1X = startX;
      let cp1Y = startY;
      let cp2X = endX;
      let cp2Y = endY;

      if (dx > dy) {
        const offset = dx * 0.4;
        cp1X += (endX > startX) ? offset : -offset;
        cp2X += (startX > endX) ? offset : -offset;
      } else {
        const offset = dy * 0.4;
        cp1Y += (endY > startY) ? offset : -offset;
        cp2Y += (startY > endY) ? offset : -offset;
      }

      // Match connection track color
      const linkedMilestone = allMilestones.find(m => m.id === toId);
      const fromMilestone = allMilestones.find(m => m.id === activeId);
      const color = TRACK_META[fromMilestone?.trackId || "usos"]?.color || "violet";

      paths.push({
        path: `M ${startX} ${startY} C ${cp1X} ${cp1Y}, ${cp2X} ${cp2Y}, ${endX} ${endY}`,
        color,
        fromId: activeId,
        toId
      });
    });

    setSvgPaths(paths);
  };

  // Re-calculate paths on hover, scroll, or resize
  useEffect(() => {
    calculateConnections();
    
    window.addEventListener("resize", calculateConnections);
    // Recalculate on any animation transitions
    document.addEventListener("transitionend", calculateConnections);

    return () => {
      window.removeEventListener("resize", calculateConnections);
      document.removeEventListener("transitionend", calculateConnections);
    };
  }, [hoveredMilestoneId, expandedMilestones]);

  // Full-text search filter
  const filteredMilestones = allMilestones.filter(m => {
    const matchQuery = searchQuery.toLowerCase();
    const groupMeta = TRACK_META[m.trackId];
    return (
      m.title.toLowerCase().includes(matchQuery) ||
      m.shortDesc.toLowerCase().includes(matchQuery) ||
      m.longDesc.toLowerCase().includes(matchQuery) ||
      m.yearLabel.toLowerCase().includes(matchQuery) ||
      m.scientificFacts.some(f => f.toLowerCase().includes(matchQuery)) ||
      (groupMeta && groupMeta.label.toLowerCase().includes(matchQuery))
    );
  });

  return (
    <div className="space-y-8 w-full transition-colors duration-300">
      
      {/* Title & Introduction Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-zinc-200 dark:border-zinc-900 pb-8">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="p-1 px-2.5 rounded-full bg-violet-500/10 border border-violet-500/20 text-[10px] font-mono text-violet-600 dark:text-violet-400 font-bold uppercase tracking-wider">
              Hitos de la Coexistencia
            </span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-zinc-900 dark:text-white">
            Líneas de Tiempo de la Coexistencia
          </h2>
          <p className="text-zinc-500 dark:text-zinc-400 text-sm font-light leading-relaxed max-w-2xl">
            Explora de manera interactiva cómo se entrelazan la explotación material del animal, el debate ético-filosófico y la evolución de los ordenamientos jurídicos a lo largo de la historia.
          </p>
        </div>

        {/* Free text search bar */}
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 dark:text-zinc-600" />
          <input
            type="text"
            placeholder="Buscar hitos, autores, leyes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500 dark:focus:ring-purple-400 dark:focus:border-purple-400 transition-all font-mono"
          />
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-mono text-zinc-400 dark:text-zinc-600 hover:text-zinc-900 dark:hover:text-white"
            >
              LIMPIAR
            </button>
          )}
        </div>
      </div>

      {/* ========================================== */}
      {/* 🌟 NEW: GRAPHICAL INTERACTIVE TIME-AXIS 🌟 */}
      {/* ========================================== */}
      <div className="bg-white/60 dark:bg-zinc-950/40 border border-zinc-200 dark:border-zinc-900 rounded-3xl p-6 shadow-sm relative overflow-hidden backdrop-blur-md transition-all">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-purple-500" />
            <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200 uppercase font-mono tracking-wider">
              Eje Cronológico Gráfico e Interactivo
            </span>
          </div>
          <span className="text-[10px] font-mono text-zinc-450 dark:text-zinc-550 hidden sm:inline">
            Pasa el cursor o haz clic en los hitos para saltar en el tiempo
          </span>
        </div>

        {/* Scrollable Horizontal Timeline Ruler */}
        <div className="relative py-6 overflow-x-auto custom-scrollbar flex items-center min-w-full">
          {/* Continuous line in the background */}
          <div className="absolute left-0 right-0 h-0.5 bg-zinc-200 dark:bg-zinc-800 z-0 top-1/2 -translate-y-1/2 min-w-[1000px]" />
          
          {/* Timeline node dots distributed evenly */}
          <div className="flex justify-between items-center w-full min-w-[1000px] relative z-10 px-6">
            {allMilestones.map((m) => {
              const isHovered = hoveredMilestoneId === m.id;
              const isSelected = selectedMilestoneId === m.id;
              const meta = TRACK_META[m.trackId];
              
              return (
                <div 
                  key={m.id}
                  onMouseEnter={() => setHoveredMilestoneId(m.id)}
                  onMouseLeave={() => !selectedMilestoneId && setHoveredMilestoneId(null)}
                  onClick={() => focusMilestone(m.id)}
                  className="flex flex-col items-center relative cursor-pointer group"
                >
                  
                  {/* Visual Dot representing milestone */}
                  <div className={`w-4.5 h-4.5 rounded-full border-2 border-white dark:border-zinc-950 transition-all duration-300 flex items-center justify-center relative ${
                    isSelected || isHovered
                      ? "scale-125 z-20"
                      : "scale-100 z-10 hover:scale-110"
                  } ${
                    m.trackId === "usos" 
                      ? "bg-sky-500 shadow-[0_0_8px_rgba(14,165,233,0.5)]" 
                      : m.trackId === "etica" 
                      ? "bg-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.5)]" 
                      : m.trackId === "regulaciones" 
                      ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" 
                      : "bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]"
                  }`}
                  >
                    {/* Inner glowing dot for selected/hovered */}
                    {(isSelected || isHovered) && (
                      <div className="w-1.5 h-1.5 rounded-full bg-white dark:bg-zinc-950 animate-pulse" />
                    )}
                  </div>

                  {/* Epoch label under the dot */}
                  <span className={`text-[9px] font-mono font-bold mt-2.5 tracking-tight transition-colors ${
                    isSelected || isHovered 
                      ? meta.textClass 
                      : "text-zinc-400 dark:text-zinc-600"
                  }`}>
                    {m.yearLabel.replace("c. ", "").replace(" a.C.", "aC").replace(" d.C.", "")}
                  </span>

                  {/* Interactive popup mini-card on hover */}
                  <AnimatePresence>
                    {isHovered && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 8 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 8 }}
                        className="absolute bottom-full mb-3.5 w-44 p-3 bg-zinc-950 dark:bg-zinc-900 text-white rounded-xl shadow-xl border border-zinc-800 z-30 text-center pointer-events-none"
                      >
                        <span className={`block text-[8px] font-mono font-black uppercase tracking-widest mb-1 ${meta.textClass}`}>
                          {meta.label.split(" ")[0]}
                        </span>
                        <h5 className="text-[10px] font-bold leading-tight text-white line-clamp-2">
                          {m.title}
                        </h5>
                        <span className="block text-[8px] font-mono text-zinc-400 mt-1">
                          {m.yearLabel}
                        </span>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Legend & Guide Bar */}
      <div className="hidden lg:grid grid-cols-4 gap-4 p-4 bg-zinc-100/50 dark:bg-zinc-900/30 rounded-2xl border border-zinc-200/50 dark:border-zinc-900/50">
        {(Object.keys(TRACK_META) as Array<keyof typeof TRACK_META>).map(trackKey => {
          const meta = TRACK_META[trackKey];
          const Icon = meta.icon;
          return (
            <div key={trackKey} className="flex items-center gap-3 px-2">
              <div className={`w-8 h-8 rounded-lg ${meta.bgClass} border ${meta.borderClass} flex items-center justify-center`}>
                <Icon className={`w-4 h-4 ${meta.textClass}`} />
              </div>
              <div>
                <h4 className="text-[11px] font-bold text-zinc-800 dark:text-zinc-200 tracking-tight leading-tight">
                  {meta.label}
                </h4>
                <p className="text-[9px] font-mono text-zinc-400 dark:text-zinc-500">
                  Historial de coexistencia
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Interactive Helper Overlay (when connection is active) */}
      <AnimatePresence>
        {(hoveredMilestoneId || selectedMilestoneId) && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="flex items-center justify-between p-3 px-4 rounded-xl bg-purple-500/10 border border-purple-500/20 text-xs font-mono text-purple-700 dark:text-purple-300"
          >
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-500 animate-pulse" />
              <span>
                Mostrando conexiones causales para: <strong>{allMilestones.find(m => m.id === (hoveredMilestoneId || selectedMilestoneId))?.title}</strong>
              </span>
            </div>
            <button 
              onClick={() => {
                setSelectedMilestoneId(null);
                setHoveredMilestoneId(null);
              }}
              className="text-[10px] font-bold underline hover:text-purple-900 dark:hover:text-purple-100 cursor-pointer"
            >
              Restablecer
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Timeline Wrapper (Holds both desktop columns and canvas) */}
      <div 
        ref={containerRef} 
        className="relative w-full min-h-[500px]"
        onMouseLeave={() => !selectedMilestoneId && setHoveredMilestoneId(null)}
      >
        
        {/* SVG Drawing Canvas for bezier curve connections (Desktop only) */}
        <svg 
          ref={svgRef}
          className="absolute inset-0 w-full h-full pointer-events-none z-0 hidden lg:block"
          style={{ mixBlendMode: "difference" }}
        >
          <defs>
            <linearGradient id="skyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#0284c7" stopOpacity="0.2" />
            </linearGradient>
            <linearGradient id="violetGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#c084fc" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.2" />
            </linearGradient>
            <linearGradient id="emeraldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#34d399" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="0.2" />
            </linearGradient>
            <linearGradient id="amberGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#fbbf24" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#d97706" stopOpacity="0.2" />
            </linearGradient>
          </defs>

          {/* Render connections */}
          {svgPaths.map((c, i) => (
            <g key={i}>
              {/* Thick soft ambient glow */}
              <motion.path
                d={c.path}
                fill="none"
                stroke={`url(#${c.color}Grad)`}
                strokeWidth="4"
                className="opacity-40"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.4 }}
              />
              {/* Sharp connecting curve */}
              <motion.path
                d={c.path}
                fill="none"
                stroke={c.color === "sky" ? "#0284c7" : c.color === "violet" ? "#8b5cf6" : c.color === "emerald" ? "#10b981" : "#d97706"}
                strokeWidth="1.5"
                strokeDasharray="4 2"
                className="opacity-90 animate-[dash_10s_linear_infinite]"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.4 }}
              />
            </g>
          ))}
        </svg>

        {/* ========================================== */}
        {/* DESKTOP LAYOUT (Parallel Columns by Era)   */}
        {/* ========================================== */}
        <div className="hidden lg:block space-y-16 relative z-10">
          {ERAS.map((era) => {
            // Filter milestones in this Era
            const eraMilestones = filteredMilestones.filter(m => m.year >= era.minYear && m.year <= era.maxYear);
            
            // Skip rendering eras that have no search results matches
            if (eraMilestones.length === 0 && searchQuery) return null;

            return (
              <div key={era.id} className="space-y-6">
                
                {/* Era header bar */}
                <div className="flex items-center gap-4 border-b border-zinc-200/60 dark:border-zinc-900/60 pb-3">
                  <div className="w-2.5 h-2.5 rounded-full bg-purple-500/70" />
                  <h3 className="text-sm font-black text-zinc-800 dark:text-zinc-100 tracking-wider font-heading uppercase">
                    {era.name}
                  </h3>
                  <span className="text-[10px] font-mono text-zinc-400 dark:text-zinc-600 bg-zinc-100 dark:bg-zinc-950 p-1 px-2.5 rounded-md border border-zinc-200/40 dark:border-zinc-900/40 ml-auto">
                    {era.period}
                  </span>
                </div>

                {/* Grid representing the 4 swimlane columns */}
                <div className="grid grid-cols-4 gap-6 items-stretch">
                  {(Object.keys(TRACK_META) as Array<keyof typeof TRACK_META>).map(trackKey => {
                    // Milestones in this Era and specific Track
                    const trackMilestones = eraMilestones.filter(m => m.trackId === trackKey);
                    
                    return (
                      <div 
                        key={trackKey} 
                        className="flex flex-col gap-4 min-h-[140px] p-2 rounded-2xl bg-zinc-50/20 dark:bg-zinc-950/5 border border-dashed border-zinc-200/40 dark:border-zinc-900/40 transition-colors hover:bg-zinc-100/10 dark:hover:bg-zinc-950/10"
                      >
                        {trackMilestones.map((milestone) => {
                          const meta = TRACK_META[milestone.trackId];
                          const isHovered = hoveredMilestoneId === milestone.id;
                          const isSelected = selectedMilestoneId === milestone.id;
                          const isLinked = svgPaths.some(p => p.toId === milestone.id);
                          const isExpanded = !!expandedMilestones[milestone.id];

                          return (
                            <div
                              key={milestone.id}
                              id={`milestone-card-${milestone.id}`}
                              onMouseEnter={() => {
                                setHoveredMilestoneId(milestone.id);
                                if (!selectedMilestoneId) {
                                  setSelectedMilestoneId(milestone.id);
                                }
                              }}
                              onClick={() => {
                                setSelectedMilestoneId(milestone.id);
                                setHoveredMilestoneId(milestone.id);
                              }}
                              className={`p-4 rounded-xl transition-all duration-300 cursor-pointer flex flex-col justify-between space-y-3 relative overflow-hidden group select-none ${
                                isSelected || isHovered
                                  ? "bg-white dark:bg-zinc-900 border-zinc-300 dark:border-zinc-800 shadow-lg scale-[1.01]"
                                  : isLinked
                                  ? "bg-white/90 dark:bg-zinc-900/90 border-purple-400/60 dark:border-purple-900/50 shadow-sm scale-[0.99]"
                                  : "bg-white/40 dark:bg-zinc-900/20 hover:bg-white/80 dark:hover:bg-zinc-900/50 border-zinc-200 dark:border-zinc-900/50 hover:border-zinc-300 dark:hover:border-zinc-800"
                              } border ${meta.glowClass}`}
                            >
                              
                              {/* Ambient internal color tag strip */}
                              <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${
                                milestone.trackId === "usos" 
                                  ? "from-sky-400 to-sky-600" 
                                  : milestone.trackId === "etica" 
                                  ? "from-purple-400 to-violet-600" 
                                  : milestone.trackId === "regulaciones" 
                                  ? "from-emerald-400 to-emerald-600" 
                                  : "from-amber-400 to-amber-600"
                              }`} />

                              {/* Card Header */}
                              <div className="space-y-1">
                                <div className="flex items-center justify-between">
                                  <span className={`text-[10px] font-black font-mono tracking-widest uppercase ${meta.textClass}`}>
                                    {milestone.yearLabel}
                                  </span>
                                  {isLinked && (
                                    <span className="p-0.5 px-1.5 rounded bg-purple-500/10 border border-purple-500/20 text-[8px] font-mono text-purple-600 dark:text-purple-400 font-bold uppercase animate-pulse">
                                      CONECTADO
                                    </span>
                                  )}
                                </div>
                                <h4 className="text-xs font-black tracking-tight text-zinc-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors leading-tight">
                                  {milestone.title}
                                </h4>
                              </div>

                              {/* Core Short Overview */}
                              <p className="text-[11px] font-light text-zinc-500 dark:text-zinc-400 leading-relaxed">
                                {milestone.shortDesc}
                              </p>

                              {/* Highlights section (Metric/Quote) */}
                              {isExpanded && (
                                <motion.div 
                                  initial={{ opacity: 0, height: 0 }}
                                  animate={{ opacity: 1, height: "auto" }}
                                  exit={{ opacity: 0, height: 0 }}
                                  className="space-y-3 pt-2 border-t border-zinc-100 dark:border-zinc-900 text-[11px] leading-relaxed"
                                >
                                  {/* Deep Long Description */}
                                  <div className="text-zinc-600 dark:text-zinc-300 font-light leading-relaxed whitespace-pre-line bg-zinc-50/50 dark:bg-zinc-950/20 p-2.5 rounded-lg border border-zinc-200/30 dark:border-zinc-900/30">
                                    {milestone.longDesc}
                                  </div>

                                  {/* Scientific Facts and references list */}
                                  <div className="space-y-2">
                                    <span className="text-[9px] font-bold tracking-wider text-zinc-400 uppercase block">
                                      EVIDENCIA CIENTÍFICA / DECONSTRUCCIÓN
                                    </span>
                                    <ul className="space-y-1.5 list-none pl-0">
                                      {milestone.scientificFacts.map((fact, index) => (
                                        <li key={index} className="flex gap-1.5 text-zinc-500 dark:text-zinc-400 font-light">
                                          <span className="text-purple-500 font-mono text-[9px] mt-0.5">●</span>
                                          <span>{fact}</span>
                                        </li>
                                      ))}
                                    </ul>
                                  </div>

                                  {/* Clickable Cause & Effect navigation list */}
                                  {(() => {
                                    const { causes, effects } = getCausality(milestone.id);
                                    if (causes.length === 0 && effects.length === 0) return null;
                                    return (
                                      <div className="space-y-2 pt-1.5 border-t border-zinc-100/50 dark:border-zinc-900/50">
                                        <span className="text-[9px] font-bold tracking-wider text-zinc-400 uppercase block">
                                          VÍNCULOS DE CAUSALIDAD
                                        </span>
                                        
                                        {/* Causes links */}
                                        {causes.map(c => (
                                          <div 
                                            key={c.id} 
                                            onClick={(e) => { e.stopPropagation(); focusMilestone(c.id); }}
                                            className="flex items-center justify-between p-1.5 rounded bg-amber-500/5 hover:bg-amber-500/10 border border-amber-500/10 text-[10px] text-amber-700 dark:text-amber-300 group/link transition-all font-mono"
                                          >
                                            <span className="flex items-center gap-1 font-mono">
                                              <ArrowLeft className="w-3 h-3 group-hover/link:-translate-x-0.5 transition-transform" />
                                              Causa: {c.yearLabel}
                                            </span>
                                            <span className="font-bold truncate max-w-[120px]">{c.title}</span>
                                          </div>
                                        ))}

                                        {/* Effects links */}
                                        {effects.map(ef => (
                                          <div 
                                            key={ef.id} 
                                            onClick={(e) => { e.stopPropagation(); focusMilestone(ef.id); }}
                                            className="flex items-center justify-between p-1.5 rounded bg-emerald-500/5 hover:bg-emerald-500/10 border border-emerald-500/10 text-[10px] text-emerald-700 dark:text-emerald-300 group/link transition-all font-mono"
                                          >
                                            <span className="flex items-center gap-1 font-mono">
                                              Efecto: {ef.yearLabel}
                                              <ArrowRight className="w-3 h-3 group-hover/link:translate-x-0.5 transition-transform" />
                                            </span>
                                            <span className="font-bold truncate max-w-[120px]">{ef.title}</span>
                                          </div>
                                        ))}
                                      </div>
                                    );
                                  })()}

                                  {/* Academic References block */}
                                  {milestone.references && milestone.references.length > 0 && (
                                    <div className="space-y-1.5 pt-1.5 border-t border-zinc-100/50 dark:border-zinc-900/50">
                                      <div className="flex items-center gap-1 text-[9px] font-bold tracking-wider text-zinc-400 uppercase">
                                        <BookOpen className="w-3.5 h-3.5 text-zinc-500" />
                                        <span>REFERENCIAS APA</span>
                                      </div>
                                      <div className="space-y-1 bg-zinc-50 dark:bg-zinc-950 p-2 rounded-lg border border-zinc-200/50 dark:border-zinc-900/50">
                                        {milestone.references.map((ref) => (
                                          <div key={ref.id} className="text-[10px] text-zinc-500 dark:text-zinc-500 leading-normal flex gap-1 items-start">
                                            <span className="text-purple-500 font-bold font-mono">[{ref.id}]</span>
                                            <div className="flex-1 font-mono leading-tight">
                                              {ref.citation}
                                              {ref.url && (
                                                <a 
                                                  href={ref.url} 
                                                  target="_blank" 
                                                  rel="noopener noreferrer" 
                                                  className="inline-flex items-center gap-0.5 text-purple-600 dark:text-purple-400 hover:underline ml-1 font-bold"
                                                >
                                                  Fuente <ExternalLink className="w-2.5 h-2.5" />
                                                </a>
                                              )}
                                            </div>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                </motion.div>
                              )}

                              {/* Card Expand / Collapse trigger */}
                              <div 
                                onClick={(e) => { e.stopPropagation(); toggleExpand(milestone.id); }}
                                className="flex items-center justify-between pt-2 border-t border-zinc-100 dark:border-zinc-900 text-[10px] font-mono text-zinc-400 dark:text-zinc-500 hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
                              >
                                <span>
                                  {isExpanded ? "Ocultar evidencias" : "Deconstruir evidencias"}
                                </span>
                                <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-300 ${isExpanded ? "rotate-180" : ""}`} />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* ========================================== */}
        {/* MOBILE LAYOUT (Merged Chronological Feed)   */}
        {/* ========================================== */}
        <div className="lg:hidden space-y-6">
          
          {/* Mobile Track Filters (Horizontal Scrollable pills) */}
          <div className="sticky top-16 bg-zinc-50/80 dark:bg-zinc-950/80 backdrop-blur-md py-3 border-b border-zinc-200/50 dark:border-zinc-900/50 z-20 flex gap-2 overflow-x-auto pr-4 custom-scrollbar">
            <button
              onClick={() => setMobileActiveTrack("todos")}
              className={`px-3 py-1.5 rounded-full text-xs font-mono font-bold tracking-tight whitespace-nowrap transition-all cursor-pointer ${
                mobileActiveTrack === "todos"
                  ? "bg-zinc-900 dark:bg-white text-white dark:text-zinc-950"
                  : "bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-900 text-zinc-500 dark:text-zinc-400 hover:text-zinc-800"
              }`}
            >
              Todos
            </button>
            {(Object.keys(TRACK_META) as Array<keyof typeof TRACK_META>).map(trackKey => {
              const meta = TRACK_META[trackKey];
              return (
                <button
                  key={trackKey}
                  onClick={() => setMobileActiveTrack(trackKey)}
                  className={`px-3 py-1.5 rounded-full text-xs font-mono font-bold tracking-tight whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer border ${
                    mobileActiveTrack === trackKey
                      ? "bg-purple-500 text-white border-purple-500 shadow-md"
                      : "bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-900 text-zinc-500 dark:text-zinc-400 hover:text-zinc-850"
                  }`}
                >
                  <meta.icon className="w-3.5 h-3.5" />
                  {meta.label.split(" ")[0]} {/* Shorten label for mobile */}
                </button>
              );
            })}
          </div>

          {/* Chronological Milestone Feed */}
          {(() => {
            // Apply track filter on mobile
            const mobileFilteredMilestones = filteredMilestones.filter(m => 
              mobileActiveTrack === "todos" || m.trackId === mobileActiveTrack
            );

            if (mobileFilteredMilestones.length === 0) {
              return (
                <div className="py-16 text-center space-y-3">
                  <HelpCircle className="w-10 h-10 stroke-1 text-zinc-400 dark:text-zinc-700 mx-auto animate-pulse" />
                  <p className="text-zinc-400 dark:text-zinc-600 text-xs font-mono">
                    No se encontraron hitos para los filtros seleccionados
                  </p>
                </div>
              );
            }

            return (
              <div className="relative border-l-2 border-zinc-200 dark:border-zinc-850 ml-3 pl-5 space-y-6">
                {mobileFilteredMilestones.map((milestone) => {
                  const meta = TRACK_META[milestone.trackId];
                  const isExpanded = !!expandedMilestones[milestone.id];

                  return (
                    <div 
                      key={milestone.id}
                      className="relative"
                    >
                      {/* Interactive Chronological bullet marker */}
                      <div className={`absolute -left-[27px] top-1.5 w-3.5 h-3.5 rounded-full border-2 border-white dark:border-zinc-950 ${
                        milestone.trackId === "usos" 
                          ? "bg-sky-500" 
                          : milestone.trackId === "etica" 
                          ? "bg-purple-500" 
                          : milestone.trackId === "regulaciones" 
                          ? "bg-emerald-500" 
                          : "bg-amber-500"
                      }`} />

                      {/* Card element */}
                      <div 
                        className={`p-4 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-850 hover:border-zinc-300 dark:hover:border-zinc-800 transition-all ${meta.glowClass} space-y-3`}
                      >
                        {/* Header */}
                        <div className="flex items-center justify-between">
                          <span className={`text-[10px] font-black font-mono tracking-widest uppercase ${meta.textClass}`}>
                            {milestone.yearLabel}
                          </span>
                          <span className="text-[9px] font-mono text-zinc-400 dark:text-zinc-500">
                            {meta.label.split(" ")[0]}
                          </span>
                        </div>

                        {/* Title */}
                        <h4 className="text-sm font-black tracking-tight text-zinc-900 dark:text-white leading-tight">
                          {milestone.title}
                        </h4>

                        {/* Summary */}
                        <p className="text-[11px] font-light text-zinc-500 dark:text-zinc-400 leading-relaxed">
                          {milestone.shortDesc}
                        </p>

                        {/* Expandable Evidence details */}
                        {isExpanded && (
                          <motion.div 
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="space-y-3 pt-2 border-t border-zinc-100 dark:border-zinc-850 text-[11px] leading-relaxed"
                          >
                            <div className="text-zinc-600 dark:text-zinc-300 font-light leading-relaxed whitespace-pre-line bg-zinc-50/50 dark:bg-zinc-950/20 p-2.5 rounded-lg border border-zinc-200/30 dark:border-zinc-850">
                              {milestone.longDesc}
                            </div>

                            {/* Evidence list */}
                            <div className="space-y-2">
                              <span className="text-[9px] font-bold tracking-wider text-zinc-400 uppercase block">
                                EVIDENCIA CIENTÍFICA
                              </span>
                              <ul className="space-y-1.5 list-none pl-0">
                                {milestone.scientificFacts.map((fact, index) => (
                                  <li key={index} className="flex gap-1.5 text-zinc-500 dark:text-zinc-400 font-light">
                                    <span className="text-purple-500 font-mono text-[9px] mt-0.5">●</span>
                                    <span>{fact}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>

                            {/* Causal links navigation (Clickable tags on mobile) */}
                            {(() => {
                              const { causes, effects } = getCausality(milestone.id);
                              if (causes.length === 0 && effects.length === 0) return null;
                              return (
                                <div className="space-y-2 pt-1.5 border-t border-zinc-100/50 dark:border-zinc-850">
                                  <span className="text-[9px] font-bold tracking-wider text-zinc-400 uppercase block">
                                    VÍNCULOS HISTÓRICOS
                                  </span>
                                  {causes.map(c => (
                                    <div 
                                      key={c.id} 
                                      onClick={() => focusMilestone(c.id)}
                                      className="flex items-center justify-between p-1.5 rounded bg-amber-500/5 border border-amber-500/10 text-[10px] text-amber-700 dark:text-amber-400 font-mono"
                                    >
                                      <span>← Causa: {c.yearLabel}</span>
                                      <span className="font-bold truncate max-w-[140px]">{c.title}</span>
                                    </div>
                                  ))}
                                  {effects.map(ef => (
                                    <div 
                                      key={ef.id} 
                                      onClick={() => focusMilestone(ef.id)}
                                      className="flex items-center justify-between p-1.5 rounded bg-emerald-500/5 border border-emerald-500/10 text-[10px] text-emerald-700 dark:text-emerald-400 font-mono"
                                    >
                                      <span>Efecto: {ef.yearLabel} →</span>
                                      <span className="font-bold truncate max-w-[140px]">{ef.title}</span>
                                    </div>
                                  ))}
                                </div>
                              );
                            })()}

                            {/* APA citations */}
                            {milestone.references && milestone.references.length > 0 && (
                              <div className="space-y-1.5 pt-1.5 border-t border-zinc-100/50 dark:border-zinc-850">
                                <div className="flex items-center gap-1 text-[9px] font-bold tracking-wider text-zinc-400 uppercase">
                                  <BookOpen className="w-3.5 h-3.5 text-zinc-500" />
                                  <span>REFERENCIAS APA</span>
                                </div>
                                <div className="space-y-1 bg-zinc-50 dark:bg-zinc-950 p-2 rounded-lg border border-zinc-200/50 dark:border-zinc-850">
                                  {milestone.references.map((ref) => (
                                    <div key={ref.id} className="text-[10px] text-zinc-500 dark:text-zinc-500 leading-normal flex gap-1 items-start">
                                      <span className="text-purple-500 font-bold font-mono">[{ref.id}]</span>
                                      <div className="flex-1 font-mono leading-tight">
                                        {ref.citation}
                                        {ref.url && (
                                          <a 
                                            href={ref.url} 
                                            target="_blank" 
                                            rel="noopener noreferrer" 
                                            className="inline-flex items-center gap-0.5 text-purple-600 dark:text-purple-400 hover:underline ml-1 font-bold"
                                          >
                                            Fuente <ExternalLink className="w-2.5 h-2.5" />
                                          </a>
                                        )}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </motion.div>
                        )}

                        {/* Mobile card expandable trigger */}
                        <div 
                          onClick={() => toggleExpand(milestone.id)}
                          className="flex items-center justify-between pt-2 border-t border-zinc-100 dark:border-zinc-850 text-[10px] font-mono text-zinc-400 dark:text-zinc-500"
                        >
                          <span>
                            {isExpanded ? "Ocultar evidencias" : "Deconstruir evidencias"}
                          </span>
                          <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-300 ${isExpanded ? "rotate-180" : ""}`} />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })()}
        </div>

      </div>

    </div>
  );
}
