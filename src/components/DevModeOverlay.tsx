import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { 
  Settings, 
  Plus, 
  Trash2, 
  Check, 
  X, 
  Filter, 
  MapPin, 
  AlertCircle, 
  ExternalLink,
  MessageSquare,
  Sparkles,
  ClipboardList,
  Edit2,
  Calendar,
  Layers,
  Heart,
  Minimize2,
  Maximize2,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

// Types matching implementation plan
export interface DevTask {
  id: string;
  title: string;
  description: string;
  tab: string; // "grafo" | "cronologia" | "dialectica" | "calculadora" | "validador" | "general"
  x?: number;  // Percentage relative to main (0 - 100)
  y?: number;  // Percentage relative to main (0 - 100)
  w?: number;  // Width percentage relative to main
  h?: number;  // Height percentage relative to main
  selector?: string; // CSS selector of the anchored DOM element
  rx?: number; // Relative click offset X inside the anchored DOM element (0-100)
  ry?: number; // Relative click offset Y inside the anchored DOM element (0-100)
  rw?: number; // Relative width inside the anchored DOM element (0-100)
  rh?: number; // Relative height inside the anchored DOM element (0-100)
  priority: "low" | "normal" | "medium" | "high";
  status: "todo" | "in-progress" | "done";
  createdAt: string;
  // AI Preview Control Fields (populated by the scheduled AI task and server endpoints)
  aiFeedback?: string;       // User feedback text for AI adjustment requests
  originalBranch?: string;   // The branch the user was on before previewing
  hasStashedChanges?: boolean; // Whether local changes were stashed before preview
}

// Helper to determine if a pixel rectangle (in viewport client coords) is visible inside all scrollable DOM ancestors of an element
const isRectVisibleInScrollAncestors = (
  rect: { left: number; top: number; width: number; height: number },
  el: HTMLElement
): boolean => {
  let current: HTMLElement | null = el.parentElement;
  
  while (current && current !== document.body) {
    const style = window.getComputedStyle(current);
    const overflowY = style.overflowY;
    const overflowX = style.overflowX;
    
    if (
      overflowY === "auto" || overflowY === "scroll" || overflowY === "hidden" ||
      overflowX === "auto" || overflowX === "scroll" || overflowX === "hidden"
    ) {
      const parentRect = current.getBoundingClientRect();
      
      // Check if the pin rect is completely outside the parent rect
      const buffer = 1; // 1px safe margin
      if (
        rect.top + rect.height - buffer < parentRect.top ||
        rect.top + buffer > parentRect.bottom ||
        rect.left + rect.width - buffer < parentRect.left ||
        rect.left + buffer > parentRect.right
      ) {
        return false;
      }
    }
    current = current.parentElement;
  }
  return true;
};

// Helper to generate a unique, highly precise CSS selector for any element
const getUniqueSelector = (el: HTMLElement, root: HTMLElement | null = null): string => {
  if (el.id) return `#${el.id}`;
  if (el === document.body) return "body";
  
  const path: string[] = [];
  let current: HTMLElement | null = el;
  const stopElement = root || document.querySelector("main") || document.body;
  
  while (current && current !== stopElement && current.parentElement) {
    if (current !== el && current.id) {
      path.unshift(`#${current.id}`);
      break;
    }
    
    const parent = current.parentElement;
    const tagName = current.tagName.toLowerCase();
    
    let selector = tagName;
    if (current.className && typeof current.className === "string") {
      // Find first standard alphanumeric class (avoiding responsive Tailwind colon/brackets)
      const firstClass = current.className.split(" ").filter(c => c && !c.includes(":") && !c.includes("[") && !c.includes("/") && c.trim())[0];
      if (firstClass) selector += `.${firstClass}`;
    }
    
    const siblings = Array.from(parent.children).filter(child => child.tagName === current?.tagName);
    if (siblings.length > 1) {
      const index = siblings.indexOf(current) + 1;
      selector += `:nth-of-type(${index})`;
    }
    
    path.unshift(selector);
    current = parent;
  }
  
  if (path[0]?.startsWith("#")) {
    return path.join(" > ");
  }
  
  if (stopElement && stopElement.tagName.toLowerCase() === "main") {
    return "main > " + path.join(" > ");
  }
  
  return path.join(" > ");
};

interface DevModeOverlayProps {
  activeTab: string;
  setActiveTab: (tab: any) => void;
}

export default function DevModeOverlay({ activeTab, setActiveTab }: DevModeOverlayProps) {
  const [mounted, setMounted] = useState<boolean>(false);
  
  useEffect(() => {
    setMounted(true);
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      if (pinningTimeoutRef.current) clearTimeout(pinningTimeoutRef.current);
      if (throttleTimeoutRef.current) clearTimeout(throttleTimeoutRef.current);
    };
  }, []);

  // Master states
  const [isActive, setIsActive] = useState<boolean>(() => {
    return localStorage.getItem("dev-mode-active") === "true";
  });
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(() => {
    return localStorage.getItem("dev-mode-sidebar-open") === "true";
  });
  const [layoutMode, setLayoutMode] = useState<"sidebar" | "floating">(() => {
    return (localStorage.getItem("dev-mode-layout-mode") as "sidebar" | "floating") || "sidebar";
  });
  const [isSidebarMinimized, setIsSidebarMinimized] = useState<boolean>(() => {
    return localStorage.getItem("dev-mode-sidebar-minimized") === "true";
  });
  const [sidebarPos, setSidebarPos] = useState<{ x: number; y: number } | null>(() => {
    const saved = localStorage.getItem("dev-mode-sidebar-pos");
    try {
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const sidebarRef = useRef<HTMLDivElement | null>(null);
  // Track tasks that have been attempted to heal in the current lifecycle to prevent loops
  const healedTasksRef = useRef<Set<string>>(new Set());
  const [isPinningMode, setIsPinningMode] = useState<boolean>(false);
  const [tasks, setTasks] = useState<DevTask[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [highlightedPinId, setHighlightedPinId] = useState<string | null>(null);

  // AI Preview Control States (synced with localStorage to survive branch changes and Vite HMR)
  const [activePreviewTaskId, setActivePreviewTaskId] = useState<string | null>(() => {
    return localStorage.getItem("dev-mode-preview-task-id") || null;
  });
  const [feedbackTaskId, setFeedbackTaskId] = useState<string | null>(null);
  const [previewFeedbackText, setPreviewFeedbackText] = useState<string>("");
  const [isSubmittingPreviewAction, setIsSubmittingPreviewAction] = useState<boolean>(false);

  useEffect(() => {
    if (activePreviewTaskId) {
      localStorage.setItem("dev-mode-preview-task-id", activePreviewTaskId);
    } else {
      localStorage.removeItem("dev-mode-preview-task-id");
    }
  }, [activePreviewTaskId]);

  // Form states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
  const [newPinCoords, setNewPinCoords] = useState<{ x: number; y: number } | null>(null);
  const [formTitle, setFormTitle] = useState<string>("");
  const [formDesc, setFormDesc] = useState<string>("");
  const [formPriority, setFormPriority] = useState<"low" | "normal" | "medium" | "high">("normal");
  const [formTab, setFormTab] = useState<string>("general");
  const [isCreatingGeneral, setIsCreatingGeneral] = useState<boolean>(false);
  const [isCreatingInline, setIsCreatingInline] = useState<boolean>(false);
  const inlineTitleInputRef = useRef<HTMLInputElement | null>(null);

  // Safety & control refs
  const isMountedRef = useRef<boolean>(true);
  const pinningTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isPinningFinishedRef = useRef<boolean>(false);
  const throttleTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastRecalculateRunRef = useRef<number>(0);

  // Detail / Editing Modal states
  const [selectedTask, setSelectedTask] = useState<DevTask | null>(null);
  const [isEditingTask, setIsEditingTask] = useState<boolean>(false);
  const [editTitle, setEditTitle] = useState<string>("");
  const [editDesc, setEditDesc] = useState<string>("");
  const [editPriority, setEditPriority] = useState<"low" | "normal" | "medium" | "high">("normal");
  const [editStatus, setEditStatus] = useState<"todo" | "in-progress" | "done">("todo");

  // Sidebar Filter states
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterPriority, setFilterPriority] = useState<string>("all");
  const [filterTab, setFilterTab] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Target ref to measure relative coordinates on main
  const mainRef = useRef<HTMLDivElement | null>(null);
  const bannerInputRef = useRef<HTMLInputElement | null>(null);
  const [mousePos, setMousePos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Dragging & Snapping States
  const [newPinDims, setNewPinDims] = useState<{ w: number; h: number } | null>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ clientX: number; clientY: number } | null>(null);
  const [dragRect, setDragRect] = useState<{ left: number; top: number; width: number; height: number } | null>(null);
  const [snappedBounds, setSnappedBounds] = useState<{ left: number; top: number; width: number; height: number } | null>(null);

  // Responsive & Coordinate Sync States
  const [newPinSelector, setNewPinSelector] = useState<string | undefined>(undefined);
  const [newPinRelative, setNewPinRelative] = useState<{ rx: number; ry: number } | null>(null);
  
  interface PinCoord {
    left: number;
    top: number;
    width?: number;
    height?: number;
    visible?: boolean;
  }
  const [resolvedCoords, setResolvedCoords] = useState<Record<string, PinCoord>>({});

  // Helper to geometrically resolve the most specific DOM element intersecting a given marquee box
  const findAnchoredElement = (marqueeRect: { left: number; top: number; width: number; height: number }): HTMLElement | null => {
    if (!mainRef.current) return null;
    
    // Query all potential content elements inside main
    const elements = Array.from(
      mainRef.current.querySelectorAll("section, article, p, h1, h2, h3, span, strong, button, a, code, blockquote, li, .card, [class*='card']")
    ) as HTMLElement[];
    
    let bestElement: HTMLElement | null = null;
    let maxScore = 0;
    
    elements.forEach(el => {
      // Exclude main, dev overlays, or hidden elements
      if (el === mainRef.current || el.closest(".dev-mode-ui")) return;
      
      const r = el.getBoundingClientRect();
      if (r.width === 0 || r.height === 0) return;
      
      // Calculate intersection bounds
      const interLeft = Math.max(marqueeRect.left, r.left);
      const interTop = Math.max(marqueeRect.top, r.top);
      const interRight = Math.min(marqueeRect.left + marqueeRect.width, r.left + r.width);
      const interBottom = Math.min(marqueeRect.top + marqueeRect.height, r.top + r.height);
      
      if (interLeft < interRight && interTop < interBottom) {
        const interArea = (interRight - interLeft) * (interBottom - interTop);
        const elArea = r.width * r.height;
        
        // Overlap ratio (fraction of the element covered by the marquee)
        const score = interArea / elArea;
        
        if (score > maxScore) {
          maxScore = score;
          bestElement = el;
        }
      }
    });
    
    // If no specific element was found, try querying all divs inside main as a fallback
    if (!bestElement) {
      const fallbackDivs = Array.from(mainRef.current.querySelectorAll("div")) as HTMLElement[];
      fallbackDivs.forEach(el => {
        if (el === mainRef.current || el.closest(".dev-mode-ui")) return;
        const r = el.getBoundingClientRect();
        if (r.width === 0 || r.height === 0) return;
        const interLeft = Math.max(marqueeRect.left, r.left);
        const interTop = Math.max(marqueeRect.top, r.top);
        const interRight = Math.min(marqueeRect.left + marqueeRect.width, r.left + r.width);
        const interBottom = Math.min(marqueeRect.top + marqueeRect.height, r.top + r.height);
        if (interLeft < interRight && interTop < interBottom) {
          const interArea = (interRight - interLeft) * (interBottom - interTop);
          const elArea = r.width * r.height;
          const score = interArea / elArea;
          if (score > maxScore) {
            maxScore = score;
            bestElement = el;
          }
        }
      });
    }
    
    return bestElement;
  };

  // 1. Fetch tasks on load
  const fetchTasks = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/dev/tasks");
      if (res.ok) {
        const data = await res.json();
        setTasks(data);
      }
    } catch (err) {
      console.error("Error loading dev tasks:", err);
    } finally {
      setLoading(false);
    }
  };

  // 1.2 Git Preview actions
  const handlePreviewTask = async (taskId: string) => {
    try {
      setIsSubmittingPreviewAction(true);
      const res = await fetch(`/api/dev/tasks/${taskId}/preview`, { method: "POST" });
      if (res.ok) {
        setActivePreviewTaskId(taskId);
        // Refresh page so Vite reloads all files and Hot Module Replacement triggers.
        window.location.reload();
      } else {
        const errorData = await res.json();
        alert(`Error al iniciar previsualización: ${errorData.error || "Algo salió mal"}`);
      }
    } catch (e) {
      console.error(e);
      alert("Error al conectar con el servidor local.");
    } finally {
      setIsSubmittingPreviewAction(false);
    }
  };

  const handleApproveTask = async (taskId: string) => {
    try {
      setIsSubmittingPreviewAction(true);
      const res = await fetch(`/api/dev/tasks/${taskId}/approve`, { method: "POST" });
      if (res.ok) {
        setActivePreviewTaskId(null);
        alert("¡Previsualización aprobada y fusionada con éxito en tu código principal!");
        window.location.reload();
      } else {
        const errorData = await res.json();
        alert(`Error al aprobar: ${errorData.error || "Algo salió mal"}`);
      }
    } catch (e) {
      console.error(e);
      alert("Error al conectar con el servidor local.");
    } finally {
      setIsSubmittingPreviewAction(false);
    }
  };

  const handleRejectTask = async (taskId: string) => {
    if (!window.confirm("¿Estás seguro de que quieres rechazar y borrar de forma permanente esta previsualización de la IA? Se perderán estos cambios.")) {
      return;
    }
    try {
      setIsSubmittingPreviewAction(true);
      const res = await fetch(`/api/dev/tasks/${taskId}/reject`, { method: "POST" });
      if (res.ok) {
        setActivePreviewTaskId(null);
        alert("Cambios rechazados de forma segura. Volviendo a tu código original.");
        window.location.reload();
      } else {
        const errorData = await res.json();
        alert(`Error al rechazar: ${errorData.error || "Algo salió mal"}`);
      }
    } catch (e) {
      console.error(e);
      alert("Error al conectar con el servidor.");
    } finally {
      setIsSubmittingPreviewAction(false);
    }
  };

  const handleFeedbackTask = async (taskId: string, feedbackText: string) => {
    if (!feedbackText.trim()) {
      alert("Por favor escribe tu comentario.");
      return;
    }
    try {
      setIsSubmittingPreviewAction(true);
      const res = await fetch(`/api/dev/tasks/${taskId}/feedback`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ feedback: feedbackText }),
      });
      if (res.ok) {
        setActivePreviewTaskId(null);
        setFeedbackTaskId(null);
        setPreviewFeedbackText("");
        alert("Feedback enviado a la IA de forma segura. Volviendo a tu código original.");
        window.location.reload();
      } else {
        const errorData = await res.json();
        alert(`Error al enviar comentarios: ${errorData.error || "Algo salió mal"}`);
      }
    } catch (e) {
      console.error(e);
      alert("Error al conectar con el servidor.");
    } finally {
      setIsSubmittingPreviewAction(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  // Dynamic Coordinate Sync Engine (Responsive & Scroll-Aligned)
  useEffect(() => {
    if (!isActive) {
      setResolvedCoords({});
      return;
    }

    const recalculateCoords = () => {
      if (!mainRef.current) return;
      const mainRect = mainRef.current.getBoundingClientRect();
      const nextCoords: Record<string, PinCoord> = {};

      // 1. Recalculate existing tasks' pins
      tasks.forEach(task => {
        if (task.tab === activeTab && task.selector) {
          // Default to invisible if selector exists but isn't found/resolved yet
          nextCoords[task.id] = { left: 0, top: 0, visible: false };
          try {
            const el = document.querySelector(task.selector) as HTMLElement | null;
            if (el) {
              const elRect = el.getBoundingClientRect();
              
              if (elRect.width === 0 || elRect.height === 0) {
                return;
              }
              
              if (task.w !== undefined && task.h !== undefined) {
                // Snapped element or marquee area tied to DOM element
                const rx = task.rx !== undefined ? task.rx : 0;
                const ry = task.ry !== undefined ? task.ry : 0;
                const rw = task.rw !== undefined ? task.rw : 100;
                const rh = task.rh !== undefined ? task.rh : 100;

                const left = elRect.left - mainRect.left + (mainRef.current.scrollLeft || 0) + (elRect.width * rx) / 100;
                const top = elRect.top - mainRect.top + (mainRef.current.scrollTop || 0) + (elRect.height * ry) / 100;
                const width = (elRect.width * rw) / 100;
                const height = (elRect.height * rh) / 100;

                const pinViewportRect = {
                  left: elRect.left + (elRect.width * rx) / 100,
                  top: elRect.top + (elRect.height * ry) / 100,
                  width,
                  height
                };

                nextCoords[task.id] = {
                  left,
                  top,
                  width,
                  height,
                  visible: isRectVisibleInScrollAncestors(pinViewportRect, el)
                };
              } else if (task.rx !== undefined && task.ry !== undefined) {
                // Point pin anchored to an element
                const left = elRect.left - mainRect.left + (mainRef.current.scrollLeft || 0) + (elRect.width * task.rx) / 100;
                const top = elRect.top - mainRect.top + (mainRef.current.scrollTop || 0) + (elRect.height * task.ry) / 100;

                const pinViewportRect = {
                  left: elRect.left + (elRect.width * task.rx) / 100 - 12,
                  top: elRect.top + (elRect.height * task.ry) / 100 - 12,
                  width: 24,
                  height: 24
                };

                nextCoords[task.id] = { 
                  left, 
                  top,
                  visible: isRectVisibleInScrollAncestors(pinViewportRect, el)
                };
              }
            }
          } catch (e) {
            console.warn("Failed to resolve selector for task:", task.id, task.selector, e);
          }
        }
      });

      // 2. Recalculate coordinates for new pin preview currently being created
      if (newPinSelector) {
        nextCoords["new-pin-preview"] = { left: 0, top: 0, visible: false };
        try {
          const el = document.querySelector(newPinSelector) as HTMLElement | null;
          if (el) {
            const elRect = el.getBoundingClientRect();
            if (elRect.width > 0 && elRect.height > 0) {
              if (newPinDims) {
                // Snapped element region preview (covers the entire element)
                const left = elRect.left - mainRect.left + (mainRef.current.scrollLeft || 0);
                const top = elRect.top - mainRect.top + (mainRef.current.scrollTop || 0);
                const width = elRect.width;
                const height = elRect.height;

                const pinViewportRect = {
                  left: elRect.left,
                  top: elRect.top,
                  width,
                  height
                };

                nextCoords["new-pin-preview"] = {
                  left,
                  top,
                  width,
                  height,
                  visible: isRectVisibleInScrollAncestors(pinViewportRect, el)
                };
              } else if (newPinRelative) {
                // Point pin preview anchored to element
                const left = elRect.left - mainRect.left + (mainRef.current.scrollLeft || 0) + (elRect.width * newPinRelative.rx) / 100;
                const top = elRect.top - mainRect.top + (mainRef.current.scrollTop || 0) + (elRect.height * newPinRelative.ry) / 100;

                const pinViewportRect = {
                  left: elRect.left + (elRect.width * newPinRelative.rx) / 100 - 12,
                  top: elRect.top + (elRect.height * newPinRelative.ry) / 100 - 12,
                  width: 24,
                  height: 24
                };

                nextCoords["new-pin-preview"] = { 
                  left, 
                  top,
                  visible: isRectVisibleInScrollAncestors(pinViewportRect, el)
                };
              }
            }
          }
        } catch (e) {
          console.warn("Failed to resolve selector for new-pin-preview:", e);
        }
      } else if (newPinCoords) {
        // Drag marquee selection region preview
        if (newPinDims) {
          const left = (newPinCoords.x * mainRect.width) / 100;
          const top = (newPinCoords.y * mainRect.height) / 100;
          const width = (newPinDims.w * mainRect.width) / 100;
          const height = (newPinDims.h * mainRect.height) / 100;
          nextCoords["new-pin-preview"] = { left, top, width, height, visible: true };
        } else {
          // Absolute point pin preview
          const left = (newPinCoords.x * mainRect.width) / 100;
          const top = (newPinCoords.y * mainRect.height) / 100;
          nextCoords["new-pin-preview"] = { left, top, visible: true };
        }
      }

      setResolvedCoords(nextCoords);
    };

    // Self-contained trailing-edge throttle
    const recalculateCoordsThrottled = () => {
      const now = Date.now();
      const remaining = 50 - (now - lastRecalculateRunRef.current);
      if (remaining <= 0) {
        if (throttleTimeoutRef.current) {
          clearTimeout(throttleTimeoutRef.current);
          throttleTimeoutRef.current = null;
        }
        recalculateCoords();
        lastRecalculateRunRef.current = now;
      } else if (!throttleTimeoutRef.current) {
        throttleTimeoutRef.current = setTimeout(() => {
          recalculateCoords();
          lastRecalculateRunRef.current = Date.now();
          throttleTimeoutRef.current = null;
        }, remaining);
      }
    };

    // Calculate immediately on effect trigger
    recalculateCoords();

    // Listen to window resizing with throttle
    window.addEventListener("resize", recalculateCoordsThrottled, { passive: true });
    
    // Listen to ALL scrolls on the page (capture: true) so nested scrolling elements trigger recalculation with throttle
    window.addEventListener("scroll", recalculateCoordsThrottled, { capture: true, passive: true });

    // Set up MutationObserver to monitor DOM mutations (tabs, expanded cards, layout shifts)
    const observer = new MutationObserver((mutations) => {
      const hasContentMutation = mutations.some((m) => {
        const target = m.target as HTMLElement;
        return target && typeof target.closest === "function" && !target.closest(".dev-mode-ui");
      });
      if (hasContentMutation) {
        recalculateCoordsThrottled();
      }
    });
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["class", "style"]
    });

    return () => {
      window.removeEventListener("resize", recalculateCoordsThrottled);
      window.removeEventListener("scroll", recalculateCoordsThrottled, true);
      observer.disconnect();
      if (throttleTimeoutRef.current) {
        clearTimeout(throttleTimeoutRef.current);
        throttleTimeoutRef.current = null;
      }
    };
  }, [isActive, tasks, activeTab, newPinCoords, newPinDims, newPinSelector, newPinRelative]);

  // Auto-heal tasks missing or having invalid selectors by geometrically resolving them once the DOM is ready
  useEffect(() => {
    if (!isActive || tasks.length === 0 || !mainRef.current) return;

    // Run after a short delay to ensure sub-components have completed their layout animation
    const timer = setTimeout(async () => {
      let updatedAny = false;
      
      for (const task of tasks) {
        // Skip tasks that have already been attempted to heal in this session to prevent infinite requests
        if (healedTasksRef.current.has(task.id)) continue;

        const isSelectorInvalid = !task.selector || task.selector.includes("div#root") || task.selector.includes("div.min-h-screen") || task.selector.includes("body");
        if (isSelectorInvalid && task.x !== undefined && task.y !== undefined) {
          healedTasksRef.current.add(task.id);
          
          // Convert percentages back to viewport pixel coordinates to feed into findAnchoredElement
          const rect = mainRef.current!.getBoundingClientRect();
          const left = rect.left + (task.x * rect.width) / 100;
          const top = rect.top + (task.y * rect.height) / 100;
          
          let anchoredEl: HTMLElement | null = null;
          
          if (task.w !== undefined && task.h !== undefined) {
            // Region task
            const width = (task.w * rect.width) / 100;
            const height = (task.h * rect.height) / 100;
            anchoredEl = findAnchoredElement({ left, top, width, height });
            
            if (anchoredEl) {
              const elRect = anchoredEl.getBoundingClientRect();
              const rx = ((left - elRect.left) / elRect.width) * 100;
              const ry = ((top - elRect.top) / elRect.height) * 100;
              const rw = (width / elRect.width) * 100;
              const rh = (height / elRect.height) * 100;
              
              const payload = {
                selector: getUniqueSelector(anchoredEl),
                rx,
                ry,
                rw,
                rh
              };
              
              try {
                const res = await fetch(`/api/dev/tasks/${task.id}`, {
                  method: "PUT",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify(payload)
                });
                if (res.ok) {
                  updatedAny = true;
                }
              } catch (e) {
                console.error("Failed to auto-heal task:", task.id, e);
              }
            }
          } else {
            // Point task
            const clickMarquee = { left: left - 5, top: top - 5, width: 10, height: 10 };
            anchoredEl = findAnchoredElement(clickMarquee);
            
            if (anchoredEl) {
              const elRect = anchoredEl.getBoundingClientRect();
              const rx = ((left - elRect.left) / elRect.width) * 100;
              const ry = ((top - elRect.top) / elRect.height) * 100;
              
              const payload = {
                selector: getUniqueSelector(anchoredEl),
                rx,
                ry
              };
              
              try {
                const res = await fetch(`/api/dev/tasks/${task.id}`, {
                  method: "PUT",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify(payload)
                });
                if (res.ok) {
                  updatedAny = true;
                }
              } catch (e) {
                console.error("Failed to auto-heal task:", task.id, e);
              }
            }
          }
        }
      }
      
      if (updatedAny && isMountedRef.current) {
        fetchTasks(); // Refresh tasks list on success
      }
    }, 2000); // 2 second delay to ensure layout is settled

    return () => clearTimeout(timer);
  }, [isActive, tasks, activeTab]);

  // 1.5 Synchronize dev states with localStorage
  useEffect(() => {
    localStorage.setItem("dev-mode-active", String(isActive));
  }, [isActive]);

  // Dynamic CSS Variable injection to resize page layout smoothly
  useEffect(() => {
    const updateWidth = () => {
      if (isActive && layoutMode === "sidebar" && isSidebarOpen) {
        const isDesktop = window.innerWidth >= 768;
        const width = isDesktop ? "430px" : "0px";
        document.documentElement.style.setProperty("--dev-sidebar-width", width);
      } else {
        document.documentElement.style.setProperty("--dev-sidebar-width", "0px");
      }
    };
    
    updateWidth();
    window.addEventListener("resize", updateWidth, { passive: true });
    
    return () => {
      window.removeEventListener("resize", updateWidth);
      document.documentElement.style.setProperty("--dev-sidebar-width", "0px");
    };
  }, [isActive, layoutMode, isSidebarOpen]);

  useEffect(() => {
    localStorage.setItem("dev-mode-sidebar-open", String(isSidebarOpen));
  }, [isSidebarOpen]);

  useEffect(() => {
    localStorage.setItem("dev-mode-layout-mode", layoutMode);
  }, [layoutMode]);

  useEffect(() => {
    localStorage.setItem("dev-mode-sidebar-minimized", String(isSidebarMinimized));
  }, [isSidebarMinimized]);

  useEffect(() => {
    if (sidebarPos) {
      localStorage.setItem("dev-mode-sidebar-pos", JSON.stringify(sidebarPos));
    } else {
      localStorage.removeItem("dev-mode-sidebar-pos");
    }
  }, [sidebarPos]);

  // 2. Keyboard shortcut logic (Ctrl + Shift + D y Ctrl + Shift + N)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === "d") {
        e.preventDefault();
        setIsActive(prev => {
          const next = !prev;
          if (next) {
            setIsSidebarOpen(true);
          } else {
            setIsSidebarOpen(false);
            setIsPinningMode(false);
          }
          return next;
        });
      }

      if (e.altKey && e.key.toLowerCase() === "n") {
        e.preventDefault();
        setIsActive(true);
        setIsSidebarMinimized(false);
        setIsSidebarOpen(true);
        setIsCreatingInline(true);
        setIsPinningMode(true);
        setFormTitle("");
        setFormDesc("");
        setFormPriority("normal");
        setFormTab("general");
        setNewPinCoords(null);
        setNewPinDims(null);
        setNewPinSelector(undefined);
        setNewPinRelative(null);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // 2.5 Cancel pinning or inline creation with Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (isCreatingInline) {
          setIsCreatingInline(false);
          setIsPinningMode(false);
          setNewPinCoords(null);
          setNewPinDims(null);
          setNewPinSelector(undefined);
          setNewPinRelative(null);
          setFormTitle("");
          setFormDesc("");
        } else if (isPinningMode) {
          setIsPinningMode(false);
          setIsSidebarOpen(true);
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isPinningMode, isCreatingInline]);

  // 3. Keep mainRef bound to the parent <main> element
  useEffect(() => {
    const mainEl = document.querySelector("main");
    if (mainEl) {
      mainRef.current = mainEl as HTMLDivElement;
    }
  }, [activeTab]);

  // Helper to convert viewport coordinates to main-relative percentages (0-100)
  const getRelativeCoords = (clientX: number, clientY: number) => {
    if (!mainRef.current) return { x: 0, y: 0 };
    const rect = mainRef.current.getBoundingClientRect();
    const x = ((clientX - rect.left) / rect.width) * 100;
    const y = ((clientY - rect.top) / rect.height) * 100;
    return {
      x: Math.max(0, Math.min(100, x)),
      y: Math.max(0, Math.min(100, y)),
    };
  };

  // 3.5 Global cursor & user-select override while pinning
  useEffect(() => {
    if (isActive && isPinningMode) {
      document.body.style.cursor = "crosshair";
      document.body.style.userSelect = "none";
    } else {
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    }
    return () => {
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };
  }, [isActive, isPinningMode]);

  // 3.6 Autofocus the inline sidebar input field when creation is active
  useEffect(() => {
    if (isCreatingInline) {
      const timer = setTimeout(() => {
        inlineTitleInputRef.current?.focus();
      }, 80);
      return () => clearTimeout(timer);
    }
  }, [isCreatingInline]);

  // 4. Capture-phase Window event listeners for robust drag selection & snapping
  useEffect(() => {
    if (!isActive || !isPinningMode) return;

    const handleWindowMouseDown = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      // Ignore clicks on DevMode UI elements (buttons, modals, cancel guide banner)
      if (target.closest(".dev-mode-ui")) return;

      e.preventDefault();
      e.stopPropagation();
      setDragStart({ clientX: e.clientX, clientY: e.clientY });
      setDragRect(null);
    };

    const handleWindowMouseMove = (e: MouseEvent) => {
      const rect = mainRef.current?.getBoundingClientRect();
      if (!rect) return;
      
      const currentX = e.clientX - rect.left;
      const currentY = e.clientY - rect.top;
      setMousePos({ x: currentX, y: currentY });

      if (dragStart) {
        // Drag Marquee Mode
        const dist = Math.sqrt(
          Math.pow(e.clientX - dragStart.clientX, 2) +
          Math.pow(e.clientY - dragStart.clientY, 2)
        );
        if (dist > 10) {
          setIsDragging(true);
          const left = Math.min(dragStart.clientX, e.clientX);
          const top = Math.min(dragStart.clientY, e.clientY);
          const width = Math.abs(dragStart.clientX - e.clientX);
          const height = Math.abs(dragStart.clientY - e.clientY);
          
          setDragRect({ left, top, width, height });
          setSnappedBounds(null);
        }
      } else {
        // Override snapping and force absolute point pin if Ctrl key is pressed
        if (e.ctrlKey) {
          setSnappedBounds(null);
          return;
        }

        // Smart Snapping element detection
        const target = document.elementFromPoint(e.clientX, e.clientY);
        if (target) {
          const snappedEl = target.closest("section, article, p, h1, h2, h3, header, footer, button, .card, [class*='card'], [class*='p-'], [class*='px-']") as HTMLElement | null;
          if (snappedEl && mainRef.current && mainRef.current.contains(snappedEl) && snappedEl !== mainRef.current && snappedEl.parentElement !== mainRef.current) {
            const sRect = snappedEl.getBoundingClientRect();
            setSnappedBounds({
              left: sRect.left,
              top: sRect.top,
              width: sRect.width,
              height: sRect.height,
            });
          } else {
            setSnappedBounds(null);
          }
        }
      }
    };

    const handleWindowMouseUp = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest(".dev-mode-ui")) return;

      const currentDragStart = dragStart;
      const currentDragRect = dragRect;
      const currentSnapped = snappedBounds;

      // Reset states
      setDragStart(null);
      setIsDragging(false);
      setDragRect(null);
      setSnappedBounds(null);

      if (!currentDragStart) return;

      e.preventDefault();
      e.stopPropagation();

      // Safe helper to trigger click-blocking pinning deactivation
      const triggerPinningDeactivation = (isMarquee: boolean) => {
        if (isMarquee) {
          // For drag selection (marquee), no click event is synthesized, so we deactivate instantly
          setIsPinningMode(false);
          return;
        }

        // For snaps or simple point click, we expect a click event. We block it inside handleWindowClick.
        isPinningFinishedRef.current = true;

        if (pinningTimeoutRef.current) {
          clearTimeout(pinningTimeoutRef.current);
        }
        
        // 100ms safety fallback in case no click is fired (ensures screen unlocks regardless)
        pinningTimeoutRef.current = setTimeout(() => {
          if (isPinningFinishedRef.current) {
            isPinningFinishedRef.current = false;
            setIsPinningMode(false);
          }
        }, 100);
      };

      try {
        // Force absolute point pin if Control key is held (bypassing snapping & drag selection)
        if (e.ctrlKey) {
          const coords = getRelativeCoords(e.clientX, e.clientY);
          setNewPinCoords(coords);
          setNewPinDims(null);
          setNewPinSelector(undefined);
          setNewPinRelative(null);
          setFormTab(activeTab);
          
          if (isCreatingInline) {
            triggerPinningDeactivation(false);
            setTimeout(() => {
              inlineTitleInputRef.current?.focus();
            }, 50);
            return;
          }

          setIsCreatingGeneral(false);
          setIsCreateModalOpen(true);
          triggerPinningDeactivation(false);
          return;
        }

        const dragDistance = Math.sqrt(
          Math.pow(e.clientX - currentDragStart.clientX, 2) +
          Math.pow(e.clientY - currentDragStart.clientY, 2)
        );

        if (dragDistance > 10 && currentDragRect) {
          // Drag marquee area captured
          const startCoords = getRelativeCoords(currentDragRect.left, currentDragRect.top);
          const endCoords = getRelativeCoords(currentDragRect.left + currentDragRect.width, currentDragRect.top + currentDragRect.height);
          
          setNewPinCoords({ x: startCoords.x, y: startCoords.y });
          setNewPinDims({ w: Math.abs(endCoords.x - startCoords.x), h: Math.abs(endCoords.y - startCoords.y) });
          setNewPinSelector(undefined);
          setNewPinRelative(null);
          setFormTab(activeTab);

          if (isCreatingInline) {
            triggerPinningDeactivation(true); // Drag marquee -> deactivate instantly
            setTimeout(() => {
              inlineTitleInputRef.current?.focus();
            }, 50);
            return;
          }

          setIsCreatingGeneral(false);
          setIsCreateModalOpen(true);
          triggerPinningDeactivation(true); // Drag marquee -> deactivate instantly
        } else if (currentSnapped) {
          // Snapped element captured
          const startCoords = getRelativeCoords(currentSnapped.left, currentSnapped.top);
          const endCoords = getRelativeCoords(currentSnapped.left + currentSnapped.width, currentSnapped.top + currentSnapped.height);
          
          setNewPinCoords({ x: startCoords.x, y: startCoords.y });
          setNewPinDims({ w: Math.abs(endCoords.x - startCoords.x), h: Math.abs(endCoords.y - startCoords.y) });
          
          // Find the unique selector for the snapped element
          const targetElement = document.elementFromPoint(e.clientX, e.clientY) as HTMLElement | null;
          if (targetElement) {
            const snappedEl = targetElement.closest("section, article, p, h1, h2, h3, header, footer, button, .card, [class*='card'], [class*='p-'], [class*='px-']") as HTMLElement | null;
            if (snappedEl) {
              setNewPinSelector(getUniqueSelector(snappedEl));
            } else {
              setNewPinSelector(undefined);
            }
          } else {
            setNewPinSelector(undefined);
          }
          setNewPinRelative(null);
          setFormTab(activeTab);

          if (isCreatingInline) {
            triggerPinningDeactivation(false);
            setTimeout(() => {
              inlineTitleInputRef.current?.focus();
            }, 50);
            return;
          }

          setIsCreatingGeneral(false);
          setIsCreateModalOpen(true);
          triggerPinningDeactivation(false);
        } else {
          // Simple point click pin
          const coords = getRelativeCoords(e.clientX, e.clientY);
          setNewPinCoords(coords);
          setNewPinDims(null);
          
          // Point pin anchored to the clicked element
          const targetElement = document.elementFromPoint(e.clientX, e.clientY) as HTMLElement | null;
          if (targetElement) {
            const clickedEl = targetElement.closest("section, article, p, h1, h2, h3, header, footer, button, .card, [class*='card'], [class*='p-'], [class*='px-'], div") as HTMLElement | null;
            if (clickedEl) {
              const elRect = clickedEl.getBoundingClientRect();
              const rx = ((e.clientX - elRect.left) / elRect.width) * 100;
              const ry = ((e.clientY - elRect.top) / elRect.height) * 100;
              setNewPinSelector(getUniqueSelector(clickedEl));
              setNewPinRelative({ rx, ry });
            } else {
              setNewPinSelector(undefined);
              setNewPinRelative(null);
            }
          } else {
            setNewPinSelector(undefined);
            setNewPinRelative(null);
          }
          setFormTab(activeTab);

          if (isCreatingInline) {
            triggerPinningDeactivation(false);
            setTimeout(() => {
              inlineTitleInputRef.current?.focus();
            }, 50);
            return;
          }

          setIsCreatingGeneral(false);
          setIsCreateModalOpen(true);
          triggerPinningDeactivation(false);
        }
      } catch (err) {
        console.error("Critical error inside handleWindowMouseUp coordinate resolution:", err);
        // Ensure pinning mode is turned off immediately on any coordinate calculation crash so page doesn't freeze
        setIsPinningMode(false);
      }
    };

    const handleWindowClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest(".dev-mode-ui")) return;

      e.preventDefault();
      e.stopPropagation();

      // Deterministic click catching:
      // When the native click event fires, we capture it, prevent it, and synchronously deactivate pinning
      if (isPinningFinishedRef.current) {
        isPinningFinishedRef.current = false;
        if (pinningTimeoutRef.current) {
          clearTimeout(pinningTimeoutRef.current);
          pinningTimeoutRef.current = null;
        }
        setIsPinningMode(false);
      }
    };

    window.addEventListener("mousedown", handleWindowMouseDown, true);
    window.addEventListener("mousemove", handleWindowMouseMove, true);
    window.addEventListener("mouseup", handleWindowMouseUp, true);
    window.addEventListener("click", handleWindowClick, true);

    return () => {
      window.removeEventListener("mousedown", handleWindowMouseDown, true);
      window.removeEventListener("mousemove", handleWindowMouseMove, true);
      window.removeEventListener("mouseup", handleWindowMouseUp, true);
      window.removeEventListener("click", handleWindowClick, true);
    };
  }, [isActive, isPinningMode, dragStart, dragRect, snappedBounds, activeTab, isCreatingInline]);

  // 5.5 Quick create a general note directly from the pinning mode top guide banner
  const handleCreateGeneralDirectly = async () => {
    if (!formTitle.trim()) return;

    const payload = {
      title: formTitle.trim(),
      description: "",
      tab: "general",
      priority: "normal",
      status: "todo"
    };

    try {
      const res = await fetch("/api/dev/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        const newTask = await res.json();
        setTasks(prev => [newTask, ...prev]);
        // Reset form and states
        setFormTitle("");
        setFormDesc("");
        setFormPriority("normal");
        setIsPinningMode(false);
        setIsSidebarOpen(true); // Re-open the main panel
      } else {
        alert("Error al guardar la nota general");
      }
    } catch (err) {
      console.error(err);
      alert("Error al conectar con la API de desarrollo");
    }
  };

  // 6. Creating a task
  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) return;

    const payload = {
      title: formTitle.trim(),
      description: formDesc.trim(),
      tab: isCreatingGeneral ? "general" : formTab,
      x: isCreatingGeneral ? undefined : newPinCoords?.x,
      y: isCreatingGeneral ? undefined : newPinCoords?.y,
      w: isCreatingGeneral ? undefined : newPinDims?.w,
      h: isCreatingGeneral ? undefined : newPinDims?.h,
      selector: isCreatingGeneral ? undefined : newPinSelector,
      rx: isCreatingGeneral ? undefined : newPinRelative?.rx,
      ry: isCreatingGeneral ? undefined : newPinRelative?.ry,
      priority: formPriority,
      status: "todo"
    };

    try {
      const res = await fetch("/api/dev/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        const newTask = await res.json();
        setTasks(prev => [newTask, ...prev]);
        // Reset form
        setFormTitle("");
        setFormDesc("");
        setFormPriority("normal");
        setIsCreateModalOpen(false);
        setNewPinCoords(null);
        setNewPinDims(null);
        setNewPinSelector(undefined);
        setNewPinRelative(null);
        setIsSidebarOpen(true); // Re-open the main panel
      } else {
        alert("Error al guardar la tarea");
      }
    } catch (err) {
      console.error(err);
      alert("Error al conectar con la API de desarrollo");
    }
  };

  // 7. Toggle task completion
  const handleToggleComplete = async (task: DevTask) => {
    const nextStatus = task.status === "done" ? "todo" : "done";
    try {
      const res = await fetch(`/api/dev/tasks/${task.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus })
      });
      if (res.ok) {
        const updated = await res.json();
        setTasks(prev => prev.map(t => t.id === task.id ? updated : t));
        if (selectedTask?.id === task.id) {
          setSelectedTask(updated);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  // 8. Delete task
  const handleDeleteTask = async (taskId: string) => {
    if (!confirm("¿Seguro que quieres eliminar esta nota de desarrollo?")) return;
    try {
      const res = await fetch(`/api/dev/tasks/${taskId}`, {
        method: "DELETE"
      });
      if (res.ok) {
        setTasks(prev => prev.filter(t => t.id !== taskId));
        setSelectedTask(null);
        setIsEditingTask(false);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // 9. Update task details
  const handleUpdateTaskDetails = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTask || !editTitle.trim()) return;

    try {
      const res = await fetch(`/api/dev/tasks/${selectedTask.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: editTitle.trim(),
          description: editDesc.trim(),
          priority: editPriority,
          status: editStatus
        })
      });

      if (res.ok) {
        const updated = await res.json();
        setTasks(prev => prev.map(t => t.id === selectedTask.id ? updated : t));
        setSelectedTask(updated);
        setIsEditingTask(false);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // 10. Start editing a task
  const startEditing = (task: DevTask) => {
    setEditTitle(task.title);
    setEditDesc(task.description);
    setEditPriority(task.priority);
    setEditStatus(task.status);
    setIsEditingTask(true);
  };

  // 11. Focus on a task pin (scrolling and highlighting)
  const handleFocusTask = (task: DevTask) => {
    // 1. Switch to appropriate tab if it's general or visual
    if (task.tab !== "general" && task.tab !== activeTab) {
      setActiveTab(task.tab);
    }

    // Close sidebar on mobile
    if (window.innerWidth < 768) {
      setIsSidebarOpen(false);
    }

    // If it has coordinates, scroll to it
    if (task.x !== undefined && task.y !== undefined) {
      setTimeout(() => {
        setHighlightedPinId(task.id);
        const pinElement = document.getElementById(`dev-pin-${task.id}`);
        if (pinElement) {
          pinElement.scrollIntoView({ behavior: "smooth", block: "center" });
        }
        // Remove highlight after animation completes
        setTimeout(() => {
          setHighlightedPinId(null);
        }, 3000);
      }, 300);
    }
  };



  // Parser de lenguaje natural inteligente para el buscador semántico
  const parseSemanticQuery = (query: string) => {
    const cleanQuery = (query || "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .trim();

    if (!cleanQuery) {
      return {
        priority: null,
        status: null,
        tab: null,
        keywords: [] as string[]
      };
    }

    const tokens = cleanQuery.split(/\s+/);
    let detectedPriority: "low" | "normal" | "medium" | "high" | null = null;
    let detectedStatus: "todo" | "in-progress" | "done" | null = null;
    let detectedTab: string | null = null;
    const remainingKeywords: string[] = [];

    // Diccionarios de sinónimos y léxico
    const priorityDict: Record<string, "low" | "normal" | "medium" | "high"> = {
      alta: "high", alto: "high", urgente: "high", critico: "high", critica: "high", prioritario: "high", high: "high",
      media: "medium", medio: "medium", moderada: "medium", moderado: "medium", medium: "medium",
      normal: "normal", estandar: "normal", regular: "normal", estandarizada: "normal", normalizado: "normal",
      baja: "low", bajo: "low", leve: "low", insignificante: "low", low: "low"
    };

    const statusDict: Record<string, "todo" | "in-progress" | "done"> = {
      pendiente: "todo", pendientes: "todo", todo: "todo", "por hacer": "todo", hacer: "todo", iniciar: "todo",
      proceso: "in-progress", progreso: "in-progress", haciendo: "in-progress", wip: "in-progress",
      hecho: "done", hecha: "done", hechos: "done", hechas: "done", completado: "done", completada: "done",
      completados: "done", completadas: "done", listo: "done", lista: "done", listos: "done", listas: "done",
      terminado: "done", terminada: "done", terminados: "done", terminadas: "done", done: "done", completas: "done",
      completa: "done"
    };

    const tabDict: Record<string, string> = {
      conceptos: "grafo", grafo: "grafo", red: "grafo", nodos: "grafo", relaciones: "grafo", mapa: "grafo",
      cronologia: "cronologia", cronología: "cronologia", tiempo: "cronologia", linea: "cronologia", fechas: "cronologia", historia: "cronologia",
      tesis: "dialectica", dialectica: "dialectica", argumentos: "dialectica", argumento: "dialectica", debates: "dialectica", debate: "dialectica",
      calculadora: "calculadora", impacto: "calculadora", numeros: "calculadora", formulas: "calculadora", retornos: "calculadora",
      ia: "validador", validador: "validador", sintiensia: "validador", sintiens: "validador", inteligencia: "validador", validar: "validador",
      general: "general", generales: "general", notas: "general", tablero: "general", global: "general"
    };

    for (let i = 0; i < tokens.length; i++) {
      const token = tokens[i];
      
      // Comprobar combinaciones de dos palabras
      const nextToken = tokens[i + 1] ? tokens[i + 1] : "";
      const comboTwo = `${token} ${nextToken}`;

      if (comboTwo === "por hacer") {
        detectedStatus = "todo";
        i++; // Saltar siguiente token
        continue;
      }
      if (comboTwo === "sintiens ia") {
        detectedTab = "validador";
        i++;
        continue;
      }

      if (priorityDict[token] !== undefined) {
        detectedPriority = priorityDict[token];
      } else if (statusDict[token] !== undefined) {
        detectedStatus = statusDict[token];
      } else if (tabDict[token] !== undefined) {
        detectedTab = tabDict[token];
      } else {
        remainingKeywords.push(token);
      }
    }

    return {
      priority: detectedPriority,
      status: detectedStatus,
      tab: detectedTab,
      keywords: remainingKeywords
    };
  };

  const semantic = parseSemanticQuery(searchQuery);

  // Determinación de filtros activos (los semánticos tienen prioridad sobre el dropdown)
  const activePriorityFilter = semantic.priority || (filterPriority !== "all" ? filterPriority : null);
  const activeStatusFilter = semantic.status || (filterStatus !== "all" ? filterStatus : null);
  const activeTabFilter = semantic.tab || (filterTab !== "all" ? filterTab : null);

  // Filtrado y cálculo de relevancia (scoring) de tareas
  const scoredTasks = tasks.map(task => {
    if (!task) {
      return { task: null, matches: false, score: 0 };
    }
    // 1. Filtrar por prioridad si está activo
    if (activePriorityFilter && task.priority !== activePriorityFilter) {
      return { task, matches: false, score: 0 };
    }
    // 2. Filtrar por estado si está activo
    if (activeStatusFilter && task.status !== activeStatusFilter) {
      return { task, matches: false, score: 0 };
    }
    // 3. Filtrar por sección/tab si está activo
    if (activeTabFilter && task.tab !== activeTabFilter) {
      return { task, matches: false, score: 0 };
    }

    // 4. Calcular relevancia si hay términos de búsqueda de texto libre
    if (semantic.keywords.length > 0) {
      let score = 0;
      let matchesKeyword = false;

      const cleanTitle = (task.title || "")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase();
      const cleanDesc = (task.description || "")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase();
      const tabLabel = (getTabLabel(task.tab) || "")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase();

      for (const kw of semantic.keywords) {
        let kwMatch = false;

        // Búsqueda exacta en título
        if (cleanTitle === kw) {
          score += 15;
          kwMatch = true;
        }
        // Substring en título
        else if (cleanTitle.includes(kw)) {
          score += 8;
          kwMatch = true;
        }

        // Búsqueda exacta en descripción
        if (cleanDesc === kw) {
          score += 5;
          kwMatch = true;
        }
        // Substring en descripción
        else if (cleanDesc.includes(kw)) {
          score += 3;
          kwMatch = true;
        }

        // Búsqueda en nombre de la pestaña
        if (tabLabel.includes(kw)) {
          score += 2;
          kwMatch = true;
        }

        if (kwMatch) {
          matchesKeyword = true;
        }
      }

      if (!matchesKeyword) {
        return { task, matches: false, score: 0 };
      }

      return { task, matches: true, score };
    }

    // Si pasó los filtros y no hay palabras clave de texto libre
    return { task, matches: true, score: 1 };
  });

  const filteredTasks = scoredTasks
    .filter(item => item && item.matches && item.task)
    .sort((a, b) => {
      // First sort by search relevance score
      if (b.score !== a.score) {
        return b.score - a.score;
      }
      // If scores are equal, sort by creation date descending (newest first)
      const timeA = a.task?.createdAt ? new Date(a.task.createdAt).getTime() : 0;
      const timeB = b.task?.createdAt ? new Date(b.task.createdAt).getTime() : 0;
      return timeB - timeA;
    })
    .map(item => item.task as DevTask);

  // Count metrics
  const todoCount = tasks.filter(t => t && t.status === "todo").length;
  const inProgressCount = tasks.filter(t => t && t.status === "in-progress").length;
  const doneCount = tasks.filter(t => t && t.status === "done").length;

  // Render tab badge helper
  function getTabLabel(tabName: string) {
    if (!tabName) return "";
    switch (tabName) {
      case "grafo": return "Conceptos";
      case "cronologia": return "Cronología";
      case "dialectica": return "Tesis";
      case "calculadora": return "Impacto";
      case "validador": return "Sintiens IA";
      case "general": return "General";
      default: return tabName;
    }
  }

  // Helper for priority colors (using Sintiens' specific presets)
  function getPriorityColor(p: "low" | "normal" | "medium" | "high") {
    if (p === "high") return "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/25";
    if (p === "medium") return "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/25";
    if (p === "normal") return "bg-zinc-500/10 text-zinc-600 dark:text-zinc-455 border-zinc-500/20";
    return "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/25";
  }

  const renderTaskDetailContent = (task: DevTask) => {
    return (
      <>
        {!isEditingTask ? (
          /* READ VIEW */
          <div className="space-y-3.5 text-xs font-sans">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <h3 className="text-sm font-bold text-zinc-900 dark:text-white leading-snug">{task.title}</h3>
              <div className="flex items-center gap-1.5">
                <span className={`px-1.5 py-0.5 rounded-md text-[8px] font-bold border uppercase font-mono ${getPriorityColor(task.priority)}`}>
                  {task.priority}
                </span>
                <span className={`px-1.5 py-0.5 rounded-md text-[8px] font-bold border uppercase font-mono ${
                  task.status === "done"
                    ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-555/20"
                    : task.status === "in-progress"
                      ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-555/20"
                      : "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-555/20"
                }`}>
                  {task.status}
                </span>
              </div>
            </div>

            {task.description ? (
              <p className="text-xs text-zinc-650 dark:text-zinc-350 font-light leading-relaxed whitespace-pre-wrap bg-zinc-50/50 dark:bg-zinc-900/40 p-3 rounded-xl border border-zinc-200/50 dark:border-zinc-800/40 max-h-[150px] overflow-y-auto overscroll-y-contain custom-scrollbar">
                {task.description}
              </p>
            ) : (
              <p className="text-[10px] text-zinc-400 dark:text-zinc-600 italic">Sin descripción adicional</p>
            )}

            {/* AI Feedback Display (if the task has user feedback pending) */}
            {task.aiFeedback && (
              <div className="bg-purple-950/20 dark:bg-purple-950/30 border border-purple-500/20 rounded-xl p-3 space-y-1">
                <span className="text-[9px] font-mono font-bold text-purple-400 uppercase tracking-wider">💬 Tu feedback anterior:</span>
                <p className="text-[11px] text-purple-200 dark:text-purple-300 font-light leading-relaxed italic">"{task.aiFeedback}"</p>
              </div>
            )}

            {/* AI Preview Action Bar — shown for AI-tagged tasks */}
            {task.title.startsWith("[IA: Listo para verificar") ? (
              <div className="space-y-2.5 pt-3 border-t border-purple-500/15">
                <div className="flex items-center gap-2">
                  <div className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-purple-500"></span>
                  </div>
                  <span className="text-[9px] font-mono font-black text-purple-500 dark:text-purple-400 uppercase tracking-widest">Sugerencia de la IA lista</span>
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePreviewTask(task.id);
                  }}
                  disabled={isSubmittingPreviewAction}
                  className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 disabled:opacity-50 text-white font-bold px-4 py-3 rounded-2xl text-xs transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-[0.98] shadow-[0_4px_15px_rgba(139,92,246,0.3)] border border-purple-500/20"
                >
                  <Sparkles className="w-4 h-4" /> Probar en Vivo
                </button>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRejectTask(task.id);
                    }}
                    disabled={isSubmittingPreviewAction}
                    className="flex-1 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-900 dark:hover:bg-zinc-800 disabled:opacity-50 text-zinc-600 dark:text-zinc-400 font-bold px-3 py-2 rounded-xl text-[10px] transition-all cursor-pointer flex items-center justify-center gap-1 border border-zinc-200 dark:border-zinc-800"
                  >
                    <X className="w-3 h-3" /> Rechazar
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteTask(task.id);
                    }}
                    className="text-rose-550 hover:text-rose-600 font-bold cursor-pointer flex items-center gap-1 text-[10px] px-2 py-2"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ) : (
              /* Normal Task Action Bar */
              <div className="flex items-center justify-between pt-3 border-t border-zinc-100 dark:border-zinc-900">
                <button
                  type="button"
                  onClick={() => handleDeleteTask(task.id)}
                  className="text-rose-550 hover:text-rose-600 font-bold cursor-pointer flex items-center gap-1 text-[10px]"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Eliminar
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => startEditing(task)}
                    className="bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-900 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 px-3 py-1.5 rounded-xl text-[10px] font-bold transition-all cursor-pointer border border-zinc-200 dark:border-zinc-800"
                  >
                    <Edit2 className="w-3 h-3 inline mr-1" /> Editar
                  </button>
                  <button
                    type="button"
                    onClick={() => handleToggleComplete(task)}
                    className={`px-3 py-1.5 rounded-xl text-[10px] font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                      task.status === "done"
                        ? "bg-zinc-150 text-zinc-500 dark:bg-zinc-900 dark:text-zinc-400 border border-zinc-250 dark:border-zinc-800"
                        : "bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
                    }`}
                  >
                    {task.status === "done" ? (
                      "Reabrir"
                    ) : (
                      <>
                        <Check className="w-3.5 h-3.5 stroke-[3.5]" /> Completar
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          /* EDIT FORM */
          <form onSubmit={handleUpdateTaskDetails} className="space-y-3.5 text-xs">
            {/* Edit Title */}
            <div className="space-y-1">
              <label className="text-[9px] font-mono text-zinc-400 dark:text-zinc-550 font-bold uppercase tracking-wider block">
                Título
              </label>
              <input
                type="text"
                required
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className="w-full bg-white dark:bg-zinc-950/60 border border-zinc-300 dark:border-zinc-800 focus:border-zinc-500 dark:focus:border-zinc-700 focus:ring-1 focus:ring-zinc-200 dark:focus:ring-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-900 dark:text-white outline-none transition-all"
              />
            </div>

            {/* Edit Description */}
            <div className="space-y-1">
              <label className="text-[9px] font-mono text-zinc-400 dark:text-zinc-550 font-bold uppercase tracking-wider block">
                Descripción
              </label>
              <textarea
                value={editDesc}
                onChange={(e) => setEditDesc(e.target.value)}
                rows={2}
                className="w-full bg-white dark:bg-zinc-950/60 border border-zinc-300 dark:border-zinc-800 focus:border-zinc-500 dark:focus:border-zinc-700 focus:ring-1 focus:ring-zinc-200 dark:focus:ring-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-900 dark:text-white outline-none transition-all overscroll-y-contain resize-none leading-relaxed"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              {/* Edit Priority */}
              <div className="space-y-1">
                <label className="text-[9px] font-mono text-zinc-400 dark:text-zinc-550 font-bold uppercase tracking-wider block">
                  Prioridad
                </label>
                <select
                  value={editPriority}
                  onChange={(e) => setEditPriority(e.target.value as any)}
                  className="w-full bg-white dark:bg-zinc-950/60 border border-zinc-300 dark:border-zinc-800 rounded-xl px-2 py-2 text-xs text-zinc-750 dark:text-zinc-300 focus:outline-none"
                >
                  <option value="low">Baja</option>
                  <option value="normal">Normal</option>
                  <option value="medium">Media</option>
                  <option value="high">Alta</option>
                </select>
              </div>

              {/* Edit Status */}
              <div className="space-y-1">
                <label className="text-[9px] font-mono text-zinc-400 dark:text-zinc-550 font-bold uppercase tracking-wider block">
                  Estado
                </label>
                <select
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value as any)}
                  className="w-full bg-white dark:bg-zinc-950/60 border border-zinc-300 dark:border-zinc-800 rounded-xl px-2 py-2 text-xs text-zinc-750 dark:text-zinc-300 focus:outline-none"
                >
                  <option value="todo">Pendiente</option>
                  <option value="in-progress">En Proceso</option>
                  <option value="done">Completado</option>
                </select>
              </div>
            </div>

            {/* Edit Actions */}
            <div className="flex justify-end gap-2 pt-3 border-t border-zinc-200 dark:border-zinc-900">
              <button
                type="button"
                onClick={() => setIsEditingTask(false)}
                className="bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-900 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-350 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer border border-zinc-200 dark:border-zinc-800"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-zinc-200 text-white dark:text-zinc-950 font-bold px-4 py-2 rounded-xl text-xs transition-all cursor-pointer"
              >
                Guardar
              </button>
            </div>
          </form>
        )}
      </>
    );
  };

  // 11.5 Custom Drag Handler for Developer Sidebar (Exclusive to Floating Mode)
  const handleHeaderMouseDown = (e: React.MouseEvent) => {
    if (layoutMode !== "floating" || e.button !== 0) return;

    const target = e.target as HTMLElement;
    if (target.closest("button") || target.closest("a") || target.closest("input") || target.closest("select") || target.closest("textarea")) {
      return;
    }

    e.preventDefault();

    const rect = sidebarRef.current?.getBoundingClientRect();
    if (!rect) return;

    const startX = e.clientX;
    const startY = e.clientY;
    const initialLeft = rect.left;
    const initialTop = rect.top;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const deltaX = moveEvent.clientX - startX;
      const deltaY = moveEvent.clientY - startY;

      let nextLeft = initialLeft + deltaX;
      let nextTop = initialTop + deltaY;

      const maxX = window.innerWidth - rect.width;
      const maxY = window.innerHeight - rect.height;

      nextLeft = Math.max(0, Math.min(nextLeft, maxX));
      nextTop = Math.max(0, Math.min(nextTop, maxY));

      setSidebarPos({ x: nextLeft, y: nextTop });
    };

    const handleMouseUp = () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  // Keep sidebar coordinates bounded during window resizing (Exclusive to Floating Mode)
  useEffect(() => {
    if (layoutMode !== "floating") return;
    const handleResize = () => {
      if (sidebarPos && sidebarRef.current) {
        const rect = sidebarRef.current.getBoundingClientRect();
        const maxX = window.innerWidth - rect.width;
        const maxY = window.innerHeight - rect.height;
        const nextLeft = Math.max(0, Math.min(sidebarPos.x, maxX));
        const nextTop = Math.max(0, Math.min(sidebarPos.y, maxY));
        if (nextLeft !== sidebarPos.x || nextTop !== sidebarPos.y) {
          setSidebarPos({ x: nextLeft, y: nextTop });
        }
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [sidebarPos, layoutMode]);

  // Reusable panel body for sidebar and floating viewports
  const renderPanelBody = () => {
    return (
      <>


        {/* Metrics Quick Strip */}
        <div className="px-5 py-2.5 bg-zinc-50/20 dark:bg-zinc-900/20 border-b border-zinc-200/60 dark:border-zinc-900 grid grid-cols-3 gap-2.5 text-center text-[10px] font-mono shrink-0">
          <div className="px-2 py-1 bg-white dark:bg-zinc-950 border border-zinc-200/80 dark:border-zinc-900 rounded-xl flex items-center justify-center gap-1 shadow-sm dark:shadow-none">
            <span className="text-zinc-400 dark:text-zinc-500">PEND:</span>
            <span className="font-bold text-indigo-600 dark:text-indigo-400">{todoCount}</span>
          </div>
          <div className="px-2 py-1 bg-white dark:bg-zinc-950 border border-zinc-200/80 dark:border-zinc-900 rounded-xl flex items-center justify-center gap-1 shadow-sm dark:shadow-none">
            <span className="text-zinc-400 dark:text-zinc-500">WIP:</span>
            <span className="font-bold text-amber-600 dark:text-amber-500">{inProgressCount}</span>
          </div>
          <div className="px-2 py-1 bg-white dark:bg-zinc-950 border border-zinc-200/80 dark:border-zinc-900 rounded-xl flex items-center justify-center gap-1 shadow-sm dark:shadow-none">
            <span className="text-zinc-400 dark:text-zinc-500">LISTO:</span>
            <span className="font-bold text-emerald-600 dark:text-emerald-500">{doneCount}</span>
          </div>
        </div>

        {/* Filter controls */}
        <div className="p-4 border-b border-zinc-200/60 dark:border-zinc-900 bg-zinc-50/30 dark:bg-zinc-900/10 space-y-3 shrink-0">
          {/* Search input */}
          <div className="space-y-2">
            <div className="relative">
              <input
                type="text"
                placeholder="Buscar notas o tareas..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white dark:bg-zinc-950/60 border border-zinc-300 dark:border-zinc-800 focus:border-purple-500 dark:focus:border-purple-555 focus:ring-1 focus:ring-purple-200 dark:focus:ring-purple-900 rounded-xl pl-3 pr-8 py-2 text-xs text-zinc-900 dark:text-white outline-none transition-all placeholder:text-zinc-400 dark:placeholder-zinc-650"
              />
              <Sparkles className={`w-3.5 h-3.5 absolute right-2.5 top-2.5 pointer-events-none transition-colors duration-300 ${(searchQuery || "").trim() !== "" ? "text-purple-500" : "text-zinc-400 dark:text-zinc-600"}`} />
            </div>

            {/* Micro-badges for interpreted semantic filters */}
            {(searchQuery || "").trim() !== "" && (semantic.priority || semantic.status || semantic.tab) && (
              <div className="flex flex-wrap gap-1.5 pt-0.5 animate-fadeIn">
                <span className="text-[9px] font-mono text-zinc-450 dark:text-zinc-550 font-bold self-center mr-0.5">
                  Filtros inteligentes:
                </span>
                {semantic.priority && (
                  <span className="px-2 py-0.5 rounded-lg text-[8px] font-mono font-black flex items-center gap-1 border border-rose-500/20 bg-rose-500/10 text-rose-600 dark:text-rose-400 shadow-sm">
                    <Sparkles className="w-2.5 h-2.5 text-rose-500 animate-pulse shrink-0" />
                    PRIO: {semantic.priority.toUpperCase()}
                  </span>
                )}
                {semantic.status && (
                  <span className="px-2 py-0.5 rounded-lg text-[8px] font-mono font-black flex items-center gap-1 border border-indigo-500/20 bg-indigo-500/10 text-indigo-650 dark:text-indigo-400 shadow-sm">
                    <Sparkles className="w-2.5 h-2.5 text-indigo-500 animate-pulse shrink-0" />
                    ESTADO: {semantic.status === "todo" ? "PENDIENTE" : semantic.status === "in-progress" ? "WIP" : "COMPLETADO"}
                  </span>
                )}
                {semantic.tab && (
                  <span className="px-2 py-0.5 rounded-lg text-[8px] font-mono font-black flex items-center gap-1 border border-purple-500/20 bg-purple-500/10 text-purple-650 dark:text-purple-400 shadow-sm">
                    <Sparkles className="w-2.5 h-2.5 text-purple-500 animate-pulse shrink-0" />
                    SECC: {getTabLabel(semantic.tab).toUpperCase()}
                  </span>
                )}
              </div>
            )}
          </div>

          <div className="grid grid-cols-3 gap-2">
            {/* Status select */}
            <div className="space-y-0.5">
              <label className="text-[8px] font-mono text-zinc-400 dark:text-zinc-500 uppercase tracking-widest block font-bold">Estado</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full bg-white dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 text-[10px] rounded-lg px-2 py-1.5 text-zinc-700 dark:text-zinc-350 focus:outline-none focus:border-purple-500"
              >
                <option value="all">Todos</option>
                <option value="todo">Pendiente</option>
                <option value="in-progress">En Proceso</option>
                <option value="done">Completado</option>
              </select>
            </div>

            {/* Priority select */}
            <div className="space-y-0.5">
              <label className="text-[8px] font-mono text-zinc-400 dark:text-zinc-500 uppercase tracking-widest block font-bold">Prioridad</label>
              <select
                value={filterPriority}
                onChange={(e) => setFilterPriority(e.target.value)}
                className="w-full bg-white dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 text-[10px] rounded-lg px-2 py-1.5 text-zinc-700 dark:text-zinc-350 focus:outline-none focus:border-purple-500"
              >
                <option value="all">Todas</option>
                <option value="high">Alta</option>
                <option value="medium">Media</option>
                <option value="normal">Normal</option>
                <option value="low">Baja</option>
              </select>
            </div>

            {/* Tab selector */}
            <div className="space-y-0.5">
              <label className="text-[8px] font-mono text-zinc-400 dark:text-zinc-500 uppercase tracking-widest block font-bold">Sección</label>
              <select
                value={filterTab}
                onChange={(e) => setFilterTab(e.target.value)}
                className="w-full bg-white dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 text-[10px] rounded-lg px-2 py-1.5 text-zinc-700 dark:text-zinc-350 focus:outline-none focus:border-purple-500"
              >
                <option value="all">Todas</option>
                <option value="grafo">Conceptos</option>
                <option value="cronologia">Cronología</option>
                <option value="dialectica">Tesis</option>
                <option value="calculadora">Calculadora</option>
                <option value="validador">Sintiens IA</option>
                <option value="general">General</option>
              </select>
            </div>
          </div>
        </div>

        {/* Stationary Inline Creation Block (Fixed at the top, does not scroll) */}
        <div className="px-4 pt-4 pb-2 shrink-0 bg-zinc-50/20 dark:bg-zinc-950/15 border-b border-zinc-150/40 dark:border-zinc-900/50">
          <AnimatePresence mode="popLayout">
            {isCreatingInline ? (
              <motion.div
                key="inline-creator-form"
                initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                animate={{ opacity: 1, height: "auto", marginBottom: 12 }}
                exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                transition={{ duration: 0.25, ease: "easeInOut" }}
                className="p-4 bg-white dark:bg-zinc-900 border border-purple-500/40 dark:border-purple-500/30 rounded-2xl shadow-lg space-y-3 dev-mode-ui text-left overflow-hidden shrink-0"
              >
                <div className="flex items-center justify-between pb-2 border-b border-zinc-150 dark:border-zinc-800">
                  <span className="font-mono text-[9px] text-purple-650 dark:text-purple-400 font-bold uppercase tracking-wider flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-purple-500 shrink-0" />
                    Nueva Nota Inline
                  </span>
                  <span className="text-[9px] font-mono font-semibold text-zinc-400">
                    {newPinCoords ? `📍 Pin: ${getTabLabel(formTab)}` : "📝 Nota General"}
                  </span>
                </div>

                <form
                  onSubmit={async (e) => {
                    e.preventDefault();
                    if (!formTitle.trim()) return;
                    
                    const payload = {
                      title: formTitle.trim(),
                      description: formDesc.trim(),
                      tab: newPinCoords ? formTab : "general",
                      x: newPinCoords?.x,
                      y: newPinCoords?.y,
                      w: newPinCoords ? newPinDims?.w : undefined,
                      h: newPinCoords ? newPinDims?.h : undefined,
                      selector: newPinCoords ? newPinSelector : undefined,
                      rx: newPinCoords ? newPinRelative?.rx : undefined,
                      ry: newPinCoords ? newPinRelative?.ry : undefined,
                      priority: formPriority,
                      status: "todo"
                    };

                    try {
                      const res = await fetch("/api/dev/tasks", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(payload)
                      });

                      if (res.ok) {
                        const newTask = await res.json();
                        setTasks(prev => [newTask, ...prev]);
                        // Reset form
                        setFormTitle("");
                        setFormDesc("");
                        setFormPriority("normal");
                        setIsCreatingInline(false);
                        setIsPinningMode(false);
                        setNewPinCoords(null);
                        setNewPinDims(null);
                        setNewPinSelector(undefined);
                        setNewPinRelative(null);
                      } else {
                        alert("Error al guardar la tarea");
                      }
                    } catch (err) {
                      console.error(err);
                      alert("Error al conectar con la API de desarrollo");
                    }
                  }}
                  className="space-y-3 font-sans text-xs"
                >
                  {/* Title Input */}
                  <div className="space-y-1">
                    <label className="text-[9px] font-mono text-zinc-400 dark:text-zinc-550 font-bold uppercase tracking-wider block">
                      Título de la Nota / Pin
                    </label>
                    <input
                      ref={inlineTitleInputRef}
                      type="text"
                      required
                      value={formTitle}
                      onChange={(e) => setFormTitle(e.target.value)}
                      placeholder="Ej. Cambiar margen de la cabecera"
                      className="w-full bg-white dark:bg-zinc-950/60 border border-zinc-300 dark:border-zinc-800 focus:border-purple-500 focus:ring-1 focus:ring-purple-250 dark:focus:ring-purple-900 rounded-xl px-3 py-2 text-xs text-zinc-900 dark:text-white outline-none transition-all placeholder:text-zinc-400 dark:placeholder-zinc-650"
                    />
                  </div>

                  {/* Description Textarea */}
                  <div className="space-y-1">
                    <label className="text-[9px] font-mono text-zinc-400 dark:text-zinc-550 font-bold uppercase tracking-wider block">
                      Descripción / Comentario
                    </label>
                    <textarea
                      value={formDesc}
                      onChange={(e) => setFormDesc(e.target.value)}
                      rows={2}
                      placeholder="Escribe más detalles aquí..."
                      className="w-full bg-white dark:bg-zinc-950/60 border border-zinc-300 dark:border-zinc-800 focus:border-purple-500 focus:ring-1 focus:ring-purple-250 dark:focus:ring-purple-900 rounded-xl px-3 py-2 text-xs text-zinc-900 dark:text-white outline-none transition-all placeholder:text-zinc-400 dark:placeholder-zinc-650 resize-none leading-relaxed"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    {/* Priority Select */}
                    <div className="space-y-1">
                      <label className="text-[9px] font-mono text-zinc-400 dark:text-zinc-550 font-bold uppercase tracking-wider block">
                        Prioridad
                      </label>
                      <select
                        value={formPriority}
                        onChange={(e) => setFormPriority(e.target.value as any)}
                        className="w-full bg-white dark:bg-zinc-950/60 border border-zinc-300 dark:border-zinc-800 rounded-xl px-2 py-1.5 text-xs text-zinc-750 dark:text-zinc-300 focus:outline-none focus:border-purple-500"
                      >
                        <option value="low">Baja</option>
                        <option value="normal">Normal</option>
                        <option value="medium">Media</option>
                        <option value="high">Alta</option>
                      </select>
                    </div>

                    {/* Tab Selector (Section) */}
                    <div className="space-y-1">
                      <label className="text-[9px] font-mono text-zinc-400 dark:text-zinc-550 font-bold uppercase tracking-wider block">
                        Sección Vinculada
                      </label>
                      <select
                        value={newPinCoords ? formTab : formTab === "general" ? "general" : formTab}
                        disabled={!!newPinCoords}
                        onChange={(e) => setFormTab(e.target.value)}
                        className="w-full bg-white dark:bg-zinc-950/60 border border-zinc-300 dark:border-zinc-800 rounded-xl px-2 py-1.5 text-xs text-zinc-750 dark:text-zinc-300 focus:outline-none focus:border-purple-500 disabled:opacity-60"
                      >
                        <option value="general">General (Sin pin)</option>
                        <option value="grafo">Conceptos</option>
                        <option value="cronologia">Cronología</option>
                        <option value="dialectica">Tesis</option>
                        <option value="calculadora">Calculadora</option>
                        <option value="validador">Sintiens IA</option>
                      </select>
                    </div>
                  </div>

                  {/* Coordinate Feedback */}
                  <div className="bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-900 rounded-xl p-2.5 text-[9px] font-mono text-zinc-500 dark:text-zinc-450 space-y-1 transition-colors">
                    {newPinCoords ? (
                      <div className="flex items-center justify-between text-purple-650 dark:text-purple-400 font-bold">
                        <span className="flex items-center gap-1"><MapPin className="w-3 h-3 text-purple-500" /> Pin capturado:</span>
                        <div className="flex items-center gap-2">
                          <span>X: {newPinCoords.x.toFixed(1)}% / Y: {newPinCoords.y.toFixed(1)}%</span>
                          <button
                            type="button"
                            onClick={() => setIsPinningMode(true)}
                            className="px-2 py-0.5 bg-purple-100 hover:bg-purple-200 dark:bg-purple-950 dark:hover:bg-purple-900 text-purple-700 dark:text-purple-300 rounded font-bold text-[8px] transition-colors cursor-pointer border border-purple-200/50"
                          >
                            Cambiar
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="text-[9px] italic text-zinc-400 dark:text-zinc-550 flex items-center gap-1 font-sans">
                        <MapPin className="w-3 h-3 text-zinc-350 dark:text-zinc-650" />
                        Haz clic en la pantalla para asociar un Pin (opcional)
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex justify-end gap-2 pt-2 border-t border-zinc-150 dark:border-zinc-800">
                    <button
                      type="button"
                      onMouseDown={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setIsCreatingInline(false);
                        setIsPinningMode(false);
                        setNewPinCoords(null);
                        setNewPinDims(null);
                        setNewPinSelector(undefined);
                        setNewPinRelative(null);
                        setFormTitle("");
                        setFormDesc("");
                      }}
                      className="bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-750 text-zinc-700 dark:text-zinc-300 px-3 py-1.5 rounded-xl text-[10px] font-bold transition-all cursor-pointer border border-zinc-200 dark:border-zinc-800"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="bg-purple-600 hover:bg-purple-700 text-white font-bold px-3.5 py-1.5 rounded-xl text-[10px] transition-all cursor-pointer shadow-sm active:scale-95"
                    >
                      Crear Nota
                    </button>
                  </div>
                </form>
              </motion.div>
            ) : (
              /* Dotted Placeholder Card for Creation Trigger (Distinguished Note format) */
              <motion.div
                key="inline-creator-placeholder"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                onClick={() => {
                  setIsCreatingInline(true);
                  setIsPinningMode(true);
                  setFormTitle("");
                  setFormDesc("");
                  setFormPriority("normal");
                  setFormTab("general");
                  setNewPinCoords(null);
                  setNewPinDims(null);
                  setNewPinSelector(undefined);
                  setNewPinRelative(null);
                }}
                className="p-4 bg-purple-500/5 dark:bg-purple-950/10 hover:bg-purple-500/10 dark:hover:bg-purple-950/20 border-2 border-dashed border-purple-500/30 dark:border-purple-500/20 rounded-2xl flex items-center justify-center gap-2.5 transition-all duration-300 cursor-pointer shadow-sm hover:scale-[1.01] group shrink-0 mb-0"
              >
                <Plus className="w-5 h-5 text-purple-600 dark:text-purple-400 group-hover:scale-110 transition-transform stroke-[2.5]" />
                <span className="text-xs font-bold text-purple-750 dark:text-purple-300 font-sans tracking-wide">
                  Crear nueva nota / pin...
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Scrollable Task list viewport */}
        <div className="flex-1 overflow-y-auto overscroll-y-contain p-4 space-y-3 custom-scrollbar min-h-0 bg-zinc-50/50 dark:bg-zinc-950/40">

          {loading ? (
            <div className="text-center py-10 text-xs font-mono text-zinc-500">Cargando tareas...</div>
          ) : filteredTasks.length === 0 ? (
            <div className="text-center py-12 border border-dashed border-zinc-200 dark:border-zinc-850 rounded-2xl space-y-2 bg-white dark:bg-zinc-950">
              <AlertCircle className="w-8 h-8 text-zinc-300 dark:text-zinc-700 mx-auto" />
              <p className="text-xs text-zinc-400 dark:text-zinc-500">No se encontraron tareas</p>
              <p className="text-[10px] text-zinc-450 dark:text-zinc-600 max-w-[200px] mx-auto leading-relaxed">
                Fija un pin en la pantalla o crea una nota general para verla aquí.
              </p>
            </div>
          ) : (
            filteredTasks.map(task => {
              const isDone = task.status === "done";
              const isWIP = task.status === "in-progress";

              return (
                <motion.div
                  layout
                  key={task.id}
                  onMouseEnter={() => setHighlightedPinId(task.id)}
                  onMouseLeave={() => setHighlightedPinId(null)}
                  onClick={() => {
                    if (selectedTask?.id === task.id) {
                      setSelectedTask(null);
                    } else {
                      setSelectedTask(task);
                      setIsEditingTask(false);
                    }
                  }}
                  className={`p-4 bg-white dark:bg-zinc-900/60 border rounded-2xl flex flex-col justify-between transition-all duration-300 shadow-sm dark:shadow-none hover:border-zinc-400 dark:hover:border-zinc-700 cursor-pointer ${
                    selectedTask?.id === task.id
                      ? "border-purple-500/60 dark:border-purple-500/50 shadow-[0_0_15px_rgba(139,92,246,0.15)] ring-1 ring-purple-500/10"
                      : isDone 
                        ? "border-emerald-500/10 opacity-70 bg-zinc-50/50 dark:bg-zinc-950" 
                        : isWIP 
                          ? "border-amber-500/30 dark:border-amber-500/20" 
                          : "border-zinc-200 dark:border-zinc-800"
                  }`}
                >
                  {selectedTask?.id === task.id ? (
                    /* EXPANDED VIEW IN-PLACE */
                    <div className="space-y-4 text-left" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-between pb-2.5 border-b border-zinc-150 dark:border-zinc-900">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-[8px] text-zinc-400 dark:text-zinc-500 font-bold uppercase tracking-wider">
                            ID: #{task.id.substring(0, 5)}
                          </span>
                          {task.tab !== "general" && (
                            <>
                              <span className="text-zinc-200 dark:text-zinc-800 text-[8px]">|</span>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleFocusTask(task);
                                }}
                                className="text-purple-655 dark:text-purple-400 hover:underline font-bold font-mono text-[9px] cursor-pointer flex items-center gap-0.5"
                              >
                                Ir a Sección <ExternalLink className="w-2.5 h-2.5" />
                              </button>
                            </>
                          )}
                        </div>
                        <span className="text-[9px] font-mono text-purple-650 dark:text-purple-400 font-bold capitalize">
                          {getTabLabel(task.tab)}
                        </span>
                      </div>
                      
                      {renderTaskDetailContent(task)}
                    </div>
                  ) : (
                    /* COMPACT VIEW */
                    <>
                      <div className="flex items-start gap-3">
                        {/* Custom beautifully styled Checkbox */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleToggleComplete(task);
                          }}
                          className={`mt-0.5 w-4.5 h-4.5 rounded-lg border flex items-center justify-center cursor-pointer transition-all shrink-0 ${
                            isDone
                              ? "bg-emerald-500 border-emerald-400 text-zinc-950 shadow-inner"
                              : "border-zinc-300 dark:border-zinc-700 hover:border-purple-500 hover:bg-zinc-50 dark:hover:bg-zinc-850"
                          }`}
                        >
                          {isDone && <Check className="w-3.5 h-3.5 stroke-[3.5]" />}
                        </button>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            {/* AI Task Badge */}
                            {(task.title.startsWith("[IA: Listo para verificar") || task.title.startsWith("[IA: Ajustes Solicitados]") || task.title.startsWith("[IA: Sugerencia de Diseño]")) && (
                              <span className="px-1.5 py-0.5 rounded-md text-[7px] font-black border uppercase font-mono bg-purple-500/15 text-purple-500 dark:text-purple-400 border-purple-500/25 flex items-center gap-1 shrink-0">
                                <Sparkles className="w-2.5 h-2.5" /> IA
                              </span>
                            )}
                            <h4 className={`text-xs font-bold text-zinc-950 dark:text-white truncate ${isDone ? "line-through text-zinc-400 dark:text-zinc-600" : ""}`}>
                              {task.title.replace(/\[IA: [^\]]+\]\s*/, "")}
                            </h4>
                            <span className={`px-1.5 py-0.5 rounded-md text-[8px] font-bold border uppercase font-mono ${getPriorityColor(task.priority)}`}>
                              {task.priority}
                            </span>
                            <span className="px-1.5 py-0.5 rounded-md text-[8px] bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 font-bold font-mono">
                              {getTabLabel(task.tab)}
                            </span>
                          </div>
                          {task.description && (
                            <p className={`text-[10px] text-zinc-650 dark:text-zinc-350 font-normal mt-1.5 leading-relaxed break-words ${isDone ? "line-through text-zinc-500 dark:text-zinc-600" : ""}`}>
                              {task.description}
                            </p>
                          )}
                          {/* Inline Preview Button for AI Tasks */}
                          {task.title.startsWith("[IA: Listo para verificar") && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handlePreviewTask(task.id);
                              }}
                              disabled={isSubmittingPreviewAction}
                              className="mt-2.5 w-full bg-gradient-to-r from-purple-600/90 to-indigo-600/90 hover:from-purple-600 hover:to-indigo-600 disabled:opacity-50 text-white font-bold px-3 py-2 rounded-xl text-[10px] transition-all cursor-pointer flex items-center justify-center gap-1.5 active:scale-[0.98] shadow-[0_2px_10px_rgba(139,92,246,0.2)] border border-purple-500/15"
                            >
                              <Sparkles className="w-3 h-3" /> Probar en Vivo
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Footer Actions */}
                      <div className="mt-3.5 pt-3 border-t border-zinc-150 dark:border-zinc-800/80 flex items-center justify-between text-[9px] font-mono text-zinc-455 dark:text-zinc-555">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-zinc-400 dark:text-zinc-600" />
                          {new Date(task.createdAt).toLocaleDateString()}
                        </span>
                        <div className="flex items-center gap-2">
                          {task.tab !== "general" && (
                            <>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleFocusTask(task);
                                }}
                                className="text-purple-655 dark:text-purple-400 hover:underline hover:text-purple-750 dark:hover:text-purple-300 font-bold cursor-pointer flex items-center gap-0.5"
                              >
                                Ir a Sección <ExternalLink className="w-2.5 h-2.5" />
                              </button>
                              <span className="text-zinc-200 dark:text-zinc-800">|</span>
                            </>
                          )}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteTask(task.id);
                            }}
                            className="text-zinc-400 hover:text-rose-500 dark:text-zinc-655 dark:hover:text-rose-400 p-0.5 rounded hover:bg-zinc-50 dark:hover:bg-zinc-850 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </motion.div>
              );
            })
          )}
        </div>

      </>
    );
  };

  // Render nothing if dev mode is inactive
  return (
    <>
      {/* 3. Interactive Pins Rendered over the Active Tab elements */}
      {isActive && mainRef.current && (
        <div className="absolute inset-0 z-[80] pointer-events-none overflow-hidden select-none dev-mode-ui">
          {tasks
            .filter(task => task && task.tab === activeTab && task.x !== undefined && task.y !== undefined)
            .map(task => {
              const isHigh = task.priority === "high";
              const isMed = task.priority === "medium";
              const isNormal = task.priority === "normal";
              const isDone = task.status === "done";
              const isHighlighted = highlightedPinId === task.id || selectedTask?.id === task.id;

              const isRegion = task.w !== undefined && task.h !== undefined;

              if (isRegion) {
                const coords = resolvedCoords[task.id];
                if (coords && coords.visible === false) return null;
                return (
                  <div
                    key={task.id}
                    id={`dev-pin-${task.id}`}
                    style={{
                      left: coords?.left !== undefined ? `${coords.left}px` : `${task.x}%`,
                      top: coords?.top !== undefined ? `${coords.top}px` : `${task.y}%`,
                      width: coords?.width !== undefined ? `${coords.width}px` : `${task.w}%`,
                      height: coords?.height !== undefined ? `${coords.height}px` : `${task.h}%`,
                    }}
                    className={`absolute border-2 border-dashed rounded-2xl pointer-events-none z-[81] transition-[border-color,background-color,box-shadow,transform] duration-300 group ${
                      isHighlighted
                        ? "border-amber-400 bg-amber-400/5 ring-4 ring-amber-400/20 scale-[1.01] z-[84]"
                        : isDone
                          ? "border-emerald-500/50 bg-emerald-500/5 hover:border-emerald-450 hover:bg-emerald-500/10"
                          : isHigh
                            ? "border-rose-500/60 bg-rose-500/5 hover:border-rose-450 hover:bg-rose-500/10"
                            : isMed
                              ? "border-amber-500/60 bg-amber-500/5 hover:border-amber-450 hover:bg-amber-500/10"
                              : isNormal
                                ? "border-zinc-450 bg-zinc-500/5 hover:border-zinc-400 hover:bg-zinc-550/10"
                                : "border-indigo-500/60 bg-indigo-500/5 hover:border-indigo-450 hover:bg-indigo-500/10"
                    }`}
                  >
                    {/* Clickable priority badge in the corner (only the badge has pointer-events-auto) */}
                    <button
                      onMouseEnter={() => setHighlightedPinId(task.id)}
                      onMouseLeave={() => setHighlightedPinId(null)}
                      className={`absolute -top-3 -left-3 h-6 px-2 rounded-lg flex items-center justify-center border font-mono text-[9px] font-black shadow-lg transition-transform duration-200 group-hover:scale-110 active:scale-95 pointer-events-auto z-[83] cursor-pointer ${
                        isHighlighted
                          ? "bg-amber-400 text-amber-950 border-white"
                          : isDone
                            ? "bg-emerald-500 text-zinc-900 border-emerald-400"
                            : isHigh
                              ? "bg-rose-600 text-rose-100 border-rose-500"
                              : isMed
                                ? "bg-amber-500 text-zinc-900 border-amber-400"
                                : isNormal
                                  ? "bg-zinc-500 text-white border-zinc-400 dark:bg-zinc-600 dark:border-zinc-500"
                                  : "bg-indigo-600 text-indigo-100 border-indigo-500"
                      }`}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setSelectedTask(task);
                        setIsEditingTask(false);
                      }}
                    >
                      {isDone ? (
                        <Check className="w-3 h-3 stroke-[3]" />
                      ) : (
                        <>
                          <MapPin className="w-2.5 h-2.5 mr-0.5 animate-bounce" />
                          {task.priority.substring(0, 1).toUpperCase()}
                        </>
                      )}
                    </button>

                    {/* Elegant tooltip near the badge at the top-left corner, not covering the container center */}
                    <div className="absolute top-[-28px] left-0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-[84] whitespace-nowrap">
                      <div className="bg-zinc-950/95 text-zinc-200 backdrop-blur-md border border-zinc-800 px-2.5 py-1.5 rounded-xl text-[9px] font-medium shadow-xl">
                        {task.title}
                      </div>
                    </div>

                    {selectedTask?.id === task.id && (
                      <div 
                        className={`absolute z-[100] w-[350px] max-w-[90vw] bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-3xl shadow-2xl p-5 text-zinc-855 dark:text-zinc-200 pointer-events-auto select-none cursor-default ${
                          task.y !== undefined && task.y > 70 ? "bottom-8" : "top-8"
                        } ${
                          task.x !== undefined && task.x > 50 ? "right-[-12px]" : "left-[-12px]"
                        }`}
                        onClick={(e) => {
                          e.stopPropagation();
                        }}
                      >
                        <div className="flex items-center justify-between mb-4 border-b border-zinc-200 dark:border-zinc-900 pb-3">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-[9px] text-zinc-400 dark:text-zinc-500 font-bold uppercase tracking-wider">
                              ID: #{task.id.substring(0, 5)}
                            </span>
                            <span className="text-zinc-300 dark:text-zinc-700">|</span>
                            <span className="text-[10px] font-mono text-purple-650 dark:text-purple-400 font-bold capitalize">
                              {getTabLabel(task.tab)}
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              setSelectedTask(null);
                            }}
                            className="text-zinc-400 hover:text-zinc-900 dark:hover:text-white p-1 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-all cursor-pointer"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                        {renderTaskDetailContent(task)}
                      </div>
                    )}
                  </div>
                );
              }

              // Standard Point Pin Rendering
              const coords = resolvedCoords[task.id];
              if (coords && coords.visible === false) return null;
              return (
                <div
                  key={task.id}
                  id={`dev-pin-${task.id}`}
                  style={{
                    left: coords?.left !== undefined ? `${coords.left}px` : `${task.x}%`,
                    top: coords?.top !== undefined ? `${coords.top}px` : `${task.y}%`,
                  }}
                  onMouseEnter={() => setHighlightedPinId(task.id)}
                  onMouseLeave={() => setHighlightedPinId(null)}
                  className={`absolute -ml-3 -mt-3 pointer-events-auto cursor-pointer group transition-[transform,opacity] duration-300 ${
                    isHighlighted ? "z-[84] scale-110" : "z-[82]"
                  }`}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setSelectedTask(task);
                    setIsEditingTask(false);
                  }}
                >
                  {/* Glowing pulsing halo */}
                  <span className={`absolute inset-0 rounded-full w-7 h-7 -left-0.5 -top-0.5 animate-ping opacity-55 pointer-events-none ${
                    isDone 
                      ? "bg-emerald-400" 
                      : isHigh 
                        ? "bg-rose-500" 
                        : isMed 
                          ? "bg-amber-400" 
                          : isNormal
                            ? "bg-zinc-400"
                            : "bg-indigo-400"
                  }`} />

                  {/* Core Pin Dot */}
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center border font-mono text-[9px] font-black shadow-lg transition-all duration-300 relative ${
                      isHighlighted
                        ? "bg-amber-400 text-amber-950 border-white scale-145 ring-4 ring-amber-400/50"
                        : isDone
                          ? "bg-emerald-500 text-zinc-900 border-emerald-400 hover:scale-125 hover:ring-2 hover:ring-emerald-400/50"
                          : isHigh
                            ? "bg-rose-600 text-rose-100 border-rose-500 hover:scale-125 hover:ring-2 hover:ring-rose-400/50"
                            : isMed
                              ? "bg-amber-500 text-zinc-900 border-amber-400 hover:scale-125 hover:ring-2 hover:ring-amber-400/50"
                              : isNormal
                                ? "bg-zinc-500 text-white border-zinc-400 hover:scale-125 hover:ring-2 hover:ring-zinc-400/50 dark:bg-zinc-650 dark:border-zinc-500"
                                : "bg-indigo-600 text-indigo-100 border-indigo-500 hover:scale-125 hover:ring-2 hover:ring-indigo-400/50"
                    }`}
                  >
                    {isDone ? (
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    ) : (
                      task.priority.substring(0, 1).toUpperCase()
                    )}
                  </div>

                  {/* Micro Tooltip on Hover */}
                  <div className="absolute left-1/2 -translate-x-1/2 bottom-8 hidden group-hover:block z-50 bg-zinc-950/95 backdrop-blur-md px-3 py-1.5 rounded-xl border border-zinc-800 text-[10px] text-zinc-200 whitespace-nowrap shadow-2xl">
                    <span className="font-medium">{task.title}</span>
                  </div>

                  {selectedTask?.id === task.id && (
                    <div 
                      className={`absolute z-[100] w-[350px] max-w-[90vw] bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-3xl shadow-2xl p-5 text-zinc-855 dark:text-zinc-200 pointer-events-auto select-none cursor-default ${
                        task.y !== undefined && task.y > 70 ? "bottom-8" : "top-8"
                      } ${
                        task.x !== undefined && task.x > 50 ? "right-[-12px]" : "left-[-12px]"
                      }`}
                      onClick={(e) => {
                        e.stopPropagation();
                      }}
                    >
                      <div className="flex items-center justify-between mb-4 border-b border-zinc-200 dark:border-zinc-900 pb-3">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-[9px] text-zinc-400 dark:text-zinc-500 font-bold uppercase tracking-wider">
                            ID: #{task.id.substring(0, 5)}
                          </span>
                          <span className="text-zinc-300 dark:text-zinc-700">|</span>
                          <span className="text-[10px] font-mono text-purple-650 dark:text-purple-400 font-bold capitalize">
                            {getTabLabel(task.tab)}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setSelectedTask(null);
                          }}
                          className="text-zinc-400 hover:text-zinc-900 dark:hover:text-white p-1 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-all cursor-pointer"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                      {renderTaskDetailContent(task)}
                    </div>
                  )}
                </div>
              );
            })}

          {/* New Note / Pin Preview Highlight */}
          {newPinCoords && (
            (() => {
              const coords = resolvedCoords["new-pin-preview"];
              if (coords && coords.visible === false) return null;

              const isRegion = newPinDims !== null;
              
              if (isRegion) {
                return (
                  <div
                    id="dev-pin-preview"
                    style={{
                      left: coords?.left !== undefined ? `${coords.left}px` : `${newPinCoords.x}%`,
                      top: coords?.top !== undefined ? `${coords.top}px` : `${newPinCoords.y}%`,
                      width: coords?.width !== undefined ? `${coords.width}px` : `${newPinDims.w}%`,
                      height: coords?.height !== undefined ? `${coords.height}px` : `${newPinDims.h}%`,
                    }}
                    className="absolute border-2 rounded-2xl pointer-events-none z-[85] border-purple-500 bg-purple-500/5 shadow-[0_0_15px_rgba(139,92,246,0.25)] ring-2 ring-purple-500/10 animate-pulse"
                  />
                );
              } else {
                return (
                  <div
                    id="dev-pin-preview"
                    style={{
                      left: coords?.left !== undefined ? `${coords.left}px` : `${newPinCoords.x}%`,
                      top: coords?.top !== undefined ? `${coords.top}px` : `${newPinCoords.y}%`,
                    }}
                    className="absolute -ml-3 -mt-3 w-6 h-6 rounded-full border-2 border-purple-500 bg-purple-500/5 shadow-[0_0_10px_rgba(139,92,246,0.3)] pointer-events-none z-[85] animate-pulse flex items-center justify-center"
                  >
                    <div className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                  </div>
                );
              }
            })()
          )}
        </div>
      )}

      {/* Portaled elements to document.body to ensure zero viewport shifting */}
      {mounted && createPortal(
        <>
          {/* 1. Toggle Button Floating Bottom Right (Exclusive to local developer) */}
          <div className="fixed bottom-6 right-6 z-[99] pointer-events-auto dev-mode-ui">
            <button
              onClick={() => {
                setIsActive(prev => {
                  const next = !prev;
                  if (next) {
                    setIsSidebarOpen(true);
                    setIsSidebarMinimized(false);
                  } else {
                    setIsSidebarOpen(false);
                    setIsPinningMode(false);
                  }
                  return next;
                });
              }}
              className={`w-12 h-12 rounded-full border shadow-xl flex items-center justify-center cursor-pointer transition-colors duration-200 ${
                isActive 
                  ? "bg-purple-600 hover:bg-purple-700 text-white border-purple-500" 
                  : "bg-zinc-900 dark:bg-zinc-800 text-zinc-300 dark:text-zinc-200 border-zinc-700 dark:border-zinc-700 hover:text-white"
              }`}
              title="Alternar Modo Desarrollador (Ctrl+Shift+D)"
            >
              <Settings className={`w-5 h-5 ${isActive ? "animate-none" : "hover:animate-spin"}`} />
            </button>
          </div>

          {/* 2. Mouse Crosshair Overlays during Pinning Mode */}
          {isActive && isPinningMode && (
            <div
              className={`fixed inset-0 z-[90] cursor-crosshair transition-colors duration-300 pointer-events-none select-none ${
                isDragging ? "bg-zinc-950/35 backdrop-blur-[0.5px]" : "bg-purple-950/5"
              }`}
            >
              {/* 2.1: Smart Snapping element outline outline */}
              {snappedBounds && !isDragging && (
                <div
                  style={{
                    left: `${snappedBounds.left}px`,
                    top: `${snappedBounds.top}px`,
                    width: `${snappedBounds.width}px`,
                    height: `${snappedBounds.height}px`,
                  }}
                  className="absolute border-2 border-purple-500 bg-purple-500/5 backdrop-blur-[0.5px] pointer-events-none z-[85] rounded-2xl shadow-[0_0_15px_rgba(139,92,246,0.3)] transition-all duration-150"
                />
              )}

              {/* 2.2: Drag Selection marquee rectangle */}
              {isDragging && dragRect && (
                <div
                  style={{
                    left: `${dragRect.left}px`,
                    top: `${dragRect.top}px`,
                    width: `${dragRect.width}px`,
                    height: `${dragRect.height}px`,
                  }}
                  className="absolute border-2 border-dashed border-purple-400 bg-purple-500/10 pointer-events-none z-[89] rounded-2xl shadow-[0_0_20px_rgba(167,139,250,0.4)]"
                >
                  <div className="absolute bottom-2 right-2 bg-zinc-950/90 text-[8px] font-mono text-zinc-350 px-1.5 py-0.5 rounded-md border border-zinc-800">
                    {dragRect.width.toFixed(0)}px × {dragRect.height.toFixed(0)}px
                  </div>
                </div>
              )}

              {/* Top Banner Guide with Sintiens premium styling */}
              <div className="absolute top-20 left-1/2 -translate-x-1/2 bg-white/90 dark:bg-zinc-950/90 backdrop-blur-md px-5 py-3 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-xl flex items-center gap-3.5 z-[100] pointer-events-auto text-xs font-sans text-zinc-850 dark:text-zinc-200 dev-mode-ui">
                <div className="w-2.5 h-2.5 rounded-full bg-purple-500 animate-ping shrink-0" />
                <MapPin className="w-4 h-4 text-purple-600 dark:text-purple-400 shrink-0" />
                <span className="font-light">
                  {isDragging ? "Arrastra para recortar el área..." : "Modo Pin Activo | Haz clic/arrastra para posicionar (escribe en el panel lateral)"}
                </span>
                <span className="text-zinc-350 dark:text-zinc-700">|</span>
                <button
                  onMouseDown={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setIsPinningMode(false);
                    setIsCreatingInline(false);
                    setIsSidebarOpen(true);
                  }}
                  className="text-purple-600 dark:text-purple-400 hover:underline cursor-pointer font-bold text-xs"
                >
                  Cancelar
                </button>
              </div>

              {/* Mouse Crosshair dot helper (Only visible when not snapping or dragging) */}
              {!snappedBounds && !isDragging && mainRef.current && (
                <div
                  style={{
                    left: `${mousePos.x + mainRef.current.getBoundingClientRect().left}px`,
                    top: `${mousePos.y + mainRef.current.getBoundingClientRect().top}px`,
                  }}
                  className="absolute w-6 h-6 -ml-3 -mt-3 rounded-full border-2 border-purple-500 bg-purple-500/20 pointer-events-none flex items-center justify-center shadow-inner"
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                </div>
              )}
            </div>
          )}

          {/* 4. Collapsible Dev Sidebar / Floating Panel: Fixed Sliding or Draggable Floating */}
          <AnimatePresence>
            {/* 4.A SIDEBAR LAYOUT MODE (EXPANDED) */}
            {isActive && layoutMode === "sidebar" && !isSidebarMinimized && (
              <motion.div
                ref={sidebarRef}
                initial={{ x: "100%" }}
                animate={{ x: isSidebarOpen ? 0 : "100%" }}
                exit={{ x: "100%" }}
                transition={{ type: "spring", damping: 26, stiffness: 220 }}
                className="fixed right-0 top-0 bottom-0 z-[98] w-[430px] max-w-[calc(100vw-40px)] h-screen bg-white dark:bg-zinc-950 border-l border-zinc-200/85 dark:border-zinc-900/90 shadow-2xl flex flex-col justify-between text-zinc-900 dark:text-zinc-100 pointer-events-auto select-none dev-mode-ui rounded-l-3xl overflow-visible transition-[background-color,border-color] duration-350"
              >
                {/* Ambient upper border glow inside the window */}
                <div className="absolute top-0 left-0 right-0 h-40 bg-radial from-purple-500/5 dark:from-purple-500/10 via-transparent to-transparent pointer-events-none -z-10" />

                {/* Sidebar Header */}
                <div className="p-5 border-b border-zinc-200/60 dark:border-zinc-900 flex items-center justify-between shrink-0">
                  <div>
                    <h3 className="font-bold text-sm tracking-tight text-zinc-950 dark:text-white flex items-center gap-2">
                      <ClipboardList className="w-4 h-4 text-purple-655 dark:text-purple-400" />
                      Tablero de Desarrollo
                    </h3>
                    <p className="text-[10px] font-mono text-zinc-500 mt-0.5">
                      Comentarios y tareas pendientes locales
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {/* Pop out to floating mode */}
                    <button
                      onClick={() => {
                        setLayoutMode("floating");
                        setIsSidebarOpen(true);
                      }}
                      className="text-zinc-400 hover:text-purple-650 dark:hover:text-purple-400 p-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-xl transition-colors cursor-pointer"
                      title="Cambiar a Ventana Flotante"
                    >
                      <Layers className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => setIsSidebarMinimized(true)}
                      className="text-zinc-400 hover:text-zinc-900 dark:hover:text-white p-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-xl transition-colors cursor-pointer"
                      title="Minimizar Tablero"
                    >
                      <Minimize2 className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => {
                        setIsActive(false);
                        setIsSidebarOpen(false);
                        setIsPinningMode(false);
                      }}
                      className="text-zinc-400 hover:text-rose-500 dark:text-zinc-555 dark:hover:text-rose-400 p-1.5 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-xl transition-colors cursor-pointer"
                      title="Desactivar Modo Desarrollador"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Panel Body */}
                {renderPanelBody()}
              </motion.div>
            )}

            {/* 4.B DRAGGABLE FLOATING WINDOW LAYOUT MODE (EXPANDED) */}
            {isActive && layoutMode === "floating" && isSidebarOpen && !isSidebarMinimized && (
              <motion.div
                layout
                ref={sidebarRef}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                style={sidebarPos ? { 
                  left: `${sidebarPos.x}px`, 
                  top: `${sidebarPos.y}px`, 
                  bottom: 'auto', 
                  right: 'auto',
                  position: 'fixed'
                } : {}}
                className={`fixed z-[97] bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 shadow-2xl overflow-hidden pointer-events-auto select-none transition-[background-color,border-color,opacity,shadow] duration-300 dev-mode-ui w-[430px] max-w-[calc(100vw-2rem)] h-[620px] max-h-[80vh] rounded-3xl flex flex-col justify-between text-zinc-900 dark:text-zinc-100 ${
                  !sidebarPos ? "bottom-22 right-4 sm:right-6" : ""
                }`}
              >
                {/* Ambient upper border glow inside the window */}
                <div className="absolute top-0 left-0 right-0 h-40 bg-radial from-purple-500/5 dark:from-purple-500/10 via-transparent to-transparent pointer-events-none -z-10" />

                {/* Sidebar Header */}
                <div 
                  onMouseDown={handleHeaderMouseDown}
                  className="p-5 border-b border-zinc-200/60 dark:border-zinc-900 flex items-center justify-between cursor-grab active:cursor-grabbing shrink-0"
                  title="Arrastra desde el cabecero para mover"
                >
                  <div>
                    <h3 className="font-bold text-sm tracking-tight text-zinc-950 dark:text-white flex items-center gap-2">
                      <ClipboardList className="w-4 h-4 text-purple-655 dark:text-purple-400" />
                      Tablero de Desarrollo
                    </h3>
                    <p className="text-[10px] font-mono text-zinc-500 mt-0.5">
                      Comentarios y tareas pendientes locales
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {/* Dock to sidebar mode */}
                    <button
                      onClick={() => {
                        setLayoutMode("sidebar");
                        setIsSidebarOpen(true);
                      }}
                      className="text-zinc-400 hover:text-purple-650 dark:hover:text-purple-400 p-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-xl transition-colors cursor-pointer"
                      title="Anclar a Barra Lateral"
                    >
                      <Layers className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => setIsSidebarMinimized(true)}
                      className="text-zinc-400 hover:text-zinc-900 dark:hover:text-white p-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-xl transition-colors cursor-pointer"
                      title="Minimizar Tablero"
                    >
                      <Minimize2 className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => {
                        setIsActive(false);
                        setIsSidebarOpen(false);
                        setIsPinningMode(false);
                      }}
                      className="text-zinc-400 hover:text-rose-500 dark:text-zinc-555 dark:hover:text-rose-400 p-1.5 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-xl transition-colors cursor-pointer"
                      title="Desactivar Modo Desarrollador"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Panel Body */}
                {renderPanelBody()}
              </motion.div>
            )}

            {/* 4.C MINIMIZED CAPSULE LAYOUT MODE */}
            {isActive && isSidebarMinimized && (
              <motion.div
                layout
                ref={sidebarRef}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                style={layoutMode === "floating" && sidebarPos ? { 
                  left: `${sidebarPos.x}px`, 
                  top: `${sidebarPos.y}px`, 
                  bottom: 'auto', 
                  right: 'auto',
                  position: 'fixed'
                } : {}}
                className={`fixed z-[97] bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 shadow-2xl overflow-hidden pointer-events-auto select-none transition-[background-color,border-color,opacity,shadow] duration-300 dev-mode-ui w-[380px] max-w-[calc(100vw-2rem)] rounded-2xl p-3 flex items-center justify-between ${
                  layoutMode === "sidebar" || !sidebarPos ? "bottom-22 right-6" : ""
                }`}
              >
                {/* Ambient light glow */}
                <div className="absolute inset-0 bg-radial from-purple-500/5 dark:from-purple-500/10 via-transparent to-transparent pointer-events-none -z-10" />

                {/* Drag Handle / Title */}
                <div 
                  onMouseDown={layoutMode === "floating" ? handleHeaderMouseDown : undefined}
                  className={`flex items-center gap-2.5 flex-1 min-w-0 pr-3 ${layoutMode === "floating" ? "cursor-grab active:cursor-grabbing" : ""}`}
                  title={layoutMode === "floating" ? "Arrastra para mover" : undefined}
                >
                  <ClipboardList className="w-4.5 h-4.5 text-purple-655 dark:text-purple-400 shrink-0" />
                  <div className="flex flex-col min-w-0">
                    <h4 className="font-bold text-xs tracking-tight text-zinc-950 dark:text-white flex items-center gap-1.5 leading-none">
                      Tablero Dev
                      <span className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-pulse" />
                    </h4>
                    {tasks.filter(t => t && t.status !== 'done').length > 0 ? (
                      <span className="text-[9px] font-mono text-zinc-400 dark:text-zinc-500 truncate mt-1">
                        {tasks.filter(t => t && t.status !== 'done').length} pend. | Última: "{tasks.filter(t => t && t.status !== 'done')[0]?.title || ''}"
                      </span>
                    ) : (
                      <span className="text-[9px] font-mono text-zinc-455 dark:text-zinc-555 mt-1">
                        Sin notas pendientes
                      </span>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={() => setIsSidebarMinimized(false)}
                    className="text-zinc-400 hover:text-zinc-900 dark:hover:text-white p-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-xl transition-colors cursor-pointer"
                    title="Maximizar Tablero"
                  >
                    <Maximize2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* 5. Modal: Create task (Premium glassmorphic styled to match Sintiens) */}
          <AnimatePresence>
            {isCreateModalOpen && (
              <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 pointer-events-auto dev-mode-ui">
                {/* Backdrop */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 bg-zinc-950/70 backdrop-blur-sm"
                  onClick={() => {
                    setIsCreateModalOpen(false);
                    setNewPinCoords(null);
                    setIsSidebarOpen(true);
                  }}
                />

                {/* Modal Body */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: 15 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 15 }}
                  className="relative w-full max-w-md bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800/80 rounded-3xl shadow-2xl p-6 text-zinc-800 dark:text-zinc-200 select-none overflow-hidden"
                >
                  {/* Premium decorative side accent glow */}
                  <div className="absolute top-0 right-0 w-36 h-36 bg-purple-500/10 dark:from-purple-500/10 rounded-full blur-3xl -z-10 pointer-events-none" />

                  <div className="flex items-center justify-between mb-5 border-b border-zinc-200 dark:border-zinc-900 pb-3">
                    <h3 className="text-sm font-bold text-zinc-900 dark:text-white flex items-center gap-1.5">
                      <MapPin className="w-4 h-4 text-purple-650 dark:text-purple-400" />
                      {isCreatingGeneral 
                        ? "Nueva Nota General" 
                        : `Fijar Pin (${getTabLabel(formTab)})`}
                    </h3>
                    <button
                      onClick={() => {
                        setIsCreateModalOpen(false);
                        setNewPinCoords(null);
                        setIsSidebarOpen(true);
                      }}
                      className="text-zinc-400 hover:text-zinc-900 dark:hover:text-white p-1 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-all cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <form onSubmit={handleCreateTask} className="space-y-4 font-sans text-xs">
                    {/* Title */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-mono text-zinc-400 dark:text-zinc-500 font-bold uppercase tracking-wider block">
                        Título del Hito / Nota <span className="text-rose-450">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Ej. Revisar espaciado del botón en móviles"
                        value={formTitle}
                        onChange={(e) => setFormTitle(e.target.value)}
                        className="w-full bg-white dark:bg-zinc-950/60 border border-zinc-300 dark:border-zinc-800 focus:border-zinc-500 dark:focus:border-zinc-700 focus:ring-1 focus:ring-zinc-200 dark:focus:ring-zinc-800 rounded-2xl px-4 py-3 text-xs text-zinc-900 dark:text-white outline-none transition-all placeholder:text-zinc-400 dark:placeholder-zinc-700"
                      />
                    </div>

                    {/* Description */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-mono text-zinc-400 dark:text-zinc-500 font-bold uppercase tracking-wider block">
                        Descripción o Comentario
                      </label>
                      <textarea
                        placeholder="Detalles sobre lo que se debe cambiar, corregir o refinar en esta sección específica..."
                        value={formDesc}
                        onChange={(e) => setFormDesc(e.target.value)}
                        rows={3}
                        className="w-full bg-white dark:bg-zinc-950/60 border border-zinc-300 dark:border-zinc-800 focus:border-zinc-500 dark:focus:border-zinc-700 focus:ring-1 focus:ring-zinc-200 dark:focus:ring-zinc-800 rounded-2xl px-4 py-3 text-xs text-zinc-900 dark:text-white outline-none transition-all placeholder:text-zinc-400 dark:placeholder-zinc-700 resize-none leading-relaxed"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      {/* Priority */}
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-mono text-zinc-400 dark:text-zinc-500 font-bold uppercase tracking-wider block">
                          Prioridad
                        </label>
                        <select
                          value={formPriority}
                          onChange={(e) => setFormPriority(e.target.value as any)}
                          className="w-full bg-white dark:bg-zinc-950/60 border border-zinc-300 dark:border-zinc-800 rounded-2xl px-3 py-3 text-xs text-zinc-700 dark:text-zinc-350 focus:outline-none focus:border-purple-500"
                        >
                          <option value="low">Baja (Color Azul)</option>
                          <option value="normal">Normal (Color Gris)</option>
                          <option value="medium">Media (Color Naranja)</option>
                          <option value="high">Alta (Color Rojo)</option>
                        </select>
                      </div>

                      {/* Section/Tab confirmation */}
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-mono text-zinc-400 dark:text-zinc-500 font-bold uppercase tracking-wider block">
                          Sección Vinculada
                        </label>
                        <select
                          value={formTab}
                          disabled={!isCreatingGeneral}
                          onChange={(e) => setFormTab(e.target.value)}
                          className="w-full bg-white dark:bg-zinc-950/60 border border-zinc-300 dark:border-zinc-800 rounded-2xl px-3 py-3 text-xs text-zinc-700 dark:text-zinc-350 focus:outline-none focus:border-purple-500 disabled:opacity-50"
                        >
                          <option value="general">General (Sin pin)</option>
                          <option value="grafo">Conceptos</option>
                          <option value="cronologia">Cronología</option>
                          <option value="dialectica">Tesis</option>
                          <option value="calculadora">Calculadora</option>
                          <option value="validador">Sintiens IA</option>
                        </select>
                      </div>
                    </div>

                    {!isCreatingGeneral && newPinCoords && (
                      <div className="bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-900 rounded-xl p-3 text-[9px] font-mono text-zinc-500 flex flex-col gap-1.5 transition-colors">
                        <div className="flex items-center justify-between">
                          <span className="flex items-center gap-1"><Layers className="w-3.5 h-3.5 text-zinc-400" /> Posición inicial:</span>
                          <span className="text-purple-650 dark:text-purple-400 font-bold">
                            X: {newPinCoords.x.toFixed(1)}% / Y: {newPinCoords.y.toFixed(1)}%
                          </span>
                        </div>
                        {newPinDims && (
                          <div className="flex items-center justify-between border-t border-zinc-150 dark:border-zinc-900 pt-1.5">
                            <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-zinc-400" /> Área capturada:</span>
                            <span className="text-purple-650 dark:text-purple-400 font-bold">
                              Ancho: {newPinDims.w.toFixed(1)}% / Alto: {newPinDims.h.toFixed(1)}%
                            </span>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex justify-end gap-2 pt-3 border-t border-zinc-200 dark:border-zinc-900">
                      <button
                        type="button"
                        onClick={() => {
                          setIsCreateModalOpen(false);
                          setNewPinCoords(null);
                          setIsSidebarOpen(true);
                        }}
                        className="bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-900 dark:hover:bg-zinc-850 text-zinc-700 dark:text-zinc-350 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer active:scale-95"
                      >
                        Cancelar
                      </button>
                      <button
                        type="submit"
                        className="bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-zinc-200 text-white dark:text-zinc-950 font-bold px-5 py-2.5 rounded-2xl text-xs transition-all cursor-pointer active:scale-95"
                      >
                        Crear Nota
                      </button>
                    </div>
                  </form>
                </motion.div>
              </div>
            )}
            </AnimatePresence>

          {/* 6. AI Preview Mode Floating Top Bar */}
          {activePreviewTaskId && (() => {
            const activePreviewTask = tasks.find(t => t.id === activePreviewTaskId);
            return (
              <div className="fixed top-0 left-0 right-0 z-[9999] bg-zinc-950/90 dark:bg-zinc-950/95 backdrop-blur-xl border-b border-purple-500/25 px-6 py-3.5 shadow-[0_10px_40px_rgba(0,0,0,0.5)] flex items-center justify-between text-white font-sans transition-all select-none dev-mode-ui animate-in slide-in-from-top duration-300">
                <div className="flex items-center gap-3.5">
                  <div className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500 shadow-[0_0_10px_#10b981]"></span>
                  </div>
                  <div className="flex flex-col text-left">
                    <span className="text-[9px] font-black font-mono tracking-widest text-purple-400 uppercase">MODO PREVISUALIZACIÓN ACTIVO</span>
                    <span className="text-xs font-bold text-zinc-100 max-w-sm sm:max-w-lg md:max-w-xl truncate">
                      {activePreviewTask ? activePreviewTask.title.replace(/\[IA:.*\]\s*/, "") : "Cargando propuesta de la IA..."}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2.5">
                  <button
                    onClick={() => handleApproveTask(activePreviewTaskId)}
                    disabled={isSubmittingPreviewAction}
                    className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold px-4 py-2 rounded-xl text-xs transition-all cursor-pointer flex items-center gap-1.5 active:scale-95 shadow-[0_2px_8px_rgba(16,185,129,0.2)] border border-emerald-500/20"
                  >
                    <Check className="w-3.5 h-3.5 stroke-[3]" /> Quedármela
                  </button>
                  <button
                    onClick={() => setFeedbackTaskId(activePreviewTaskId)}
                    disabled={isSubmittingPreviewAction}
                    className="bg-zinc-800 hover:bg-zinc-700 disabled:opacity-50 text-zinc-100 font-bold px-4 py-2 rounded-xl text-xs transition-all cursor-pointer flex items-center gap-1.5 active:scale-95 border border-zinc-700"
                  >
                    <MessageSquare className="w-3.5 h-3.5 text-purple-400" /> Solicitar Ajustes
                  </button>
                  <button
                    onClick={() => handleRejectTask(activePreviewTaskId)}
                    disabled={isSubmittingPreviewAction}
                    className="bg-rose-950/40 hover:bg-rose-900/60 disabled:opacity-50 text-rose-300 font-bold px-4 py-2 rounded-xl text-xs transition-all cursor-pointer flex items-center gap-1.5 active:scale-95 border border-rose-500/20"
                  >
                    <X className="w-3.5 h-3.5" /> Descartar
                  </button>
                </div>
              </div>
            );
          })()}

          {/* 7. AI Preview Feedback Dialog Overlay */}
          {feedbackTaskId && (() => {
            const activeTask = tasks.find(t => t.id === feedbackTaskId);
            return (
              <div className="fixed inset-0 z-[10000] bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 font-sans select-none dev-mode-ui">
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: 15 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 15 }}
                  className="bg-zinc-900 border border-zinc-850 rounded-3xl p-6 w-full max-w-md shadow-2xl space-y-4 text-left relative overflow-hidden"
                >
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 to-indigo-500" />
                  
                  <div className="space-y-1.5">
                    <h4 className="text-sm font-bold text-white flex items-center gap-2">
                      <MessageSquare className="w-4 h-4 text-purple-400" /> 💡 Solicitar Ajustes a la IA
                    </h4>
                    <p className="text-[10px] text-zinc-400 leading-relaxed font-light">
                      Describe los cambios que quieres en la propuesta para <strong className="text-zinc-200">"{activeTask ? activeTask.title.replace(/\[IA:.*\]\s*/, "") : ""}"</strong>. La IA leerá tus comentarios y aplicará los ajustes.
                    </p>
                  </div>

                  <div className="space-y-1.5">
                    <textarea
                      required
                      placeholder="Ej: El botón funciona genial, pero me gustaría que el fondo sea violeta oscuro (#4c1d95) en lugar de azul, y el padding sea un poco más grande."
                      value={previewFeedbackText}
                      onChange={(e) => setPreviewFeedbackText(e.target.value)}
                      rows={4}
                      className="w-full bg-zinc-950 border border-zinc-800 focus:border-purple-500/50 rounded-2xl p-4 text-xs text-white placeholder-zinc-600 outline-none transition-all resize-none leading-relaxed"
                    />
                  </div>

                  <div className="flex justify-end gap-2.5 pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setFeedbackTaskId(null);
                        setPreviewFeedbackText("");
                      }}
                      className="bg-zinc-800 hover:bg-zinc-750 text-zinc-350 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer active:scale-95"
                    >
                      Cancelar
                    </button>
                    <button
                      type="button"
                      onClick={() => handleFeedbackTask(feedbackTaskId, previewFeedbackText)}
                      className="bg-white hover:bg-zinc-100 text-zinc-950 font-bold px-5 py-2.5 rounded-2xl text-xs transition-all cursor-pointer active:scale-95 flex items-center gap-1.5"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-purple-600" /> Enviar Feedback
                    </button>
                  </div>
                </motion.div>
              </div>
            );
          })()}
        </>,
        document.body
      )}
    </>
  );
}
