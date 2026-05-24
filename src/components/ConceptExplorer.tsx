import React, { useState, useEffect, useRef } from "react";
import { CORE_NODES, NodeDetail, ReferenceDetail } from "../types";
import NetworkGraph from "./NetworkGraph";
import { 
  Search, 
  Activity, 
  Globe, 
  Scale, 
  Info, 
  HelpCircle, 
  BookOpen, 
  ExternalLink, 
  ChevronUp, 
  ChevronDown, 
  X,
  FileText,
  Network
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import TextRenderer from "./TextRenderer";

interface ConceptExplorerProps {
  initialNodeId?: string | null;
  onClearInitialNodeId?: () => void;
}

export default function ConceptExplorer({ initialNodeId, onClearInitialNodeId }: ConceptExplorerProps) {
  const [viewMode, setViewMode] = useState<"cards" | "graph">("cards");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedNode, setSelectedNode] = useState<NodeDetail | null>(CORE_NODES[0]);
  const [isBibliographyOpen, setIsBibliographyOpen] = useState(false);
  const [isMobileDetailOpen, setIsMobileDetailOpen] = useState(false);

  useEffect(() => {
    if (initialNodeId) {
      const node = CORE_NODES.find((n) => n.id === initialNodeId);
      if (node) {
        setSelectedNode(node);
        setSelectedCategory("all"); // ensure it is visible regardless of active category filter
        if (window.innerWidth < 1024) {
          setIsMobileDetailOpen(true);
        }
      }
      if (onClearInitialNodeId) {
        onClearInitialNodeId();
      }
    }
  }, [initialNodeId, onClearInitialNodeId]);

  // Collapse bibliography when selected node changes
  useEffect(() => {
    setIsBibliographyOpen(false);
  }, [selectedNode]);

  const handleSelectNode = (node: NodeDetail) => {
    setSelectedNode(node);
    // On mobile screens, open the dedicated detail modal/drawer
    if (window.innerWidth < 1024) {
      setIsMobileDetailOpen(true);
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "sintiencia":
        return <Activity className="w-5 h-5 text-red-500" />;
      case "ecologia":
        return <Globe className="w-5 h-5 text-emerald-500" />;
      case "historia":
        return <Info className="w-5 h-5 text-blue-500" />;
      case "etica":
        return <Scale className="w-5 h-5 text-purple-500" />;
      default:
        return <HelpCircle className="w-5 h-5 text-zinc-400" />;
    }
  };

  const getCategoryBadgeClass = (category: string) => {
    switch (category) {
      case "sintiencia":
        return "bg-red-500/10 text-red-500 border border-red-500/20 dark:border-red-500/30";
      case "ecologia":
        return "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 dark:border-emerald-500/30";
      case "historia":
        return "bg-blue-500/10 text-blue-500 border border-blue-500/30";
      case "etica":
        return "bg-purple-500/10 text-purple-500 border border-purple-500/30";
      default:
        return "bg-zinc-800 text-zinc-400 border border-zinc-700";
    }
  };

  const filteredNodes = CORE_NODES.filter((node) => {
    const matchesSearch = 
      node.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      node.shortDesc.toLowerCase().includes(searchQuery.toLowerCase()) ||
      node.longDesc.toLowerCase().includes(searchQuery.toLowerCase()) ||
      node.scientificFacts.some(fact => fact.toLowerCase().includes(searchQuery.toLowerCase()));
      
    const matchesCategory = selectedCategory === "all" || node.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const renderDetailsContent = (node: NodeDetail) => {
    return (
      <div className="flex flex-col gap-6 w-full">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className={`text-[10px] tracking-widest font-mono uppercase px-2.5 py-1 rounded-full ${getCategoryBadgeClass(node.category)}`}>
              {node.category === "sintiencia" ? "Sintiencia" :
               node.category === "historia" ? "Historia" :
               node.category === "ecologia" ? "Ecología" : "Ética y Derechos"}
            </span>
            <div className="flex items-center gap-1.5 text-zinc-500 text-xs">
              {getCategoryIcon(node.category)}
              <span className="font-mono text-[10px] capitalize">Pilar Integrado</span>
            </div>
          </div>

          <h2 className="text-xl font-extrabold text-zinc-900 dark:text-white tracking-tight border-b border-zinc-200 dark:border-zinc-800 pb-3 transition-colors">
            {node.title}
          </h2>

          <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 font-light leading-relaxed transition-colors select-text">
            <TextRenderer text={node.longDesc} references={node.references} />
          </p>

          <div className="space-y-3 pt-2">
            <h4 className="text-[10px] font-bold tracking-wider text-zinc-700 dark:text-zinc-300 font-mono flex items-center gap-1.5 transition-colors">
              <span className="h-1.5 w-1.5 rounded-full bg-zinc-800 dark:bg-white animate-pulse" />
              EVIDENCIAS Y HECHOS FÁCTICOS:
            </h4>
            <ul className="space-y-2 text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed font-light select-text">
              {node.scientificFacts.map((fact, i) => (
                <li key={i} className="flex items-start gap-2 bg-white dark:bg-zinc-950/40 p-3 rounded-xl border border-zinc-200/60 dark:border-zinc-800/40 transition-colors">
                  <span className="text-zinc-450 dark:text-zinc-600 font-mono font-semibold mt-0.5 select-none">[{i + 1}]</span>
                  <span><TextRenderer text={fact} references={node.references} /></span>
                </li>
              ))}
            </ul>
          </div>

          {/* Collapsible Bibliography Section */}
          {node.references && node.references.length > 0 && (
            <div className="pt-2">
              <button
                onClick={() => setIsBibliographyOpen(!isBibliographyOpen)}
                className="flex items-center justify-between w-full py-2 px-3 bg-zinc-100/50 dark:bg-zinc-950/30 rounded-xl border border-zinc-200 dark:border-zinc-800/30 text-[10px] font-mono tracking-wider uppercase text-zinc-500 hover:text-zinc-850 dark:hover:text-zinc-350 transition-all cursor-pointer font-bold select-none"
              >
                <span className="flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-zinc-400 dark:text-zinc-500" />
                  BIBLIOGRAFÍA COMPLETA ({node.references.length})
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
                      {node.references.map((ref) => (
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

        <div className="pt-6 border-t border-zinc-200 dark:border-zinc-800/60 transition-colors">
          <span className="text-[9px] font-mono tracking-widest uppercase text-zinc-400 dark:text-zinc-500 block mb-2">
            Conexiones Lógicas en la Red:
          </span>
          <div className="flex flex-wrap gap-2">
            {node.connections.map((connId) => {
              const linked = CORE_NODES.find((n) => n.id === connId);
              if (!linked) return null;
              return (
                <button
                  key={connId}
                  onClick={() => handleSelectNode(linked)}
                  className="text-[11px] px-2.5 py-1.5 rounded-xl bg-white dark:bg-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border border-zinc-200/80 dark:border-zinc-800/85 transition-all flex items-center gap-1.5 hover:border-zinc-300 dark:hover:border-zinc-700 hover:text-zinc-900 dark:hover:text-white shadow-xs dark:shadow-none cursor-pointer"
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${
                    linked.category === 'sintiencia' ? 'bg-red-500' :
                    linked.category === 'ecologia' ? 'bg-emerald-500' :
                    linked.category === 'historia' ? 'bg-blue-500' : 'bg-purple-500'
                  }`} />
                  {linked.title}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 w-full">
      {/* Upper toggle navigation + search bar */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between w-full">
        {/* Modern Segmented Control Toggle for Views */}
        <div className="relative flex bg-zinc-150 dark:bg-zinc-900/80 p-1 rounded-2xl border border-zinc-200 dark:border-zinc-900/60 transition-all select-none shadow-inner shrink-0">
          <button
            onClick={() => setViewMode("cards")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold tracking-tight transition-all duration-300 cursor-pointer ${
              viewMode === "cards"
                ? "bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-sm border border-zinc-200/60 dark:border-transparent scale-102"
                : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Conceptos Clave</span>
          </button>
          <button
            onClick={() => setViewMode("graph")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold tracking-tight transition-all duration-300 cursor-pointer ${
              viewMode === "graph"
                ? "bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-sm border border-zinc-200/60 dark:border-transparent scale-102"
                : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
            }`}
          >
            <Network className="w-3.5 h-3.5" />
            <span>Grafo Interactivo</span>
          </button>
        </div>

        {/* Info label for responsiveness when graph selected */}
        {viewMode === "graph" && (
          <span className="text-[10px] font-mono text-zinc-500 dark:text-zinc-650 bg-zinc-100 dark:bg-zinc-950/40 border border-zinc-200 dark:border-zinc-900 px-3 py-1 rounded-xl block max-w-xs text-center sm:text-right">
            💡 Consejo: Arrastra los nodos o gíralos en pantalla completa.
          </span>
        )}
      </div>

      <AnimatePresence mode="wait">
        {viewMode === "graph" ? (
          <motion.div
            key="graph-view"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25 }}
            className="w-full"
          >
            <NetworkGraph />
          </motion.div>
        ) : (
          <motion.div
            key="cards-view"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25 }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch w-full min-h-[600px] border border-zinc-200 dark:border-zinc-800 rounded-3xl bg-white/40 dark:bg-zinc-900/10 backdrop-blur-md overflow-hidden transition-all duration-300"
          >
            {/* Left Section: Cards and Search (lg:col-span-7) */}
            <div className="lg:col-span-7 p-6 bg-zinc-50/50 dark:bg-zinc-950/40 relative min-h-[460px] lg:min-h-[550px] transition-colors duration-300 flex flex-col justify-between space-y-6">
              
              <div className="flex flex-col gap-5 flex-1 min-h-0">
                {/* Search and Categories row */}
                <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
                  {/* Search Bar */}
                  <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 dark:text-zinc-500" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Buscar concepto o evidencia..."
                      className="w-full bg-white dark:bg-zinc-950/60 border border-zinc-200 dark:border-zinc-800 focus:border-zinc-400 dark:focus:border-zinc-700 rounded-2xl pl-11 pr-4 py-3 text-xs text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500 outline-none focus:ring-1 focus:ring-zinc-300 dark:focus:ring-zinc-700/50 transition-all font-sans"
                    />
                  </div>

                  {/* Filter category badges */}
                  <div className="flex flex-wrap gap-1.5 items-center">
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
                         cat === "ecologia" ? "Ecología" : "Ética"}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Concepts list/grid scroll area */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 flex-1 min-h-0 overflow-y-auto pt-2 pb-4 pr-1.5 custom-scrollbar">
                  {filteredNodes.length === 0 ? (
                    <div className="col-span-full py-16 text-center space-y-3">
                      <HelpCircle className="w-10 h-10 stroke-1 text-zinc-400 dark:text-zinc-700 mx-auto animate-pulse" />
                      <div className="space-y-1">
                        <h4 className="text-sm font-semibold text-zinc-900 dark:text-white">Sin correspondencias</h4>
                        <p className="text-xs text-zinc-500 font-light">Ningún concepto coincide con los términos de búsqueda.</p>
                      </div>
                    </div>
                  ) : (
                    filteredNodes.map((node) => {
                      const isSelected = selectedNode?.id === node.id;
                      let categoryColorClass = "border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700";
                      let bgGlow = "";
                      let dotColor = "bg-zinc-400";

                      if (node.category === "sintiencia") {
                        categoryColorClass = isSelected 
                          ? "border-red-500 ring-1 ring-red-500/30" 
                          : "border-red-500/10 hover:border-red-500/30 dark:border-red-500/20";
                        bgGlow = isSelected ? "bg-red-500/5" : "hover:bg-red-500/2";
                        dotColor = "bg-red-500";
                      } else if (node.category === "ecologia") {
                        categoryColorClass = isSelected 
                          ? "border-emerald-500 ring-1 ring-emerald-500/30" 
                          : "border-emerald-500/10 hover:border-emerald-500/30 dark:border-emerald-500/20";
                        bgGlow = isSelected ? "bg-emerald-500/5" : "hover:bg-emerald-500/2";
                        dotColor = "bg-emerald-500";
                      } else if (node.category === "historia") {
                        categoryColorClass = isSelected 
                          ? "border-blue-500 ring-1 ring-blue-500/30" 
                          : "border-blue-500/10 hover:border-blue-500/30 dark:border-blue-500/20";
                        bgGlow = isSelected ? "bg-blue-500/5" : "hover:bg-blue-500/2";
                        dotColor = "bg-blue-500";
                      } else if (node.category === "etica") {
                        categoryColorClass = isSelected 
                          ? "border-purple-500 ring-1 ring-purple-500/30" 
                          : "border-purple-500/10 hover:border-purple-500/30 dark:border-purple-500/20";
                        bgGlow = isSelected ? "bg-purple-500/5" : "hover:bg-purple-500/2";
                        dotColor = "bg-purple-500";
                      }

                      return (
                        <motion.div
                          key={node.id}
                          layout
                          onClick={() => handleSelectNode(node)}
                          className={`group p-5 rounded-2xl border text-left cursor-pointer transition-all duration-300 relative overflow-hidden bg-white/50 dark:bg-zinc-950/20 ${categoryColorClass} ${bgGlow} ${
                            isSelected ? "shadow-md -translate-y-0.5" : "hover:-translate-y-0.5"
                          }`}
                        >
                          <div className="flex items-center justify-between gap-3 mb-2.5">
                            <span className={`text-[8.5px] font-mono tracking-wider px-2 py-0.5 rounded-md ${getCategoryBadgeClass(node.category)}`}>
                              {node.category === "sintiencia" ? "Sintiencia" :
                               node.category === "historia" ? "Historia" :
                               node.category === "ecologia" ? "Ecología" : "Ética"}
                            </span>
                            <div className="flex h-2.5 w-2.5 shrink-0 relative items-center justify-center">
                              {isSelected && (
                                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${dotColor}`} />
                              )}
                              <span className={`relative inline-flex rounded-full h-1.5 w-1.5 ${dotColor}`} />
                            </div>
                          </div>

                          <h3 className="text-xs sm:text-sm font-bold text-zinc-900 dark:text-white tracking-tight leading-snug transition-colors mb-1.5 group-hover:text-black dark:group-hover:text-white">
                            {node.title}
                          </h3>

                          <p className="text-[11px] leading-relaxed text-zinc-500 dark:text-zinc-400 font-light line-clamp-3">
                            {node.shortDesc}
                          </p>

                          <div className="mt-3.5 pt-3 border-t border-zinc-200/50 dark:border-zinc-800/40 flex justify-between items-center text-[9.5px] font-mono text-zinc-400">
                            <span>Conexiones: {node.connections.length}</span>
                            <span className="text-zinc-650 dark:text-zinc-350 hover:underline font-bold transition-all">
                              Profundizar →
                            </span>
                          </div>
                        </motion.div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>

            {/* Right Section: Stretched Desktop Details Panel (lg:col-span-5) */}
            <div className="hidden lg:block lg:col-span-5 border-t lg:border-t-0 lg:border-l border-zinc-200 dark:border-zinc-800 bg-zinc-50/30 dark:bg-zinc-900/30 transition-colors duration-300 relative">
              <div className="sticky top-24 self-start w-full max-h-[calc(100vh-120px)] overflow-y-auto custom-scrollbar p-6 lg:p-8 flex flex-col gap-6">
                <AnimatePresence mode="wait">
                  {selectedNode ? (
                    <motion.div
                      key={selectedNode.id}
                      initial={{ opacity: 0, x: 15 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -15 }}
                      transition={{ duration: 0.2 }}
                    >
                      {renderDetailsContent(selectedNode)}
                    </motion.div>
                  ) : (
                    <div className="flex flex-col items-center justify-center text-center h-full text-zinc-500 dark:text-zinc-500 py-16">
                      <HelpCircle className="w-12 h-12 stroke-1 text-zinc-400 dark:text-zinc-700 mb-2 animate-pulse" />
                      <p className="text-xs font-light">Selecciona una tarjeta para explorar su sustento científico.</p>
                    </div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile Drawer/Modal Overlay for Details (Screens < 1024px) */}
      <AnimatePresence>
        {isMobileDetailOpen && selectedNode && (
          <div className="lg:hidden fixed inset-0 z-50 flex items-end justify-center select-none pointer-events-auto">
            {/* Dark glass backdrop overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileDetailOpen(false)}
              className="absolute inset-0 bg-black/60 dark:bg-black/80 backdrop-blur-xs cursor-pointer pointer-events-auto"
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
                {renderDetailsContent(selectedNode)}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
