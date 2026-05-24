import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "motion/react";
import { X, ArrowRight, HelpCircle, Activity, Globe, Scale, BookOpen } from "lucide-react";
import { GlossaryItem } from "../data/glossaryData";
import { CORE_NODES, DILEMMAS_DATA } from "../types";

interface GlossaryLinkProps {
  item: GlossaryItem;
  children: React.ReactNode;
  key?: any;
}

export default function GlossaryLink({ item, children }: GlossaryLinkProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const containerRef = useRef<HTMLSpanElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Check if screen is mobile size
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Close desktop popover if clicked outside
  useEffect(() => {
    if (isMobile || !isOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen, isMobile]);

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const handleLinkClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setIsOpen(!isOpen);
  };

  const handleNavigate = (targetId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setIsOpen(false);
    
    // Dispatch global navigation event
    const navEvent = new CustomEvent("navigate-to-item", { detail: targetId });
    window.dispatchEvent(navEvent);
  };

  // Helper to find titles of related items
  const getRelatedItemTitle = (id: string) => {
    const node = CORE_NODES.find((n) => n.id === id);
    if (node) return { title: node.title, category: node.category, type: "node" };

    const dilemma = DILEMMAS_DATA.find((d) => d.id === id);
    if (dilemma) return { title: dilemma.title, category: dilemma.category, type: "dilemma" };

    return { title: id, category: "other", type: "other" };
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "sintiencia":
        return <Activity className="w-3 h-3 text-red-500" />;
      case "ecologia":
        return <Globe className="w-3 h-3 text-emerald-500" />;
      case "historia":
        return <BookOpen className="w-3 h-3 text-blue-500" />;
      case "etica":
        return <Scale className="w-3 h-3 text-purple-500" />;
      default:
        return <HelpCircle className="w-3 h-3 text-zinc-400" />;
    }
  };

  // Combined list of relations
  const allRelations = [
    ...(item.relatedNodes || []),
    ...(item.relatedDilemmas || [])
  ];

  // RENDER DYNAMIC CARD CONTENT
  const renderCardContent = () => (
    <div className="space-y-4">
      {/* Title */}
      <div className="flex items-center justify-between border-b border-zinc-150 dark:border-zinc-800 pb-2">
        <h4 className="text-sm font-black tracking-tight text-zinc-900 dark:text-white flex items-center gap-1.5 font-sans">
          <span className="w-2 h-2 rounded-full bg-purple-500 animate-pulse" />
          {item.term}
        </h4>
        <span className="text-[9px] font-mono uppercase bg-purple-500/10 text-purple-600 dark:text-purple-400 px-2 py-0.5 rounded font-bold">
          Glosario Sintiens
        </span>
      </div>

      {/* Definition */}
      <p className="text-xs text-zinc-600 dark:text-zinc-400 font-light leading-relaxed select-text font-sans">
        {item.definition}
      </p>

      {/* Related items */}
      {allRelations.length > 0 && (
        <div className="space-y-2 pt-1">
          <span className="text-[9px] font-mono tracking-wider uppercase text-zinc-400 dark:text-zinc-550 block font-bold">
            Ver más sobre esto en:
          </span>
          <div className="flex flex-col gap-1.5">
            {allRelations.map((relId) => {
              const rel = getRelatedItemTitle(relId);
              return (
                <button
                  key={relId}
                  onClick={(e) => handleNavigate(relId, e)}
                  className="w-full text-left text-[11px] px-3 py-2 rounded-xl bg-zinc-100/50 hover:bg-purple-500/5 dark:bg-zinc-950/40 dark:hover:bg-purple-450/10 border border-zinc-200/60 dark:border-zinc-900 hover:border-purple-300 dark:hover:border-purple-900/60 text-zinc-650 dark:text-zinc-400 hover:text-purple-700 dark:hover:text-purple-300 transition-all flex items-center justify-between group cursor-pointer"
                >
                  <div className="flex items-center gap-2 truncate">
                    {getCategoryIcon(rel.category)}
                    <span className="truncate font-medium">{rel.title}</span>
                  </div>
                  <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-all transform group-hover:translate-x-0.5 text-purple-500 dark:text-purple-400 shrink-0" />
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );

  return (
    <span ref={containerRef} className="relative inline-block">
      {/* Clickable Word Link */}
      <button
        onClick={handleLinkClick}
        className="font-semibold text-zinc-800 dark:text-zinc-200 hover:text-purple-600 dark:hover:text-purple-400 border-b-2 border-dotted border-purple-500/50 hover:border-solid hover:border-purple-500/80 cursor-pointer transition-all duration-200 select-text outline-none focus:ring-1 focus:ring-purple-400/30 rounded-xs inline"
      >
        {children}
      </button>

      {/* FLOATING CARD FOR DESKTOP */}
      <AnimatePresence>
        {isOpen && !isMobile && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.96 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className="absolute left-1/2 -translate-x-1/2 bottom-full mb-3 w-72 p-4 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-md text-zinc-800 dark:text-zinc-200 rounded-2xl shadow-xl border border-zinc-200/80 dark:border-zinc-850/80 z-50 text-left pointer-events-auto cursor-default normal-case tracking-normal whitespace-normal block"
            onClick={(e) => e.stopPropagation()}
          >
            {renderCardContent()}
            {/* Popover Arrow */}
            <span className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-white dark:border-t-zinc-950" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* BOTTOM SHEET FOR MOBILE */}
      {isMobile &&
        isOpen &&
        createPortal(
          <div className="fixed inset-0 z-[100] flex items-end justify-center select-none pointer-events-auto">
            {/* Soft dark glass backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="absolute inset-0 bg-black/50 dark:bg-black/75 backdrop-blur-xs cursor-pointer"
            />
            {/* Bottom Sheet Card */}
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 26, stiffness: 240 }}
              className="relative w-full max-h-[75vh] overflow-y-auto bg-white dark:bg-zinc-950 border-t border-zinc-200 dark:border-zinc-850 p-6 rounded-t-3xl flex flex-col z-10 shadow-2xl text-left pointer-events-auto select-none"
            >
              {/* Drag indicator */}
              <div className="w-12 h-1 rounded-full bg-zinc-350 dark:bg-zinc-800 mx-auto mb-4 shrink-0" />

              {/* Close Button */}
              <button
                onClick={() => setIsOpen(false)}
                className="absolute top-5 right-5 p-2 rounded-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-all cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="overflow-y-auto pb-4 select-text">
                {renderCardContent()}
              </div>
            </motion.div>
          </div>,
          document.body
        )}
    </span>
  );
}


