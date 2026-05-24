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
  ArrowLeft,
  Sparkles,
  Info,
  Calendar,
  Activity,
  Globe,
  Scale,
  Layers,
  HelpCircle
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import TextRenderer from "./TextRenderer";

// Track metadata for coloring and labels in parallel view
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
    color: "purple",
    textClass: "text-purple-600 dark:text-purple-400",
    bgClass: "bg-purple-50 dark:bg-purple-950/20",
    borderClass: "border-purple-200 dark:border-purple-900/50",
    glowClass: "shadow-purple-500/10 dark:shadow-purple-400/5",
  },
  regulaciones: {
    label: "Regulaciones y Leyes",
    icon: Globe,
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

interface TimelineExplorerProps {
  onRedirectToConcept?: (nodeId: string) => void;
}

export default function TimelineExplorer({ onRedirectToConcept }: TimelineExplorerProps) {
  // Layout state toggle: swimlanes (visually stunning grid) vs detallado (original split view with comparison)
  const [layoutView, setLayoutView] = useState<"swimlanes" | "detallado">("swimlanes");
  
  // Shared state
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMilestone, setSelectedMilestone] = useState<TimelineMilestone | null>(null);
  const [hoveredMilestoneId, setHoveredMilestoneId] = useState<string | null>(null);
  const [expandedMilestones, setExpandedMilestones] = useState<Record<string, boolean>>({});

  // Original Detallado view states
  const [activeTimelineId, setActiveTimelineId] = useState<"usos" | "etica" | "regulaciones" | "alimentacion">("usos");
  const [isBibliographyOpen, setIsBibliographyOpen] = useState(false);
  const [isMobileDetailOpen, setIsMobileDetailOpen] = useState(false);
  const [isCompareMode, setIsCompareMode] = useState(false);
  const [compareA, setCompareA] = useState<TimelineMilestone | null>(null);
  const [compareB, setCompareB] = useState<TimelineMilestone | null>(null);

  // Parallel swimlanes state
  const [mobileActiveTrack, setMobileActiveTrack] = useState<string>("todos");
  const [svgPaths, setSvgPaths] = useState<{ path: string; color: string; fromId: string; toId: string }[]>([]);
  const [dotPositions, setDotPositions] = useState<Record<string, number>>({});

  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  // Reset bibliography collapse on milestone change
  useEffect(() => {
    setIsBibliographyOpen(false);
  }, [selectedMilestone]);

  // Flatten all milestones from groups and add track information
  const allMilestones: MilestoneWithTrack[] = TIMELINE_DATA.flatMap((group: TimelineGroup) =>
    group.milestones.map((milestone: TimelineMilestone) => ({
      ...milestone,
      trackId: group.id,
      color: group.color
    }))
  ).sort((a, b) => a.year - b.year);

  // Toggle card expansion in parallel view
  const toggleExpand = (id: string) => {
    setExpandedMilestones(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
    setTimeout(() => {
      calculateConnections();
      calculateDotPositions();
    }, 250);
  };

  // Focus and scroll to a milestone card
  const focusMilestone = (id: string) => {
    setSelectedMilestone(allMilestones.find(m => m.id === id) || null);
    setHoveredMilestoneId(id);
    
    // Autoexpand focused card so details are visible immediately
    setExpandedMilestones(prev => ({ ...prev, [id]: true }));

    const cardElement = document.getElementById(`milestone-card-${id}`);
    if (cardElement) {
      cardElement.scrollIntoView({ behavior: "smooth", block: "center" });
      cardElement.classList.add("ring-2", "ring-purple-500", "dark:ring-purple-400");
      setTimeout(() => {
        cardElement.classList.remove("ring-2", "ring-purple-500", "dark:ring-purple-400");
      }, 1500);
    }
    setTimeout(() => {
      calculateConnections();
      calculateDotPositions();
    }, 250);
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

  // Calculate vertical coordinate position of each card horizontally aligned (left rail)
  const calculateDotPositions = () => {
    if (!containerRef.current || layoutView !== "swimlanes" || window.innerWidth < 1024) return;
    const cRect = containerRef.current.getBoundingClientRect();
    const positions: Record<string, number> = {};

    allMilestones.forEach(m => {
      const cardEl = document.getElementById(`milestone-card-${m.id}`);
      if (cardEl) {
        const cardRect = cardEl.getBoundingClientRect();
        // Calculate Center Y offset relative to timeline container top boundary
        positions[m.id] = cardRect.top + cardRect.height / 2 - cRect.top;
      }
    });

    setDotPositions(positions);
  };

  // Calculate coordinates of connection lines relative to main container (for swimlanes)
  const calculateConnections = () => {
    if (!containerRef.current || !hoveredMilestoneId || layoutView !== "swimlanes") {
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

      // Connect to the LEFT edge of the card, near the top color strip (y-offset of 24px)
      const startX = fRect.left - cRect.left;
      const startY = fRect.top + 24 - cRect.top;
      
      const endX = tRect.left - cRect.left;
      const endY = tRect.top + 24 - cRect.top;

      const dy = Math.abs(startY - endY);
      
      // Control points curve to the LEFT (negative offset)
      // The farther the distance, the deeper the curve, but cap it to avoid escaping the layout
      const loopOffset = Math.min(130, 45 + dy * 0.15);
      
      const cp1X = startX - loopOffset;
      const cp1Y = startY;
      
      const cp2X = endX - loopOffset;
      const cp2Y = endY;

      // Match connection track color
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
    calculateDotPositions();
    
    window.addEventListener("resize", () => {
      calculateConnections();
      calculateDotPositions();
    });
    document.addEventListener("transitionend", () => {
      calculateConnections();
      calculateDotPositions();
    });

    // Multi-stage trigger to guarantee alignment after full React DOM mount
    const timer1 = setTimeout(() => {
      calculateConnections();
      calculateDotPositions();
    }, 100);
    const timer2 = setTimeout(() => {
      calculateConnections();
      calculateDotPositions();
    }, 600);

    return () => {
      window.removeEventListener("resize", calculateConnections);
      document.removeEventListener("transitionend", calculateConnections);
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, [hoveredMilestoneId, expandedMilestones, searchQuery, layoutView]);

  // Original Detallado view helper
  const activeGroup = TIMELINE_DATA.find((g) => g.id === activeTimelineId)!;

  // Search filter applied to milestones
  const filteredMilestones = allMilestones.filter((milestone) => {
    const groupMeta = TRACK_META[milestone.trackId];
    const matchesSearch = 
      milestone.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      milestone.shortDesc.toLowerCase().includes(searchQuery.toLowerCase()) ||
      milestone.longDesc.toLowerCase().includes(searchQuery.toLowerCase()) ||
      milestone.yearLabel.toLowerCase().includes(searchQuery.toLowerCase()) ||
      milestone.scientificFacts.some(f => f.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (groupMeta && groupMeta.label.toLowerCase().includes(searchQuery.toLowerCase()));
    
    // In detallado view, filter also by activeTimelineId
    if (layoutView === "detallado" && !isCompareMode) {
      return matchesSearch && milestone.trackId === activeTimelineId;
    }
    
    return matchesSearch;
  });

  const getTimelineColorClasses = (id: string) => {
    switch (id) {
      case "usos":
        return {
          bg: "bg-sky-500/10 dark:bg-sky-500/5",
          border: "border-sky-500/20 dark:border-sky-500/30",
          text: "text-sky-600 dark:text-sky-400",
          glow: "bg-sky-500",
          badge: "bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/30"
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
      if (!compareA) {
        setCompareA(m);
      } else if (!compareB && compareA.id !== m.id) {
        setCompareB(m);
      } else {
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

  // Lag analysis deconstruction calculations
  const getLagAnalysis = (mA: TimelineMilestone, mB: TimelineMilestone) => {
    const diff = Math.abs(mA.year - mB.year);
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

    const older = mA.year < mB.year ? mA : mB;
    const newer = mA.year < mB.year ? mB : mA;
    return {
      years: diff,
      title: `Desfase Cronológico de ${diff} años`,
      desc: `Este intervalo de ${diff} años separa el hito "${older.title}" (${older.yearLabel}) del desarrollo "${newer.title}" (${newer.yearLabel}). Este vacío temporal ilustra el desfase sistémico existente entre el desarrollo de infraestructuras de instrumentalización animal, la teorización filosófica de los deberes de compasión y los retrasos históricos del ordenamiento jurídico para codificar estos avances en los marcos de justicia de los Estados.`
    };
  };

  const getComparisonYearScale = (mA: TimelineMilestone, mB: TimelineMilestone) => {
    const oldest = mA.year < mB.year ? mA : mB;
    const newest = mA.year < mB.year ? mB : mA;
    return (
      <div className="w-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800/80 rounded-2xl p-6 relative overflow-hidden flex flex-col justify-between items-stretch gap-6">
        <div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-0.5 bg-zinc-300 dark:bg-zinc-800 pointer-events-none" />
        
        <div className="flex items-center justify-between relative z-10">
          <div className="w-[45%] text-left">
            <span className="text-[10px] font-mono tracking-widest text-zinc-450 uppercase block mb-1">HITO INICIAL</span>
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
            <div className="flex items-center gap-1 text-zinc-505 text-xs">
              <Calendar className="w-3.5 h-3.5 text-zinc-400" />
              <span className="font-mono text-[9px] uppercase tracking-wider font-semibold">Registro Histórico</span>
            </div>
          </div>


            <h4 className="text-[10px] font-bold tracking-wider text-zinc-700 dark:text-zinc-300 font-mono flex items-center gap-1.5 transition-colors">
              <span className="h-1.5 w-1.5 rounded-full bg-zinc-800 dark:bg-white animate-pulse" />
              HECHOS HISTÓRICOS Y CIENTÍFICOS:
            </h4>
            <ul className="space-y-2 text-xs text-zinc-650 dark:text-zinc-400 leading-relaxed font-light select-text">
              {milestone.scientificFacts.map((fact, i) => (
                <li key={i} className="flex items-start gap-2 bg-white dark:bg-zinc-950/40 p-3 rounded-xl border border-zinc-200/60 dark:border-zinc-800/40 transition-colors">
                  <span className="text-zinc-450 dark:text-zinc-655 font-mono font-semibold mt-0.5 select-none">[{i + 1}]</span>
                  <span><TextRenderer text={fact} references={milestone.references} /></span>
                </li>
              ))}
            </ul>

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
                    <ul className="mt-2.5 space-y-2.5 pl-1.5 font-mono text-[10.5px]">
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
            <span className="text-[9px] font-mono tracking-widest uppercase text-zinc-450 dark:text-zinc-555 block mb-2">
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
              <ArrowRight className="w-3.5 h-3.5 text-zinc-450 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        )}
      </div>
    );
  };

  const getTimelineIcon = (id: string) => {
    switch (id) {
      case "usos":
        return <Layers className="w-4 h-4" />;
      case "etica":
        return <Scale className="w-4 h-4" />;
      case "regulaciones":
        return <Globe className="w-4 h-4" />;
      case "alimentacion":
        return <Activity className="w-4 h-4" />;
      default:
        return <Calendar className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-6 w-full select-none">
      
      {/* 🌟 LAYOUT VIEWS SELECTOR TOGGLE AND COMPARISON MODE (Unified Bar) 🌟 */}
      <div className="flex flex-col lg:flex-row gap-4 items-center justify-between w-full border-b border-zinc-200 dark:border-zinc-900 pb-4">
        
        {/* Layout View Toggler */}
        <div className="flex bg-zinc-100 dark:bg-zinc-900/60 p-1 rounded-2xl border border-zinc-200 dark:border-zinc-900 transition-colors shadow-inner">
          <button
            onClick={() => {
              setLayoutView("swimlanes");
              setIsCompareMode(false);
            }}
            className={`px-4 py-2 rounded-xl text-xs font-bold tracking-tight transition-all duration-300 cursor-pointer ${
              layoutView === "swimlanes"
                ? "bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-sm border border-zinc-200/50 dark:border-transparent scale-[1.01]"
                : "text-zinc-505 dark:text-zinc-450 hover:text-zinc-900 dark:hover:text-white"
            }`}
          >
            Línea Temporal Vertical
          </button>
          <button
            onClick={() => setLayoutView("detallado")}
            className={`px-4 py-2 rounded-xl text-xs font-bold tracking-tight transition-all duration-300 cursor-pointer ${
              layoutView === "detallado"
                ? "bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-sm border border-zinc-200/50 dark:border-transparent scale-[1.01]"
                : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
            }`}
          >
            Explorador Detallado
          </button>
        </div>

        {/* Action Toggle (Compare Mode / Free Text Search status) */}
        <div className="flex items-center gap-3 w-full lg:w-auto justify-end">
          {layoutView === "detallado" && (
            <button
              onClick={() => {
                setIsCompareMode(!isCompareMode);
                setCompareA(null);
                setCompareB(null);
                setSelectedMilestone(null);
              }}
              className={`flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-bold tracking-tight transition-all duration-300 cursor-pointer border ${
                isCompareMode
                  ? "bg-cyan-500/10 border-cyan-500 text-cyan-600 dark:text-cyan-400 shadow-md ring-1 ring-cyan-500/30"
                  : "bg-white dark:bg-zinc-950 hover:bg-zinc-150/40 dark:hover:bg-zinc-900 border-zinc-200 dark:border-zinc-850 text-zinc-655 dark:text-zinc-400"
              }`}
            >
              <GitCompare className="w-4 h-4" />
              <span>{isCompareMode ? "Desactivar Comparador" : "Modo Desfase Ético-Industrial"}</span>
            </button>
          )}

          {/* Search bar inside the upper controls for maximum space */}
          <div className="relative w-full lg:w-56">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-450" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar hito..."
              className="w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 focus:border-zinc-400 dark:focus:border-zinc-700 rounded-xl pl-9 pr-3 py-2 text-xs text-zinc-900 dark:text-white placeholder-zinc-450 outline-none focus:ring-1 focus:ring-zinc-300 dark:focus:ring-zinc-750 transition-all font-sans"
            />
          </div>
        </div>

      </div>

      {layoutView === "swimlanes" && (() => {
        const swimlaneFilteredMilestones = filteredMilestones.filter(m => 
          mobileActiveTrack === "todos" || m.trackId === mobileActiveTrack
        );

        return (
          <div className="space-y-8 w-full animate-fade-in">
            
            {/* 🔘 PERSPECTIVE FILTER PILLS BAR 🔘 */}
            <div className="flex gap-2 overflow-x-auto pr-4 pb-3 border-b border-zinc-200/50 dark:border-zinc-900/40 custom-scrollbar select-none">
              <button
                onClick={() => setMobileActiveTrack("todos")}
                className={`px-4 py-2 rounded-full text-xs font-mono font-bold tracking-tight whitespace-nowrap transition-all cursor-pointer border ${
                  mobileActiveTrack === "todos"
                    ? "bg-zinc-900 dark:bg-white text-white dark:text-zinc-950 border-transparent shadow-md"
                    : "bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-550 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-850"
                }`}
              >
                Todas las Perspectivas
              </button>
              {(Object.keys(TRACK_META) as Array<keyof typeof TRACK_META>).map(trackKey => {
                const meta = TRACK_META[trackKey];
                const isSelected = mobileActiveTrack === trackKey;
                const Icon = meta.icon;
                return (
                  <button
                    key={trackKey}
                    onClick={() => setMobileActiveTrack(trackKey)}
                    className={`px-4 py-2 rounded-full text-xs font-mono font-bold tracking-tight whitespace-nowrap transition-all flex items-center gap-2 cursor-pointer border ${
                      isSelected
                        ? `${
                            trackKey === "usos" ? "bg-sky-500 text-white border-transparent shadow-md" :
                            trackKey === "etica" ? "bg-purple-500 text-white border-transparent shadow-md" :
                            trackKey === "regulaciones" ? "bg-emerald-500 text-white border-transparent shadow-md" :
                            "bg-amber-500 text-white border-transparent shadow-md"
                          }`
                        : "bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-850"
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    {meta.label}
                  </button>
                );
              })}
            </div>

            {/* Main layout grid containing left vertical index minimap and right chronological timeline stream */}
            <div 
              ref={containerRef} 
              className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch w-full relative min-h-[500px]"
              onMouseLeave={() => !selectedMilestone && setHoveredMilestoneId(null)}
            >
              
              {/* SVG Connecting bezier curves (spans across the timeline stream) */}
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
                  <linearGradient id="purpleGrad" x1="0%" y1="0%" x2="100%" y2="100%">
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

                {svgPaths.map((c, i) => (
                  <g key={i}>
                    <motion.path
                      d={c.path}
                      fill="none"
                      stroke={`url(#${c.color}Grad)`}
                      strokeWidth="4"
                      className="opacity-30"
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ duration: 0.35 }}
                    />
                    <motion.path
                      d={c.path}
                      fill="none"
                      stroke={c.color === "sky" ? "#0284c7" : c.color === "purple" ? "#8b5cf6" : c.color === "emerald" ? "#10b981" : "#d97706"}
                      strokeWidth="1.5"
                      strokeDasharray="4 2"
                      className="opacity-80 animate-[dash_10s_linear_infinite]"
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ duration: 0.35 }}
                    />
                  </g>
                ))}
              </svg>

              {/* 📍 STICKY NAVIGATION MINIMAP 📍 */}
              <div className="hidden lg:block lg:col-span-3 sticky top-24 self-start bg-zinc-50/50 dark:bg-zinc-900/10 backdrop-blur-md p-6 rounded-3xl border border-zinc-200 dark:border-zinc-900/60 transition-colors duration-300">
                <span className="text-[10px] font-mono font-black tracking-widest text-zinc-455 dark:text-zinc-500 uppercase block mb-4">
                  ÍNDICE CRONOLÓGICO
                </span>
                <div className="space-y-6 relative pl-4 border-l border-zinc-200 dark:border-zinc-800">
                  {ERAS.map((era) => {
                    const eraMilestones = swimlaneFilteredMilestones.filter(m => m.year >= era.minYear && m.year <= era.maxYear);
                    if (eraMilestones.length === 0 && searchQuery) return null;

                    return (
                      <div key={era.id} className="group relative">
                        <div className="absolute -left-[21px] top-1.5 w-2.5 h-2.5 rounded-full border border-white dark:border-zinc-950 bg-zinc-350 dark:bg-zinc-700 transition-all group-hover:bg-purple-500 group-hover:scale-125" />
                        
                        <button
                          onClick={() => {
                            const el = document.getElementById(`era-section-${era.id}`);
                            if (el) {
                              el.scrollIntoView({ behavior: "smooth", block: "start" });
                            }
                          }}
                          className="text-left cursor-pointer select-none outline-none block"
                        >
                          <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors block">
                            {era.name}
                          </span>
                          <span className="text-[9px] font-mono text-zinc-455 dark:text-zinc-500 block mt-0.5">
                            {era.period}
                          </span>
                        </button>

                        <div className="mt-2.5 flex flex-wrap gap-1.5 pl-1">
                          {eraMilestones.map(m => {
                            const isSelected = selectedMilestone?.id === m.id;
                            const isHovered = hoveredMilestoneId === m.id;
                            return (
                              <div
                                key={m.id}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  focusMilestone(m.id);
                                }}
                                title={`${m.title} (${m.yearLabel})`}
                                className={`w-2 h-2 rounded-full cursor-pointer transition-all ${
                                  isSelected || isHovered
                                    ? `${
                                        m.trackId === "usos" ? "bg-sky-500 ring-2 ring-sky-500/30 scale-125" :
                                        m.trackId === "etica" ? "bg-purple-500 ring-2 ring-purple-500/30 scale-125" :
                                        m.trackId === "regulaciones" ? "bg-emerald-500 ring-2 ring-emerald-500/30 scale-125" :
                                        "bg-amber-500 ring-2 ring-amber-500/30 scale-125"
                                      }`
                                    : "bg-zinc-250 dark:bg-zinc-800 hover:scale-110 hover:bg-purple-500"
                                }`}
                              />
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Timeline Stream (Desktop col-span-9, full height continuous rail) */}
              <div className="lg:col-span-9 space-y-12 relative z-10">
                
                {swimlaneFilteredMilestones.length === 0 ? (
                  <div className="py-24 text-center space-y-3">
                    <Clock className="w-12 h-12 stroke-1 text-zinc-400 dark:text-zinc-700 mx-auto animate-pulse" />
                    <div className="space-y-1">
                      <h4 className="text-sm font-semibold text-zinc-900 dark:text-white">Sin hitos coincidentes</h4>
                      <p className="text-xs text-zinc-505">Intenta buscar con otros términos o cambia la perspectiva de filtrado.</p>
                    </div>
                  </div>
                ) : (
                  ERAS.map((era) => {
                    const eraMilestones = swimlaneFilteredMilestones.filter(m => m.year >= era.minYear && m.year <= era.maxYear);
                    if (eraMilestones.length === 0) return null;

                    return (
                      <React.Fragment key={era.id}>
                        
                        {/* 🌟 Era Separator Header Row 🌟 */}
                        <div 
                          id={`era-section-${era.id}`}
                          className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch relative"
                        >
                          <div className="hidden lg:block col-span-3" />
                          <div className="hidden lg:flex col-span-1 justify-center relative">
                            <div className="absolute top-0 bottom-0 w-0.5 bg-zinc-200 dark:bg-zinc-800 z-0" />
                          </div>
                          <div className="col-span-1 lg:col-span-8 py-3 border-b border-zinc-250/60 dark:border-zinc-900/60 transition-colors">
                            <div className="flex items-center gap-4">
                              <div className="w-3 h-3 rounded-full bg-purple-500/70 animate-pulse shadow-[0_0_8px_rgba(168,85,247,0.4)]" />
                              <h3 className="text-sm font-black text-zinc-800 dark:text-zinc-100 tracking-wider font-heading uppercase">
                                {era.name}
                              </h3>
                              <span className="text-[10px] font-mono text-zinc-400 dark:text-zinc-650 bg-zinc-100 dark:bg-zinc-950 p-1.5 px-2.5 rounded-lg border border-zinc-250/40 dark:border-zinc-900/40 ml-auto">
                                {era.period}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* 🌟 Milestones Flow in this Era 🌟 */}
                        {eraMilestones.map((milestone) => {
                          const meta = TRACK_META[milestone.trackId];
                          const isSelected = selectedMilestone?.id === milestone.id;
                          const isHovered = hoveredMilestoneId === milestone.id;
                          const isLinked = svgPaths.some(p => p.toId === milestone.id || p.fromId === milestone.id);
                          const isExpanded = !!expandedMilestones[milestone.id];

                          return (
                            <div 
                              key={milestone.id}
                              id={`milestone-row-${milestone.id}`}
                              className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch relative"
                              onMouseEnter={() => {
                                setHoveredMilestoneId(milestone.id);
                              }}
                            >
                              
                              {/* Left Column: Date & Perspective (Desktop only) */}
                              <div className="hidden lg:flex col-span-3 flex-col items-end pr-8 justify-start pt-5 relative select-none">
                                <span className={`text-xs font-mono font-black tracking-tighter transition-colors select-none ${
                                  isSelected || isHovered ? meta.textClass : "text-zinc-400 dark:text-zinc-655"
                                }`}>
                                  {milestone.yearLabel}
                                </span>
                                <span className="text-[9px] font-mono font-semibold text-zinc-455 dark:text-zinc-500 uppercase tracking-widest mt-1">
                                  {meta.label.split(" ")[0]}
                                </span>
                              </div>

                              {/* Center Column: Spine segment and Node dot (Desktop only) */}
                              <div className="hidden lg:flex col-span-1 justify-center relative">
                                <div className="absolute top-0 bottom-0 w-0.5 bg-zinc-200 dark:bg-zinc-800 z-0" />
                                <div
                                  id={`milestone-dot-${milestone.id}`}
                                  onClick={() => focusMilestone(milestone.id)}
                                  className={`w-6 h-6 rounded-full border-4 border-zinc-50 dark:border-zinc-955 transition-all duration-500 flex items-center justify-center relative z-10 cursor-pointer mt-4 ${
                                    isSelected || isHovered ? "scale-125 shadow-xl" : "scale-100 hover:scale-110"
                                  } ${
                                    milestone.trackId === "usos" 
                                      ? "bg-sky-500 shadow-[0_0_12px_rgba(14,165,233,0.6)]" 
                                      : milestone.trackId === "etica" 
                                      ? "bg-purple-500 shadow-[0_0_12px_rgba(168,85,247,0.6)]" 
                                      : milestone.trackId === "regulaciones" 
                                      ? "bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.6)]" 
                                      : "bg-amber-500 shadow-[0_0_12px_rgba(245,158,11,0.6)]"
                                  }`}
                                >
                                  <meta.icon className="w-2.5 h-2.5 text-white" />
                                </div>
                              </div>

                              {/* Right Column: Spacious detailed card (responsive border on mobile) */}
                              <div className="col-span-1 lg:col-span-8 relative pl-6 lg:pl-0 border-l border-zinc-200 dark:border-zinc-850 lg:border-l-0 ml-4 lg:ml-0">
                                
                                {/* Mobile-only dot on left border */}
                                <div className={`lg:hidden absolute -left-[5px] top-6.5 w-2.5 h-2.5 rounded-full border border-white dark:border-zinc-950 transition-all ${
                                  isSelected || isHovered
                                    ? `${
                                        milestone.trackId === "usos" ? "bg-sky-500 shadow-[0_0_8px_rgba(14,165,233,0.5)] scale-125" :
                                        milestone.trackId === "etica" ? "bg-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.5)] scale-125" :
                                        milestone.trackId === "regulaciones" ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)] scale-125" :
                                        "bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)] scale-125"
                                      }`
                                    : "bg-zinc-300 dark:bg-zinc-750"
                                }`} />

                                {/* Card element */}
                                <div
                                  id={`milestone-card-${milestone.id}`}
                                  onClick={() => {
                                    setSelectedMilestone(milestone);
                                    setHoveredMilestoneId(milestone.id);
                                  }}
                                  className={`p-5 rounded-2xl transition-all duration-300 cursor-pointer flex flex-col justify-between space-y-4 relative group select-none ${
                                    isSelected || isHovered
                                      ? "bg-white dark:bg-zinc-900 border-zinc-300 dark:border-zinc-800 shadow-xl scale-[1.005]"
                                      : isLinked
                                      ? "bg-white/95 dark:bg-zinc-900/95 border-purple-400/50 dark:border-purple-900/40 shadow-sm scale-[0.99]"
                                      : "bg-white/40 dark:bg-zinc-900/20 hover:bg-white/80 dark:hover:bg-zinc-900/50 border-zinc-200 dark:border-zinc-900/50 hover:border-zinc-300 dark:hover:border-zinc-800"
                                  } border ${meta.glowClass}`}
                                >
                                  {/* Highlight top border gradient matching track */}
                                  <div className={`absolute top-0 left-0 right-0 h-1.5 rounded-t-2xl bg-gradient-to-r ${
                                    milestone.trackId === "usos" ? "from-sky-400 to-sky-600" :
                                    milestone.trackId === "etica" ? "from-purple-400 to-violet-650" :
                                    milestone.trackId === "regulaciones" ? "from-emerald-400 to-emerald-600" :
                                    "from-amber-400 to-amber-600"
                                  }`} />

                                  <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                      <span className={`text-[10px] font-black font-mono tracking-widest uppercase flex items-center gap-1.5 ${meta.textClass}`}>
                                        <meta.icon className="w-3.5 h-3.5" />
                                        {meta.label}
                                      </span>
                                      <div className="flex items-center gap-2">
                                        <span className="text-[10px] font-bold text-zinc-500 dark:text-zinc-400 font-mono bg-zinc-150/40 dark:bg-zinc-950/40 p-1 px-2.5 rounded-lg border border-zinc-200/50 dark:border-zinc-850">
                                          {milestone.yearLabel}
                                        </span>
                                        {isLinked && (
                                          <span className="p-1 px-1.5 rounded bg-purple-500/10 border border-purple-500/20 text-[8px] font-mono text-purple-600 dark:text-purple-400 font-bold uppercase animate-pulse">
                                            VINCULADO
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                    <h4 className="text-sm sm:text-base font-black tracking-tight text-zinc-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors leading-snug font-heading">
                                      {milestone.title}
                                    </h4>
                                  </div>

                                  <p className="text-xs font-light text-zinc-550 dark:text-zinc-400 leading-relaxed">
                                    {milestone.shortDesc}
                                  </p>

                                  {/* Expandable deconstruction block */}
                                  {isExpanded && (
                                    <motion.div 
                                      initial={{ opacity: 0, height: 0 }}
                                      animate={{ opacity: 1, height: "auto" }}
                                      exit={{ opacity: 0, height: 0 }}
                                      className="space-y-4 pt-4 border-t border-zinc-100 dark:border-zinc-900 text-xs leading-relaxed select-text font-sans"
                                    >
                                      <div className="text-zinc-655 dark:text-zinc-350 font-light leading-relaxed whitespace-pre-line bg-zinc-50/50 dark:bg-zinc-950/20 p-3.5 rounded-xl border border-zinc-200/30 dark:border-zinc-900/30">
                                        <TextRenderer text={milestone.longDesc} references={milestone.references} />
                                      </div>

                                      <div className="space-y-2">
                                        <span className="text-[9.5px] font-bold tracking-wider text-zinc-455 dark:text-zinc-300 uppercase block font-mono">
                                          EVIDENCIAS Y HECHOS DECONSTRUIDOS:
                                        </span>
                                        <ul className="space-y-2.5 list-none pl-0">
                                          {milestone.scientificFacts.map((fact, index) => (
                                            <li key={index} className="flex gap-2.5 p-3 rounded-xl border border-zinc-200/60 dark:border-zinc-800/40 bg-white/30 dark:bg-zinc-955/10 font-light text-zinc-600 dark:text-zinc-400">
                                              <span className="text-purple-500 font-mono font-bold select-none">[{index + 1}]</span>
                                              <span><TextRenderer text={fact} references={milestone.references} /></span>
                                            </li>
                                          ))}
                                        </ul>
                                      </div>

                                      {/* Causal paths links */}
                                      {(() => {
                                        const { causes, effects } = getCausality(milestone.id);
                                        if (causes.length === 0 && effects.length === 0) return null;
                                        return (
                                          <div className="space-y-2 pt-3 border-t border-zinc-100/50 dark:border-zinc-900/50">
                                            <span className="text-[9px] font-bold tracking-wider text-zinc-400 uppercase block font-mono">
                                              RELACIONES DE CAUSALIDAD HISTÓRICA:
                                            </span>
                                            {causes.map(c => (
                                              <div 
                                                key={c.id} 
                                                onClick={(e) => { e.stopPropagation(); focusMilestone(c.id); }}
                                                className="flex items-center justify-between p-2.5 rounded-xl bg-amber-500/5 hover:bg-amber-500/10 border border-amber-500/10 text-[10px] text-amber-700 dark:text-amber-300 group/link transition-all font-mono"
                                              >
                                                <span className="flex items-center gap-1.5">
                                                  <ArrowLeft className="w-3.5 h-3.5 group-hover/link:-translate-x-0.5 transition-transform" />
                                                  Causa: {c.yearLabel}
                                                </span>
                                                <span className="font-bold truncate max-w-[200px]">{c.title}</span>
                                              </div>
                                            ))}
                                            {effects.map(ef => (
                                              <div 
                                                key={ef.id} 
                                                onClick={(e) => { e.stopPropagation(); focusMilestone(ef.id); }}
                                                className="flex items-center justify-between p-2.5 rounded-xl bg-emerald-500/5 hover:bg-emerald-500/10 border border-emerald-500/10 text-[10px] text-emerald-700 dark:text-emerald-355 group/link transition-all font-mono"
                                              >
                                                <span className="flex items-center gap-1.5">
                                                  Efecto: {ef.yearLabel}
                                                  <ArrowRight className="w-3.5 h-3.5 group-hover/link:translate-x-0.5 transition-transform" />
                                                </span>
                                                <span className="font-bold truncate max-w-[200px]">{ef.title}</span>
                                              </div>
                                            ))}
                                          </div>
                                        );
                                      })()}

                                      {/* APA citation references */}
                                      {milestone.references && milestone.references.length > 0 && (
                                        <div className="space-y-2 pt-3 border-t border-zinc-100/50 dark:border-zinc-900/50">
                                          <div className="flex items-center gap-1.5 text-[9px] font-bold tracking-wider text-zinc-400 uppercase font-mono">
                                            <BookOpen className="w-3.5 h-3.5 text-zinc-400" />
                                            <span>BIBLIOGRAFÍA APA Y REFERENCIAS</span>
                                          </div>
                                          <div className="space-y-1.5 bg-zinc-50 dark:bg-zinc-955 p-3 rounded-xl border border-zinc-200/50 dark:border-zinc-900/50">
                                            {milestone.references.map((ref) => (
                                              <div key={ref.id} className="text-[10.5px] text-zinc-505 dark:text-zinc-550 leading-normal flex gap-2 items-start">
                                                <span className="text-purple-500 font-bold font-mono">[{ref.id}]</span>
                                                <div className="flex-1 leading-tight select-text">
                                                  {ref.citation}
                                                  {ref.url && (
                                                    <a 
                                                      href={ref.url} 
                                                      target="_blank" 
                                                      rel="noopener noreferrer" 
                                                      className="inline-flex items-center gap-0.5 text-purple-600 dark:text-purple-400 hover:underline ml-1.5 font-bold font-mono text-[9.5px]"
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

                                      {/* Concept explorer redirects */}
                                      {milestone.relatedNodeId && onRedirectToConcept && (
                                        <div className="pt-3 border-t border-zinc-100/50 dark:border-zinc-900/50">
                                          <button
                                            onClick={(e) => { e.stopPropagation(); onRedirectToConcept(milestone.relatedNodeId!); }}
                                            className="w-full flex items-center justify-between text-xs p-3 rounded-xl bg-zinc-105 hover:bg-zinc-200 dark:bg-zinc-955 dark:hover:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-400 font-bold transition-all"
                                          >
                                            <span>Explorar Concepto Sintiens Asociado</span>
                                            <ArrowRight className="w-3.5 h-3.5 text-zinc-450" />
                                          </button>
                                        </div>
                                      )}

                                    </motion.div>
                                  )}

                                  {/* Deconstruction toggle */}
                                  <div 
                                    onClick={(e) => { e.stopPropagation(); toggleExpand(milestone.id); }}
                                    className="flex items-center justify-between pt-3 border-t border-zinc-100 dark:border-zinc-900 text-[10.5px] font-mono text-zinc-400 dark:text-zinc-500 hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
                                  >
                                    <span>
                                      {isExpanded ? "Ocultar deconstrucción" : "Deconstruir evidencias"}
                                    </span>
                                    <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-300 ${isExpanded ? "rotate-180" : ""}`} />
                                  </div>

                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </React.Fragment>
                    );
                  })
                )}

              </div>

            </div>
          </div>
        );
      })()}

      {/* ========================================== */}
      {/* 2. DETAILED EXPLORER LAYOUT (Original View) */}
      {/* ========================================== */}
      {layoutView === "detallado" && (
        <div className="space-y-6 w-full animate-fade-in">
          
          {/* Timeline filter navigation bar */}
          {!isCompareMode && (
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
          )}

          {/* Original Split detailed view layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch w-full min-h-[620px] border border-zinc-200 dark:border-zinc-850 rounded-3xl bg-white/40 dark:bg-zinc-900/10 backdrop-blur-md overflow-hidden transition-all duration-300">
            
            {/* Timeline scroll vertical feed */}
            <div className="lg:col-span-7 p-6 bg-zinc-50/50 dark:bg-zinc-950/30 relative min-h-[480px] lg:min-h-[580px] transition-colors duration-300 flex flex-col justify-between space-y-6">
              <div className="space-y-4 flex-1">
                <div className="flex-1 space-y-1">
                  <h3 className="text-sm font-extrabold text-zinc-900 dark:text-white tracking-tight uppercase font-mono">
                    {isCompareMode ? "🔍 SELECCIONA DOS HITOS PARA COMPARAR" : activeGroup.title}
                  </h3>
                  <p className="text-[11px] leading-relaxed text-zinc-550 dark:text-zinc-500 font-light select-text">
                    {isCompareMode 
                      ? "Haz clic en dos hitos cualesquiera de la lista (incluso cambiando de pestaña) para proyectar su inercia temporal." 
                      : activeGroup.description
                    }
                  </p>
                </div>

                {isCompareMode && (
                  <div className="grid grid-cols-2 gap-4 p-3 bg-zinc-150/40 dark:bg-zinc-950/40 rounded-2xl border border-zinc-200 dark:border-zinc-850 animate-pulse">
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

                <div className="relative pl-6 lg:pl-8 border-l border-zinc-300 dark:border-zinc-850 space-y-6 max-h-[440px] lg:max-h-[460px] overflow-y-auto pr-1.5 custom-scrollbar py-2">
                  {filteredMilestones.length === 0 ? (
                    <div className="py-16 text-center space-y-3 -ml-6 lg:-ml-8">
                      <Clock className="w-10 h-10 stroke-1 text-zinc-400 dark:text-zinc-700 mx-auto animate-pulse" />
                      <div className="space-y-1">
                        <h4 className="text-sm font-semibold text-zinc-900 dark:text-white">Sin correspondencias</h4>
                        <p className="text-xs text-zinc-505">Ningún hito coincide con el término de búsqueda.</p>
                      </div>
                    </div>
                  ) : (
                    filteredMilestones.map((m) => {
                      const isSelected = selectedMilestone?.id === m.id;
                      const isComparingA = compareA?.id === m.id;
                      const isComparingB = compareB?.id === m.id;
                      
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
                        borderClass = activeTimelineId === "usos" ? "border-sky-500 ring-1 ring-sky-500/25" :
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
                            (isSelected || isComparingA || isComparingB) ? "shadow-md scale-[1.01]" : "hover:-translate-y-0.5"
                          }`}
                        >
                          <div className="absolute -left-[31px] lg:-left-[39px] top-[26px] z-10 flex h-4 w-4 relative items-center justify-center">
                            <span className={`absolute inline-flex rounded-full h-2.5 w-2.5 transition-transform group-hover:scale-125 ${
                              (isSelected || isComparingA || isComparingB) ? colors.glow : "bg-zinc-300 dark:bg-zinc-700"
                            }`} />
                            {(isSelected || isComparingA || isComparingB) && (
                              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-40 ${colors.glow}`} />
                            )}
                          </div>

                          <div className="flex items-center justify-between gap-3 mb-2">
                            <span className={`text-[9px] font-mono tracking-wider px-2 py-0.5 rounded-md font-bold ${
                              isComparingA ? "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/30" :
                              isComparingB ? "bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/30" :
                              colors.badge
                            }`}>
                              {m.yearLabel}
                            </span>
                            {isCompareMode && (
                              <span className="text-[8px] font-mono font-bold uppercase tracking-wider text-zinc-450">
                                {isComparingA && <span className="text-cyan-500">Seleccionado A</span>}
                                {isComparingB && <span className="text-purple-500">Seleccionado B</span>}
                                {!isComparingA && !isComparingB && <span>Comparar +</span>}
                              </span>
                            )}
                          </div>

                          <h4 className="text-xs sm:text-sm font-extrabold text-zinc-900 dark:text-white tracking-tight leading-snug group-hover:text-black dark:group-hover:text-white transition-colors mb-1 font-heading">
                            {m.title}
                          </h4>

                          <p className="text-[11px] leading-relaxed text-zinc-550 dark:text-zinc-400 font-light line-clamp-2">
                            {m.shortDesc}
                          </p>

                          <div className="mt-3 pt-3 border-t border-zinc-200/50 dark:border-zinc-800/40 flex justify-between items-center text-[9px] font-mono text-zinc-450">
                            <span>Evidencias: {m.scientificFacts.length}</span>
                            <span className={`font-bold ${
                              isComparingA ? "text-cyan-400 hover:underline" :
                              isComparingB ? "text-purple-400 hover:underline" :
                              "text-zinc-650 dark:text-zinc-350 hover:underline"
                            }`}>
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

            {/* Split detailed sidepanel view */}
            <div className="lg:col-span-5 border-t lg:border-t-0 lg:border-l border-zinc-200 dark:border-zinc-850 p-6 lg:p-8 flex flex-col justify-between bg-zinc-50/20 dark:bg-zinc-900/25 transition-colors duration-300 sticky top-24 self-start max-h-[85vh] overflow-y-auto custom-scrollbar">
              <AnimatePresence mode="wait">
                
                {isCompareMode ? (
                  <motion.div
                    key="compare-dash"
                    initial={{ opacity: 0, x: 15 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -15 }}
                    className="space-y-6 h-full flex flex-col justify-between"
                  >
                    <div className="space-y-4">
                      <div className="flex items-center gap-1.5">
                        <span className="p-1 rounded bg-cyan-500/10 border border-cyan-500/20 text-[9px] font-mono text-cyan-600 dark:text-cyan-400 font-bold">ANÁLISIS</span>
                        <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-400">DESFASE ÉTICO-INDUSTRIAL</h4>
                      </div>

                      <p className="text-xs text-zinc-500 font-light leading-relaxed">
                        Proyecta la inercia temporal entre las etapas de opresión fáctica de los animales y el desarrollo moral/científico de la sintiencia.
                      </p>

                      {compareA && compareB ? (
                        <div className="space-y-6 pt-2">
                          {getComparisonYearScale(compareA, compareB)}

                          <div className="bg-white dark:bg-zinc-950/60 p-4.5 rounded-2xl border border-zinc-200 dark:border-zinc-850 space-y-3 shadow-xs">
                            <div className="flex items-start gap-1.5">
                              <Sparkles className="w-4 h-4 text-amber-500 mt-0.5 shrink-0 animate-pulse" />
                              <h5 className="text-xs font-bold text-zinc-900 dark:text-white leading-snug font-heading">
                                {getLagAnalysis(compareA, compareB).title}
                              </h5>
                            </div>
                            <p className="text-xs leading-relaxed text-zinc-650 dark:text-zinc-400 font-light select-text font-sans">
                              {getLagAnalysis(compareA, compareB).desc}
                            </p>
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center text-center py-20 text-zinc-505">
                          <GitCompare className="w-12 h-12 stroke-1 text-zinc-300 dark:text-zinc-700 mb-3 animate-pulse" />
                          <p className="text-xs font-light max-w-xs leading-relaxed">
                            Haz clic en dos hitos de la lista de la izquierda para calibrar el retardo histórico y el desfase de empatía.
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
                        className="w-full mt-6 py-2 px-4 bg-zinc-200/50 hover:bg-zinc-200 dark:bg-zinc-900 dark:hover:bg-zinc-800 text-[10px] font-mono tracking-wider font-bold uppercase text-zinc-500 hover:text-zinc-850 transition-all cursor-pointer"
                      >
                        Resetear Comparador
                      </button>
                    )}
                  </motion.div>
                ) : (
                  <motion.div
                    key={selectedMilestone ? selectedMilestone.id : "empty-det"}
                    initial={{ opacity: 0, x: 15 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -15 }}
                    className="h-full flex flex-col justify-between"
                  >
                    {selectedMilestone ? (
                      renderDetailsContent(selectedMilestone)
                    ) : (
                      <div className="flex flex-col items-center justify-center text-center h-full text-zinc-505 py-24">
                        <Clock className="w-12 h-12 stroke-1 text-zinc-300 dark:text-zinc-700 mb-2 animate-pulse" />
                        <p className="text-xs font-light max-w-[220px]">
                          Selecciona un hito de la lista para deconstruir sus evidencias e implicaciones morales.
                        </p>
                      </div>
                    )}
                  </motion.div>
                )}

              </AnimatePresence>
            </div>

          </div>

        </div>
      )}

      {/* Mobile Drawer Detail Overlay (detallado mode) */}
      <AnimatePresence>
        {isMobileDetailOpen && selectedMilestone && layoutView === "detallado" && !isCompareMode && (
          <div className="lg:hidden fixed inset-0 z-50 flex items-end justify-center pointer-events-auto">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileDetailOpen(false)}
              className="absolute inset-0 bg-black/60 dark:bg-black/85 backdrop-blur-xs cursor-pointer"
            />
            <motion.div
              initial={{ y: "100%", borderTopLeftRadius: 30, borderTopRightRadius: 30 }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 220 }}
              className="relative w-full max-h-[85vh] overflow-y-auto bg-zinc-50 dark:bg-zinc-950 border-t border-zinc-200 dark:border-zinc-800 p-6 flex flex-col z-10 shadow-2xl rounded-t-3xl custom-scrollbar"
            >
              <div className="w-12 h-1 rounded-full bg-zinc-300 dark:bg-zinc-800 mx-auto mb-5 shrink-0" />
              <button
                onClick={() => setIsMobileDetailOpen(false)}
                className="absolute top-5 right-5 p-2 rounded-full bg-zinc-200/50 dark:bg-zinc-900/60 border border-zinc-300/40 dark:border-zinc-800 hover:bg-zinc-300/70 dark:hover:bg-zinc-800/80 text-zinc-500 hover:text-zinc-95 transition-all cursor-pointer"
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


