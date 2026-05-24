import React, { useEffect, useRef, useState } from "react";
import { CORE_NODES, NodeDetail } from "../types";
import { Info, HelpCircle, Activity, Globe, Scale, Maximize2, Minimize2, ExternalLink, BookOpen, ChevronDown, ChevronUp } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import TextRenderer from "./TextRenderer";

interface GraphNode {
  id: string;
  category: "sintiencia" | "historia" | "ecologia" | "etica";
  title: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  nodeRef: NodeDetail;
}

interface GraphLink {
  source: string;
  target: string;
}

export default function NetworkGraph() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const [nodes, setNodes] = useState<GraphNode[]>([]);
  const [links, setLinks] = useState<GraphLink[]>([]);
  const [selectedNode, setSelectedNode] = useState<NodeDetail | null>(CORE_NODES[0]);
  const [hoveredNode, setHoveredNode] = useState<GraphNode | null>(null);
  const [draggedNode, setDraggedNode] = useState<GraphNode | null>(null);
  const [dimensions, setDimensions] = useState({ width: 600, height: 400 });
  const [isDark, setIsDark] = useState(() => document.documentElement.classList.contains("dark"));
  const isMobileDevice = dimensions.width < 768;
  const [isMobileViewport, setIsMobileViewport] = useState(() => typeof window !== "undefined" ? window.innerWidth < 1024 : false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobileViewport(window.innerWidth < 1024);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);
  
  // Custom states for premium interactive features
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isBibliographyOpen, setIsBibliographyOpen] = useState(false);

  // Collapse bibliography when selected node changes
  useEffect(() => {
    setIsBibliographyOpen(false);
  }, [selectedNode]);

  // Sync isDark state dynamically with document.documentElement class mutations (theme switcher)
  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsDark(document.documentElement.classList.contains("dark"));
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);

  // Initialize nodes and links
  useEffect(() => {
    const initialNodes: GraphNode[] = CORE_NODES.map((node, i) => {
      let cx = 300;
      let cy = 200;
      
      if (node.category === "sintiencia") { cx = 150; cy = 120; }
      else if (node.category === "historia") { cx = 450; cy = 120; }
      else if (node.category === "ecologia") { cx = 150; cy = 280; }
      else if (node.category === "etica") { cx = 450; cy = 280; }

      const angle = (i * 0.7) % (Math.PI * 2);
      const dist = 40 + Math.random() * 30;

      return {
        id: node.id,
        category: node.category,
        title: node.title,
        x: cx + Math.cos(angle) * dist,
        y: cy + Math.sin(angle) * dist,
        vx: 0,
        vy: 0,
        radius: 12,
        nodeRef: node
      };
    });

    const extractedLinks: GraphLink[] = [];
    CORE_NODES.forEach((node) => {
      node.connections.forEach((targetId) => {
        const linkExists = extractedLinks.some(
          (l) => (l.source === node.id && l.target === targetId) || 
                 (l.source === targetId && l.target === node.id)
        );
        if (!linkExists && CORE_NODES.some((n) => n.id === targetId)) {
          extractedLinks.push({ source: node.id, target: targetId });
        }
      });
    });

    setNodes(initialNodes);
    setLinks(extractedLinks);
  }, []);

  // Set up ResizeObserver to handle canvas resizing safely without fixed calculations
  useEffect(() => {
    if (!containerRef.current) return;

    const resizeObserver = new ResizeObserver((entries) => {
      if (!entries || entries.length === 0) return;
      const { width, height } = entries[0].contentRect;
      window.requestAnimationFrame(() => {
        setDimensions({
          width: Math.max(width, 300),
          height: Math.max(height, isFullscreen ? 500 : 420)
        });
      });
    });

    resizeObserver.observe(containerRef.current);
    return () => resizeObserver.disconnect();
  }, [isFullscreen]);

  // Physics loop (force-directed layout simulation with rigid collision prevention)
  useEffect(() => {
    if (nodes.length === 0) return;

    let animationFrameId: number;

    const step = () => {
      setNodes((currentNodes) => {
        const nextNodes = currentNodes.map((n) => ({ ...n }));
        const isMobile = dimensions.width < 768;

        // 1. Repulsion between all nodes
        const repulsionRadius = isMobile ? 140 : 220; 
        for (let i = 0; i < nextNodes.length; i++) {
          const nodeA = nextNodes[i];
          for (let j = i + 1; j < nextNodes.length; j++) {
            const nodeB = nextNodes[j];
            const dx = nodeB.x - nodeA.x;
            const dy = nodeB.y - nodeA.y;
            const dist = Math.sqrt(dx * dx + dy * dy) || 1;
            
            if (dist < repulsionRadius) {
              const force = (repulsionRadius - dist) * (isMobile ? 0.025 : 0.035);
              const fx = (dx / dist) * force;
              const fy = (dy / dist) * force;
              
              if (draggedNode?.id !== nodeA.id) {
                nodeA.vx -= fx;
                nodeA.vy -= fy;
              }
              if (draggedNode?.id !== nodeB.id) {
                nodeB.vx += fx;
                nodeB.vy += fy;
              }
            }
          }
        }

        // 2. Attraction of links
        const targetDist = isMobile ? 90 : 130;
        links.forEach((link) => {
          const sourceNode = nextNodes.find((n) => n.id === link.source);
          const targetNode = nextNodes.find((n) => n.id === link.target);
          
          if (sourceNode && targetNode) {
            const dx = targetNode.x - sourceNode.x;
            const dy = targetNode.y - sourceNode.y;
            const dist = Math.sqrt(dx * dx + dy * dy) || 1;
            
            const force = (dist - targetDist) * 0.025;
            const fx = (dx / dist) * force;
            const fy = (dy / dist) * force;

            if (draggedNode?.id !== sourceNode.id) {
              sourceNode.vx += fx;
              sourceNode.vy += fy;
            }
            if (draggedNode?.id !== targetNode.id) {
              targetNode.vx -= fx;
              targetNode.vy -= fy;
            }
          }
        });

        // 3. Gravity towards cluster centers
        const multXLeft = isMobile ? 0.3 : 0.25;
        const multXRight = isMobile ? 0.7 : 0.75;
        const multYTop = isMobile ? 0.3 : 0.28;
        const multYBottom = isMobile ? 0.7 : 0.72;
        nextNodes.forEach((node) => {
          let cx = dimensions.width / 2;
          let cy = dimensions.height / 2;

          if (node.category === "sintiencia") { cx = dimensions.width * multXLeft; cy = dimensions.height * multYTop; }
          else if (node.category === "historia") { cx = dimensions.width * multXRight; cy = dimensions.height * multYTop; }
          else if (node.category === "ecologia") { cx = dimensions.width * multXLeft; cy = dimensions.height * multYBottom; }
          else if (node.category === "etica") { cx = dimensions.width * multXRight; cy = dimensions.height * multYBottom; }

          const dx = cx - node.x;
          const dy = cy - node.y;
          node.vx += dx * 0.008;
          node.vy += dy * 0.008;

          node.vx *= 0.72;
          node.vy *= 0.72;

          if (draggedNode?.id !== node.id) {
            node.x += node.vx;
            node.y += node.vy;
          }
        });

        // 4. Hard Collision Constraint (Rigid body overlap prevention)
        const minCollisionDist = isMobile ? 95 : 135; // Prevents HTML card overlaps perfectly
        for (let k = 0; k < 3; k++) {
          for (let i = 0; i < nextNodes.length; i++) {
            const nodeA = nextNodes[i];
            for (let j = i + 1; j < nextNodes.length; j++) {
              const nodeB = nextNodes[j];
              const dx = nodeB.x - nodeA.x;
              const dy = nodeB.y - nodeA.y;
              const dist = Math.sqrt(dx * dx + dy * dy) || 1;

              if (dist < minCollisionDist) {
                const overlap = minCollisionDist - dist;
                const px = (dx / dist) * overlap * 0.5;
                const py = (dy / dist) * overlap * 0.5;

                if (draggedNode?.id === nodeA.id) {
                  nodeB.x += px * 2;
                  nodeB.y += py * 2;
                } else if (draggedNode?.id === nodeB.id) {
                  nodeA.x -= px * 2;
                  nodeA.y -= py * 2;
                } else {
                  nodeA.x -= px;
                  nodeA.y -= py;
                  nodeB.x += px;
                  nodeB.y += py;
                }
              }
            }
          }
        }

        // 5. Apply boundaries strictly
        const marginX = isMobile ? 60 : 85;
        const marginY = isMobile ? 35 : 45;
        nextNodes.forEach((node) => {
          node.x = Math.max(marginX, Math.min(dimensions.width - marginX, node.x));
          node.y = Math.max(marginY, Math.min(dimensions.height - marginY, node.y));
        });

        return nextNodes;
      });

      animationFrameId = requestAnimationFrame(step);
    };

    animationFrameId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(animationFrameId);
  }, [links, draggedNode, dimensions]);

  // Render Loop for Background Canvas (high-DPI, glowing lines, flow particles)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // High-DPI Scaling logic
    const dpr = window.devicePixelRatio || 1;
    canvas.width = dimensions.width * dpr;
    canvas.height = dimensions.height * dpr;
    canvas.style.width = `${dimensions.width}px`;
    canvas.style.height = `${dimensions.height}px`;

    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, dimensions.width, dimensions.height);
    ctx.lineCap = "round";

    // 1. Draw connections / links
    links.forEach((link) => {
      const source = nodes.find((n) => n.id === link.source);
      const target = nodes.find((n) => n.id === link.target);

      if (source && target) {
        // Enforce active category filter
        if (activeCategoryFilter) {
          if (source.category !== activeCategoryFilter && target.category !== activeCategoryFilter) {
            return; // Don't draw line at all if not related to filter
          }
        }

        const isSelectedLink = selectedNode && (source.id === selectedNode.id || target.id === selectedNode.id);
        const isHoverLink = hoveredNode && (source.id === hoveredNode.id || target.id === hoveredNode.id);
        const isHighlight = isSelectedLink || isHoverLink;

        const grad = ctx.createLinearGradient(source.x, source.y, target.x, target.y);
        
        const getCatColor = (cat: string, opacity: number) => {
          if (cat === "sintiencia") return `rgba(239, 68, 68, ${opacity})`;
          if (cat === "ecologia") return `rgba(16, 185, 129, ${opacity})`;
          if (cat === "historia") return `rgba(59, 130, 246, ${opacity})`;
          return `rgba(168, 85, 247, ${opacity})`; // purple-500 for etica
        };

        let opacity = isDark ? 0.12 : 0.06;
        if (isHighlight) {
          opacity = isSelectedLink ? 0.75 : 0.55;
        } else if (selectedNode || hoveredNode) {
          // Dim other connections when a node is highlighted
          opacity = isDark ? 0.03 : 0.015;
        }

        grad.addColorStop(0, getCatColor(source.category, opacity));
        grad.addColorStop(1, getCatColor(target.category, opacity));

        ctx.strokeStyle = grad;
        ctx.lineWidth = isHighlight ? 2.5 : 1.2;

        ctx.beginPath();
        ctx.moveTo(source.x, source.y);
        ctx.lineTo(target.x, target.y);
        ctx.stroke();

        // Draw flowing particles along highlighted links
        if (isHighlight) {
          const time = Date.now() * 0.0015;
          const count = 2;
          for (let p = 0; p < count; p++) {
            const ratio = (time + p / count) % 1;
            const flowRatio = (source.id === selectedNode?.id || source.id === hoveredNode?.id) ? ratio : (1 - ratio);
            
            const px = source.x + (target.x - source.x) * flowRatio;
            const py = source.y + (target.y - source.y) * flowRatio;

            ctx.fillStyle = getCatColor(source.category, 0.95);
            ctx.shadowBlur = 6;
            ctx.shadowColor = source.category === "sintiencia" ? "#ef4444" :
                             source.category === "ecologia" ? "#10b981" :
                             source.category === "historia" ? "#3b82f6" : "#a855f7";

            ctx.beginPath();
            ctx.arc(px, py, 2.5, 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowBlur = 0; // reset shadow immediately
          }
        }
      }
    });

    // 2. Draw canvas glows behind highlighted nodes
    nodes.forEach((node) => {
      const isSelected = selectedNode?.id === node.id;
      const isHovered = hoveredNode?.id === node.id;
      const isFilteredOut = activeCategoryFilter && node.category !== activeCategoryFilter;

      if ((isSelected || isHovered) && !isFilteredOut) {
        let nodeColorHex = "#ffffff";
        if (node.category === "sintiencia") nodeColorHex = "#ef4444";
        else if (node.category === "ecologia") nodeColorHex = "#10b981";
        else if (node.category === "historia") nodeColorHex = "#3b82f6";
        else if (node.category === "etica") nodeColorHex = "#a855f7";

        ctx.shadowBlur = isSelected ? 30 : 15;
        ctx.shadowColor = nodeColorHex;
        
        ctx.fillStyle = isSelected 
          ? (node.category === "sintiencia" ? "rgba(239, 68, 68, 0.12)" :
             node.category === "ecologia" ? "rgba(16, 185, 129, 0.12)" :
             node.category === "historia" ? "rgba(59, 130, 246, 0.12)" : "rgba(168, 85, 247, 0.12)")
          : "rgba(255, 255, 255, 0.04)";

        ctx.beginPath();
        ctx.arc(node.x, node.y, 45, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      }
    });

  }, [nodes, links, selectedNode, hoveredNode, dimensions, isDark, activeCategoryFilter]);

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const clickX = ((e.clientX - rect.left) / rect.width) * dimensions.width;
    const clickY = ((e.clientY - rect.top) / rect.height) * dimensions.height;

    let clicked: GraphNode | null = null;
    
    // Check bounding box of node cards
    const cardHalfWidth = isMobileDevice ? 55 : 70;
    const cardHalfHeight = isMobileDevice ? 20 : 25;
    for (let i = nodes.length - 1; i >= 0; i--) {
      const n = nodes[i];
      if (clickX >= n.x - cardHalfWidth && clickX <= n.x + cardHalfWidth && clickY >= n.y - cardHalfHeight && clickY <= n.y + cardHalfHeight) {
        clicked = n;
        break;
      }
    }

    if (clicked) {
      setSelectedNode((clicked as GraphNode).nodeRef);
    }
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const mouseX = ((e.clientX - rect.left) / rect.width) * dimensions.width;
    const mouseY = ((e.clientY - rect.top) / rect.height) * dimensions.height;

    let target: GraphNode | null = null;
    const cardHalfWidth = isMobileDevice ? 55 : 70;
    const cardHalfHeight = isMobileDevice ? 20 : 25;
    for (let i = nodes.length - 1; i >= 0; i--) {
      const n = nodes[i];
      if (mouseX >= n.x - cardHalfWidth && mouseX <= n.x + cardHalfWidth && mouseY >= n.y - cardHalfHeight && mouseY <= n.y + cardHalfHeight) {
        target = n;
        break;
      }
    }

    if (target) {
      setDraggedNode(target);
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const mouseX = ((e.clientX - rect.left) / rect.width) * dimensions.width;
    const mouseY = ((e.clientY - rect.top) / rect.height) * dimensions.height;

    if (draggedNode) {
      setNodes((current) =>
        current.map((n) => {
          if (n.id === draggedNode.id) {
            return { ...n, x: mouseX, y: mouseY, vx: 0, vy: 0 };
          }
          return n;
        })
      );
      return;
    }

    let hoverTarget: GraphNode | null = null;
    const cardHalfWidth = isMobileDevice ? 55 : 70;
    const cardHalfHeight = isMobileDevice ? 20 : 25;
    for (let i = nodes.length - 1; i >= 0; i--) {
      const n = nodes[i];
      if (mouseX >= n.x - cardHalfWidth && mouseX <= n.x + cardHalfWidth && mouseY >= n.y - cardHalfHeight && mouseY <= n.y + cardHalfHeight) {
        hoverTarget = n;
        break;
      }
    }
    setHoveredNode(hoverTarget);
  };

  const handleMouseUpOrLeave = () => {
    setDraggedNode(null);
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
        return "bg-red-500/10 text-red-500 border border-red-500/20";
      case "ecologia":
        return "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20";
      case "historia":
        return "bg-blue-500/10 text-blue-500 border border-blue-500/30";
      case "etica":
        return "bg-purple-500/10 text-purple-500 border border-purple-500/30";
      default:
        return "bg-zinc-800 text-zinc-400 border border-zinc-700";
    }
  };

  return (
    <div 
      id="network-graph-view" 
      className={
        isFullscreen 
          ? "fixed inset-0 z-50 p-6 md:p-8 bg-zinc-50/98 dark:bg-zinc-950/98 backdrop-blur-lg flex flex-col lg:flex-row gap-8 overflow-y-auto w-screen h-screen transition-all duration-300"
          : "grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch w-full min-h-[600px] border border-zinc-200 dark:border-zinc-800 rounded-3xl bg-white/40 dark:bg-zinc-900/10 backdrop-blur-md overflow-hidden transition-all duration-300"
      }
    >
      <div className={`${isFullscreen ? "lg:w-7/12 flex-1" : "lg:col-span-7"} flex flex-col justify-between p-6 bg-zinc-50/50 dark:bg-zinc-950/40 relative min-h-[460px] lg:min-h-[550px] transition-colors duration-300`}>
        <div>
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs font-bold tracking-wider text-zinc-700 dark:text-zinc-300 uppercase transition-colors">
              Grafo de Interconexiones de Sintiens
            </h3>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsFullscreen(!isFullscreen)}
                className="p-1.5 rounded-lg bg-zinc-200/60 dark:bg-zinc-900/60 hover:bg-zinc-300/80 dark:hover:bg-zinc-800/80 border border-zinc-300/50 dark:border-zinc-800 text-zinc-500 hover:text-zinc-800 dark:hover:text-white transition-all cursor-pointer flex items-center justify-center"
                title={isFullscreen ? "Salir de pantalla completa" : "Ver en pantalla completa"}
              >
                {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
              </button>
              <span className="text-[10px] font-mono text-zinc-500 bg-zinc-200/50 dark:bg-zinc-900/50 px-2 py-0.5 rounded border border-zinc-300/50 dark:border-zinc-800/80 transition-colors">
                Física Colisión Activa
              </span>
            </div>
          </div>
          <p className="text-[11px] text-zinc-500 max-w-sm mb-4 leading-relaxed">
            Arrastra los nodos libremente. El motor físico impedirá que se solapen. Haz clic en ellos para explorar sus conexiones y tesis.
          </p>
        </div>

        {/* Viewport container */}
        <div ref={containerRef} className="flex-1 w-full relative min-h-[350px] overflow-hidden rounded-xl border border-zinc-200/50 dark:border-zinc-800/50 bg-white/30 dark:bg-zinc-950/20">
          <canvas
            ref={canvasRef}
            width={dimensions.width}
            height={dimensions.height}
            onClick={handleCanvasClick}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUpOrLeave}
            onMouseLeave={handleMouseUpOrLeave}
            className="absolute inset-0 cursor-grab active:cursor-grabbing w-full h-full"
          />

          {/* HTML Overlay with absolutely-positioned node cards */}
          <div 
            className="absolute inset-0 pointer-events-none select-none overflow-hidden"
            style={{ width: dimensions.width, height: dimensions.height }}
          >
            {nodes.map((node) => {
              const isSelected = selectedNode?.id === node.id;
              const isHovered = hoveredNode?.id === node.id;
              const isFilteredOut = activeCategoryFilter && node.category !== activeCategoryFilter;
              
              // Find if this node is connected to the selected/hovered node
              const isConnected = selectedNode && (
                node.id === selectedNode.id || 
                selectedNode.connections.includes(node.id) ||
                node.nodeRef.connections.includes(selectedNode.id)
              );

              const isHoverConnected = hoveredNode && (
                node.id === hoveredNode.id ||
                hoveredNode.nodeRef.connections.includes(node.id) ||
                node.nodeRef.connections.includes(hoveredNode.id)
              );

              let categoryColorClass = "border-zinc-200 dark:border-zinc-800";
              let categoryBgClass = "bg-white/75 dark:bg-zinc-950/75";
              let glowColorClass = "";
              let dotColorClass = "bg-zinc-400";

              if (node.category === "sintiencia") {
                categoryColorClass = isSelected ? "border-red-500 ring-2 ring-red-500/30" : isHovered ? "border-red-400/80" : "border-red-500/20 dark:border-red-500/30";
                glowColorClass = isSelected ? "shadow-[0_0_15px_rgba(239,68,68,0.25)]" : isHovered ? "shadow-[0_0_8px_rgba(239,68,68,0.15)]" : "";
                dotColorClass = "bg-red-500";
              } else if (node.category === "ecologia") {
                categoryColorClass = isSelected ? "border-emerald-500 ring-2 ring-emerald-500/30" : isHovered ? "border-emerald-400/80" : "border-emerald-500/20 dark:border-emerald-500/30";
                glowColorClass = isSelected ? "shadow-[0_0_15px_rgba(16,185,129,0.25)]" : isHovered ? "shadow-[0_0_8px_rgba(16,185,129,0.15)]" : "";
                dotColorClass = "bg-emerald-500";
              } else if (node.category === "historia") {
                categoryColorClass = isSelected ? "border-blue-500 ring-2 ring-blue-500/30" : isHovered ? "border-blue-400/80" : "border-blue-500/20 dark:border-blue-500/30";
                glowColorClass = isSelected ? "shadow-[0_0_15px_rgba(59,130,246,0.25)]" : isHovered ? "shadow-[0_0_8px_rgba(59,130,246,0.15)]" : "";
                dotColorClass = "bg-blue-500";
              } else if (node.category === "etica") {
                categoryColorClass = isSelected ? "border-purple-500 ring-2 ring-purple-500/30" : isHovered ? "border-purple-400/80" : "border-purple-500/20 dark:border-purple-500/30";
                glowColorClass = isSelected ? "shadow-[0_0_15px_rgba(168,85,247,0.25)]" : isHovered ? "shadow-[0_0_8px_rgba(168,85,247,0.15)]" : "";
                dotColorClass = "bg-purple-500";
              }

              // Dim nodes based on active focus
              let opacityClass = "opacity-100 scale-100 z-10";
              if (isFilteredOut) {
                opacityClass = "opacity-35 scale-95 z-0";
              } else if (selectedNode && !isConnected) {
                opacityClass = "opacity-45 scale-95 z-0";
              } else if (hoveredNode && !isHoverConnected) {
                opacityClass = "opacity-60 z-0";
              }
              
              if (isSelected) {
                opacityClass = "opacity-100 scale-105 z-30 ring-2 ring-offset-2 dark:ring-offset-zinc-950 ring-zinc-300 dark:ring-zinc-800";
              } else if (isHovered) {
                opacityClass = "opacity-100 scale-[1.03] z-20";
              }

              return (
                <div
                  key={node.id}
                  className={`absolute flex items-center gap-1.5 md:gap-2 w-[110px] md:w-[140px] px-1.5 py-1.5 md:px-2.5 md:py-2 rounded-xl backdrop-blur-md transition-all duration-200 ease-out border text-left ${categoryBgClass} ${categoryColorClass} ${glowColorClass} ${opacityClass}`}
                  style={{
                    left: 0,
                    top: 0,
                    transform: `translate3d(calc(${node.x}px - 50%), calc(${node.y}px - 50%), 0)`,
                  }}
                >
                  <div className="relative flex h-2 w-2 shrink-0">
                    {isSelected && (
                      <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${dotColorClass}`} />
                    )}
                    <span className={`relative inline-flex rounded-full h-2 w-2 ${dotColorClass}`} />
                  </div>
                  
                  <span className="text-[9px] md:text-[10px] font-sans font-semibold tracking-tight text-zinc-800 dark:text-zinc-200 leading-[1.25] break-words whitespace-normal select-none w-full">
                    {node.title}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Mobile Sliding Bottom Sheet/Drawer */}
          <AnimatePresence>
            {selectedNode && isMobileViewport && (
              <motion.div
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "100%" }}
                transition={{ type: "spring", damping: 25, stiffness: 220 }}
                className="lg:hidden absolute bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-xl border-t border-zinc-200 dark:border-zinc-900 rounded-t-3xl shadow-[0_-10px_30px_rgba(0,0,0,0.15)] flex flex-col max-h-[75%] pointer-events-auto"
              >
                {/* Drag handle / header */}
                <div className="flex flex-col items-center py-3 border-b border-zinc-100 dark:border-zinc-900/80 cursor-pointer" onClick={() => setSelectedNode(null)}>
                  <div className="w-12 h-1 bg-zinc-300 dark:bg-zinc-700 rounded-full mb-1" />
                  <span className="text-[9px] font-mono text-zinc-400 dark:text-zinc-500 uppercase">Toca para cerrar</span>
                </div>

                {/* Scrollable details */}
                <div className="overflow-y-auto p-5 space-y-5 custom-scrollbar select-text">
                  <div className="flex items-center justify-between">
                    <span className={`text-[9px] tracking-widest font-mono uppercase px-2 py-0.5 rounded-full ${getCategoryBadgeClass(selectedNode.category)}`}>
                      {selectedNode.category === "sintiencia" ? "Sintiencia" :
                       selectedNode.category === "historia" ? "Historia" :
                       selectedNode.category === "ecologia" ? "Ecología" : "Ética y Derechos"}
                    </span>
                    <button 
                      onClick={() => setSelectedNode(null)} 
                      className="text-[10px] font-mono text-cyan-500 dark:text-cyan-400 hover:text-cyan-600 dark:hover:text-cyan-300 font-bold underline cursor-pointer pointer-events-auto"
                    >
                      Cerrar
                    </button>
                  </div>

                  <h2 className="text-base font-extrabold text-zinc-900 dark:text-white tracking-tight border-b border-zinc-100 dark:border-zinc-900 pb-2">
                    {selectedNode.title}
                  </h2>

                  <p className="text-[11.5px] text-zinc-600 dark:text-zinc-400 font-light leading-relaxed select-text">
                    <TextRenderer text={selectedNode.longDesc} references={selectedNode.references} />
                  </p>

                  <div className="space-y-3 pt-1">
                    <h4 className="text-[9px] font-bold tracking-wider text-zinc-700 dark:text-zinc-300 font-mono flex items-center gap-1.5">
                      <span className="h-1.5 w-1.5 rounded-full bg-zinc-800 dark:bg-white animate-pulse" />
                      EVIDENCIAS Y HECHOS FÁCTICOS:
                    </h4>
                    <ul className="space-y-2 text-[11px] text-zinc-600 dark:text-zinc-400 leading-relaxed font-light select-text">
                      {selectedNode.scientificFacts.map((fact, i) => (
                        <li key={i} className="flex items-start gap-2 bg-zinc-50/50 dark:bg-zinc-900/10 p-2.5 rounded-xl border border-zinc-200/50 dark:border-zinc-900/30">
                          <span className="text-zinc-400 dark:text-zinc-600 font-mono font-semibold mt-0.5 select-none">[{i + 1}]</span>
                          <span><TextRenderer text={fact} references={selectedNode.references} /></span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Collapsible Bibliography Section inside mobile drawer */}
                  {selectedNode.references && selectedNode.references.length > 0 && (
                    <div className="pt-1">
                      <button
                        onClick={() => setIsBibliographyOpen(!isBibliographyOpen)}
                        className="flex items-center justify-between w-full py-2 px-3 bg-zinc-100/50 dark:bg-zinc-950/30 rounded-xl border border-zinc-200 dark:border-zinc-800/30 text-[9px] font-mono tracking-wider uppercase text-zinc-500 hover:text-zinc-850 dark:hover:text-zinc-300 transition-all font-bold select-none cursor-pointer pointer-events-auto"
                      >
                        <span className="flex items-center gap-1.5">
                          <BookOpen className="w-3.5 h-3.5 text-zinc-400 dark:text-zinc-500" />
                          BIBLIOGRAFÍA COMPLETA ({selectedNode.references.length})
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
                            <ul className="mt-2 space-y-2 pl-1">
                              {selectedNode.references.map((ref) => (
                                <li
                                  key={ref.id}
                                  className="text-[10px] leading-relaxed text-zinc-500 dark:text-zinc-500 border-l border-zinc-200 dark:border-zinc-800/50 pl-2.5 py-0.5"
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
                                      className="inline-flex items-center gap-0.5 text-cyan-500 dark:text-cyan-400 hover:underline ml-1 font-semibold pointer-events-auto"
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

                  {/* Connections section in drawer */}
                  <div className="pt-3 border-t border-zinc-100 dark:border-zinc-900/50">
                    <span className="text-[8.5px] font-mono tracking-widest uppercase text-zinc-400 dark:text-zinc-500 block mb-2">
                      Conexiones Lógicas en la Red:
                    </span>
                    <div className="flex flex-wrap gap-1.5 pb-2">
                      {selectedNode.connections.map((connId) => {
                        const linked = CORE_NODES.find((n) => n.id === connId);
                        if (!linked) return null;
                        return (
                          <button
                            key={connId}
                            onClick={() => setSelectedNode(linked)}
                            className="text-[10px] px-2 py-1 rounded-lg bg-zinc-50 dark:bg-zinc-900/40 hover:bg-zinc-100 dark:hover:bg-zinc-900 text-zinc-600 dark:text-zinc-400 border border-zinc-200/50 dark:border-zinc-900 transition-all flex items-center gap-1 hover:text-zinc-900 dark:hover:text-white cursor-pointer pointer-events-auto"
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
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Legend / Category Filter Tabs */}
        <div className="flex flex-wrap gap-x-4 gap-y-2 mt-4 pt-4 border-t border-zinc-200 dark:border-zinc-900 text-xs font-mono transition-colors items-center justify-between w-full">
          <div className="flex flex-wrap gap-2.5">
            {(
              [
                { id: "sintiencia", label: "Sintiencia y Conciencia", color: "bg-red-500" },
                { id: "historia", label: "Historia y Explotación", color: "bg-blue-500" },
                { id: "ecologia", label: "Ecología y Termodinámica", color: "bg-emerald-500" },
                { id: "etica", label: "Ética y Derechos", color: "bg-purple-500" }
              ]
            ).map((cat) => {
              const isActive = activeCategoryFilter === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategoryFilter(isActive ? null : cat.id)}
                  className={`flex items-center gap-2 px-2.5 py-1 rounded-lg border transition-all cursor-pointer shadow-xs ${
                    isActive 
                      ? "bg-zinc-800 dark:bg-zinc-100 text-white dark:text-zinc-900 border-zinc-700 dark:border-zinc-200 font-bold scale-102"
                      : "bg-white/60 dark:bg-zinc-900/60 text-zinc-500 hover:text-zinc-900 dark:hover:text-white border-zinc-200 dark:border-zinc-800/80 hover:bg-zinc-100/50 dark:hover:bg-zinc-800/50"
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full ${cat.color} shrink-0`} />
                  <span className="text-[10px] tracking-tight">
                    {isMobileDevice 
                      ? (cat.id === "sintiencia" ? "Sintiencia" : cat.id === "historia" ? "Historia" : cat.id === "ecologia" ? "Ecología" : "Ética") 
                      : cat.label}
                  </span>
                </button>
              );
            })}
          </div>

          {activeCategoryFilter && (
            <button
              onClick={() => setActiveCategoryFilter(null)}
              className="text-[10px] text-purple-500 hover:text-purple-600 dark:text-purple-400 dark:hover:text-purple-300 font-bold underline cursor-pointer"
            >
              Limpiar Filtro
            </button>
          )}
        </div>
      </div>

      {/* Details Panel */}
      <div className={`${isFullscreen ? "lg:w-5/12 max-h-[90vh] overflow-y-auto custom-scrollbar" : "lg:col-span-5 lg:border-l border-zinc-200 dark:border-zinc-800"} hidden lg:flex p-6 lg:p-8 flex-col justify-between bg-zinc-50/30 dark:bg-zinc-900/30 transition-colors duration-300`}>
        <AnimatePresence mode="wait">
          {selectedNode ? (
            <motion.div
              key={selectedNode.id}
              initial={{ opacity: 0, x: 15 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -15 }}
              transition={{ duration: 0.25 }}
              className="flex-1 flex flex-col justify-between h-full space-y-6"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className={`text-[10px] tracking-widest font-mono uppercase px-2.5 py-1 rounded-full ${getCategoryBadgeClass(selectedNode.category)}`}>
                    {selectedNode.category === "sintiencia" ? "Sintiencia" :
                     selectedNode.category === "historia" ? "Historia" :
                     selectedNode.category === "ecologia" ? "Ecología" : "Ética y Derechos"}
                  </span>
                  <div className="flex items-center gap-1.5 text-zinc-500 text-xs">
                    {getCategoryIcon(selectedNode.category)}
                    <span className="font-mono text-[10px] capitalize">Pilar Integrado</span>
                  </div>
                </div>

                <h2 className="text-xl font-extrabold text-zinc-900 dark:text-white tracking-tight border-b border-zinc-200 dark:border-zinc-800 pb-3 transition-colors">
                  {selectedNode.title}
                </h2>

                <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 font-light leading-relaxed transition-colors select-text">
                  <TextRenderer text={selectedNode.longDesc} references={selectedNode.references} />
                </p>

                <div className="space-y-3 pt-2">
                  <h4 className="text-[10px] font-bold tracking-wider text-zinc-700 dark:text-zinc-300 font-mono flex items-center gap-1.5 transition-colors">
                    <span className="h-1.5 w-1.5 rounded-full bg-zinc-800 dark:bg-white animate-pulse" />
                    EVIDENCIAS Y HECHOS FÁCTICOS:
                  </h4>
                  <ul className="space-y-2 text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed font-light select-text">
                    {selectedNode.scientificFacts.map((fact, i) => (
                      <li key={i} className="flex items-start gap-2 bg-white dark:bg-zinc-950/40 p-3 rounded-xl border border-zinc-200/60 dark:border-zinc-800/40 transition-colors">
                        <span className="text-zinc-400 dark:text-zinc-600 font-mono font-semibold mt-0.5 select-none">[{i + 1}]</span>
                        <span><TextRenderer text={fact} references={selectedNode.references} /></span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Collapsible Bibliography Section */}
                {selectedNode.references && selectedNode.references.length > 0 && (
                  <div className="pt-2">
                    <button
                      onClick={() => setIsBibliographyOpen(!isBibliographyOpen)}
                      className="flex items-center justify-between w-full py-2 px-3 bg-zinc-100/50 dark:bg-zinc-950/30 rounded-xl border border-zinc-200 dark:border-zinc-800/30 text-[10px] font-mono tracking-wider uppercase text-zinc-500 hover:text-zinc-850 dark:hover:text-zinc-300 transition-all cursor-pointer font-bold select-none"
                    >
                      <span className="flex items-center gap-1.5">
                        <BookOpen className="w-3.5 h-3.5 text-zinc-400 dark:text-zinc-500" />
                        BIBLIOGRAFÍA COMPLETA ({selectedNode.references.length})
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
                            {selectedNode.references.map((ref) => (
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

              <div className="pt-6 border-t border-zinc-200 dark:border-zinc-800/60 transition-colors">
                <span className="text-[9px] font-mono tracking-widest uppercase text-zinc-400 dark:text-zinc-500 block mb-2">
                  Conexiones Lógicas en la Red:
                </span>
                <div className="flex flex-wrap gap-2">
                  {selectedNode.connections.map((connId) => {
                    const linked = CORE_NODES.find((n) => n.id === connId);
                    if (!linked) return null;
                    return (
                      <button
                        key={connId}
                        onClick={() => setSelectedNode(linked)}
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
            </motion.div>
          ) : (
            <div className="flex flex-col items-center justify-center text-center h-full text-zinc-500 dark:text-zinc-500 py-16">
              <HelpCircle className="w-12 h-12 stroke-1 text-zinc-400 dark:text-zinc-700 mb-2 animate-pulse" />
              <p className="text-xs font-light">Selecciona un nodo del grafo para explorar su lógica causal.</p>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
