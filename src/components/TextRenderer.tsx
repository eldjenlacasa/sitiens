import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ExternalLink } from "lucide-react";
import { ReferenceDetail } from "../types";
import { GLOSSARY_DATA, GlossaryItem } from "../data/glossaryData";
import GlossaryLink from "./GlossaryLink";

// Unified Reference Tooltip Component
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
      className="relative inline-block select-none"
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

// Utility to escape regex characters
function escapeRegExp(string: string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// Prepare glossary regex compilation outside of rendering loop for optimization
const patternList: { pattern: string; item: GlossaryItem }[] = [];
GLOSSARY_DATA.forEach((item) => {
  item.patterns.forEach((pat) => {
    patternList.push({ pattern: pat, item });
  });
});
// Sort patterns by length descending to match longer multi-word phrases first
patternList.sort((a, b) => b.pattern.length - a.pattern.length);

const escapedPatterns = patternList.map((p) => escapeRegExp(p.pattern)).join("|");
// Spanish-compatible word boundaries with lookbehind and lookahead
const glossaryRegex = new RegExp(
  `(?<=^|[^a-zA-ZáéíóúÁÉÍÓÚñÑ])(${escapedPatterns})(?=$|[^a-zA-ZáéíóúÁÉÍÓÚñÑ])`,
  "gi"
);

interface TextRendererProps {
  text: string;
  references?: ReferenceDetail[];
}

export default function TextRenderer({ text, references }: TextRendererProps) {
  if (!text) return null;

  // STEP 1: Split text by reference tags like [1] or [2, 3]
  const citationParts = text.split(/(\[[0-9,\s]+\])/g);

  if (!citationParts || citationParts.length === 0) return <span>{text}</span>;

  // STEP 2: Parse each segment
  return (
    <>
      {citationParts.map((segment, idx) => {
        // Check if this segment is a citation tag e.g. "[1]" or "[2, 3]"
        const citationMatch = segment.match(/^\[([0-9,\s]+)\]$/);
        if (citationMatch) {
          if (!references || references.length === 0) return <span key={idx}>{segment}</span>;
          const numbers = citationMatch[1].split(",").map((num) => num.trim());
          return (
            <span key={idx} className="inline-flex gap-0.5 select-none">
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

        // STEP 3: If not a citation, parse the segment dynamically for glossary terms
        const glossaryParts = segment.split(glossaryRegex);

        return (
          <React.Fragment key={idx}>
            {glossaryParts.map((subSegment, sIdx) => {
              // Odd indices in the split result are the matched patterns
              // Note: split with capture group returns unmatched, matched, unmatched...
              if (sIdx % 2 !== 0) {
                const matchedText = subSegment;
                const matchItem = patternList.find(
                  (p) =>
                    p.item.patterns.some(
                      (pat) => pat.toLowerCase() === matchedText.toLowerCase()
                    )
                )?.item;

                if (matchItem) {
                  return (
                    <GlossaryLink key={sIdx} item={matchItem}>
                      {matchedText}
                    </GlossaryLink>
                  );
                }
              }

              // Even indices are unmatched plain text
              return <span key={sIdx}>{subSegment}</span>;
            })}
          </React.Fragment>
        );
      })}
    </>
  );
}
