import React, { useEffect, useRef, useState } from "react";
import { CORE_NODES, NodeDetail } from "../types";
import { Info, HelpCircle, Activity, Globe, Scale } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface GraphNode {
  id: string;
  category: "sintiencia" | "historia" | "clima" | "eleccion";
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
      else if (node.category === "clima") { cx = 150; cy = 280; }
      else if (node.category === "eleccion") { cx = 450; cy = 280; }

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
          height: Math.max(height, 420)
        });
      });
    });

    resizeObserver.observe(containerRef.current);
    return () => resizeObserver.disconnect();
  }, []);

  // Physics loop (force-directed layout simulation)
  useEffect(() => {
    if (nodes.length === 0) return;

    let animationFrameId: number;

    const step = () => {
      setNodes((currentNodes) => {
        const nextNodes = currentNodes.map((n) => ({ ...n }));

        // 1. Repulsion between all nodes
        for (let i = 0; i < nextNodes.length; i++) {
          const nodeA = nextNodes[i];
          for (let j = i + 1; j < nextNodes.length; j++) {
            const nodeB = nextNodes[j];
            const dx = nodeB.x - nodeA.x;
            const dy = nodeB.y - nodeA.y;
            const dist = Math.sqrt(dx * dx + dy * dy) || 1;
            
            if (dist < 180) {
              const force = (180 - dist) * 0.04;
              const fx = (dx / dist) * force;
              const fy = (dy / dist) * force;
              
              if (draggedNode?.id !== nodeA.id) {
                nodeA.vx -= fx;
                nodeA.vy -= fy;
              }
              if (draggedNode?.id !== nodeB.id) {
                nodeB.x += fx;
                nodeB.y += fy;
              }
            }
          }
        }

        // 2. Attraction of links
        links.forEach((link) => {
          const sourceNode = nextNodes.find((n) => n.id === link.source);
          const targetNode = nextNodes.find((n) => n.id === link.target);
          
          if (sourceNode && targetNode) {
            const dx = targetNode.x - sourceNode.x;
            const dy = targetNode.y - sourceNode.y;
            const dist = Math.sqrt(dx * dx + dy * dy) || 1;
            
            const targetDist = 110;
            const force = (dist - targetDist) * 0.035;
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
        nextNodes.forEach((node) => {
          let cx = dimensions.width / 2;
          let cy = dimensions.height / 2;

          if (node.category === "sintiencia") { cx = dimensions.width * 0.28; cy = dimensions.height * 0.28; }
          else if (node.category === "historia") { cx = dimensions.width * 0.72; cy = dimensions.height * 0.28; }
          else if (node.category === "clima") { cx = dimensions.width * 0.28; cy = dimensions.height * 0.72; }
          else if (node.category === "eleccion") { cx = dimensions.width * 0.72; cy = dimensions.height * 0.72; }

          const dx = cx - node.x;
          const dy = cy - node.y;
          node.vx += dx * 0.01;
          node.vy += dy * 0.01;

          node.vx *= 0.75;
          node.vy *= 0.75;

          if (draggedNode?.id !== node.id) {
            node.x += node.vx;
            node.y += node.vy;
          }

          const margin = 35;
          node.x = Math.max(margin, Math.min(dimensions.width - margin, node.x));
          node.y = Math.max(margin, Math.min(dimensions.height - margin, node.y));
        });

        return nextNodes;
      });

      animationFrameId = requestAnimationFrame(step);
    };

    animationFrameId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(animationFrameId);
  }, [links, draggedNode, dimensions]);

  // Render Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const isDark = document.documentElement.classList.contains("dark");

    ctx.clearRect(0, 0, dimensions.width, dimensions.height);
    ctx.lineCap = "round";

    // 1. Draw connections / links
    links.forEach((link) => {
      const source = nodes.find((n) => n.id === link.source);
      const target = nodes.find((n) => n.id === link.target);

      if (source && target) {
        const isHighlight =
          (selectedNode && (source.id === selectedNode.id || target.id === selectedNode.id)) ||
          (hoveredNode && (source.id === hoveredNode.id || target.id === hoveredNode.id));

        const grad = ctx.createLinearGradient(source.x, source.y, target.x, target.y);
        
        const getCatColor = (cat: string, opacity: number) => {
          if (cat === "sintiencia") return `rgba(239, 68, 68, ${opacity})`;
          if (cat === "clima") return `rgba(16, 185, 129, ${opacity})`;
          if (cat === "historia") return `rgba(59, 130, 246, ${opacity})`;
          return `rgba(245, 158, 11, ${opacity})`;
        };

        const opacity = isHighlight ? 0.6 : (isDark ? 0.15 : 0.08);
        grad.addColorStop(0, getCatColor(source.category, opacity));
        grad.addColorStop(1, getCatColor(target.category, opacity));

        ctx.strokeStyle = grad;
        ctx.lineWidth = isHighlight ? 2.5 : 1.2;

        ctx.beginPath();
        ctx.moveTo(source.x, source.y);
        ctx.lineTo(target.x, target.y);
        ctx.stroke();

        if (isHighlight) {
          const time = Date.now() * 0.001;
          const ratio = (time % 1);
          const px = source.x + (target.x - source.x) * ratio;
          const py = source.y + (target.y - source.y) * ratio;
          ctx.fillStyle = source.id === selectedNode?.id ? (isDark ? "#ffffff" : "#18181b") : getCatColor(source.category, 0.8);
          ctx.beginPath();
          ctx.arc(px, py, 3, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    });

    // 2. Draw nodes
    nodes.forEach((node) => {
      const isSelected = selectedNode?.id === node.id;
      const isHovered = hoveredNode?.id === node.id;

      let nodeColorHex = "#ffffff";
      let glowColor = "rgba(255, 255, 255, 0.2)";
      if (node.category === "sintiencia") {
        nodeColorHex = "#ef4444"; glowColor = "rgba(239, 68, 68, 0.4)";
      } else if (node.category === "clima") {
        nodeColorHex = "#10b981"; glowColor = "rgba(16, 185, 129, 0.4)";
      } else if (node.category === "historia") {
        nodeColorHex = "#3b82f6"; glowColor = "rgba(59, 130, 246, 0.4)";
      } else if (node.category === "eleccion") {
        nodeColorHex = "#f59e0b"; glowColor = "rgba(245, 158, 11, 0.4)";
      }

      if (isSelected || isHovered) {
        ctx.shadowBlur = isSelected ? 20 : 10;
        ctx.shadowColor = nodeColorHex;
        ctx.strokeStyle = glowColor;
        ctx.lineWidth = isSelected ? 5 : 3;
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius + (isSelected ? 3 : 2), 0, Math.PI * 2);
        ctx.stroke();
        ctx.shadowBlur = 0;
      }

      ctx.fillStyle = isSelected ? (isDark ? "#ffffff" : "#18181b") : nodeColorHex;
      ctx.beginPath();
      ctx.arc(node.x, node.y, isSelected ? 9 : 7, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = isDark ? "#09090b" : "#fafafa";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(node.x, node.y, isSelected ? 9 : 7, 0, Math.PI * 2);
      ctx.stroke();

      ctx.fillStyle = isSelected ? (isDark ? "#ffffff" : "#18181b") : isHovered ? (isDark ? "#e4e4e7" : "#27272a") : (isDark ? "#a1a1aa" : "#71717a");
      ctx.font = isSelected ? "bold 11px Outfit, Inter, system-ui, sans-serif" : "10px Outfit, Inter, system-ui, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(node.title, node.x, node.y - 15);
    });

  }, [nodes, links, selectedNode, hoveredNode, dimensions, isDark]);

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    let clicked: GraphNode | null = null;
    let mindist = Infinity;

    nodes.forEach((n) => {
      const dx = n.x - clickX;
      const dy = n.y - clickY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < n.radius + 15 && dist < mindist) {
        clicked = n;
        mindist = dist;
      }
    });

    if (clicked) {
      setSelectedNode((clicked as GraphNode).nodeRef);
    }
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    let target: GraphNode | null = null;
    nodes.forEach((n) => {
      const dx = n.x - mouseX;
      const dy = n.y - mouseY;
      if (Math.sqrt(dx * dx + dy * dy) < n.radius + 10) {
        target = n;
      }
    });

    if (target) {
      setDraggedNode(target);
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

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
    nodes.forEach((n) => {
      const dx = n.x - mouseX;
      const dy = n.y - mouseY;
      if (Math.sqrt(dx * dx + dy * dy) < n.radius + 10) {
        hoverTarget = n;
      }
    });
    setHoveredNode(hoverTarget);
  };

  const handleMouseUpOrLeave = () => {
    setDraggedNode(null);
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "sintiencia":
        return <Activity className="w-5 h-5 text-red-500" />;
      case "clima":
        return <Globe className="w-5 h-5 text-emerald-500" />;
      case "historia":
        return <Info className="w-5 h-5 text-blue-500" />;
      case "eleccion":
        return <Scale className="w-5 h-5 text-amber-500" />;
      default:
        return <HelpCircle className="w-5 h-5 text-zinc-400" />;
    }
  };

  const getCategoryBadgeClass = (category: string) => {
    switch (category) {
      case "sintiencia":
        return "bg-red-500/10 text-red-500 border border-red-500/20";
      case "clima":
        return "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20";
      case "historia":
        return "bg-blue-500/10 text-blue-500 border border-blue-500/30";
      case "eleccion":
        return "bg-amber-500/10 text-amber-500 border border-amber-500/30";
      default:
        return "bg-zinc-800 text-zinc-400 border border-zinc-700";
    }
  };

  return (
    <div id="network-graph-view" className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch w-full min-h-[600px] border border-zinc-200 dark:border-zinc-800 rounded-3xl bg-white/40 dark:bg-zinc-900/10 backdrop-blur-md overflow-hidden transition-all duration-300">
      <div className="lg:col-span-7 flex flex-col justify-between p-6 bg-zinc-50/50 dark:bg-zinc-950/40 relative min-h-[420px] lg:min-h-[550px] transition-colors duration-300">
        <div>
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold tracking-wider text-zinc-700 dark:text-zinc-300 uppercase transition-colors">
              Grafo de Interconexiones de Sitiens
            </h3>
            <span className="text-xs font-mono text-zinc-500 bg-zinc-200/50 dark:bg-zinc-900/50 px-2 py-0.5 rounded border border-zinc-300/50 dark:border-zinc-800/80 transition-colors">
              Fuerza Activa de Repulsión
            </span>
          </div>
          <p className="text-xs text-zinc-500 max-w-sm mb-4">
            Arrastra los nodos para liberar la física o clica sobre ellos para descolgar su tesis científica y conexiones morales.
          </p>
        </div>

        <div ref={containerRef} className="flex-1 w-full relative min-h-[300px]">
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
        </div>

        <div className="flex flex-wrap gap-x-4 gap-y-2 mt-4 pt-4 border-t border-zinc-200 dark:border-zinc-900 text-xs font-mono transition-colors">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 inline-block ring-2 ring-zinc-50 dark:ring-zinc-950" />
            <span className="text-zinc-500">Sintiencia</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block ring-2 ring-zinc-50 dark:ring-zinc-950" />
            <span className="text-zinc-500">Historia</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block ring-2 ring-zinc-50 dark:ring-zinc-950" />
            <span className="text-zinc-500">Clima</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block ring-2 ring-zinc-50 dark:ring-zinc-950" />
            <span className="text-zinc-500">Elección Moral</span>
          </div>
        </div>
      </div>

      <div className="lg:col-span-5 p-6 lg:p-8 flex flex-col justify-between border-t lg:border-t-0 lg:border-l border-zinc-200 dark:border-zinc-800 bg-zinc-50/30 dark:bg-zinc-900/30 transition-colors duration-300">
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
                    {selectedNode.category}
                  </span>
                  <div className="flex items-center gap-1.5 text-zinc-500 text-xs">
                    {getCategoryIcon(selectedNode.category)}
                    <span className="font-mono text-[10px] capitalize">Pilar Integrado</span>
                  </div>
                </div>

                <h2 className="text-2xl font-extrabold text-zinc-900 dark:text-white tracking-tight border-b border-zinc-200 dark:border-zinc-800 pb-3 transition-colors">
                  {selectedNode.title}
                </h2>

                <p className="text-sm text-zinc-650 dark:text-zinc-400 font-light leading-relaxed transition-colors">
                  {selectedNode.longDesc}
                </p>

                <div className="space-y-3 pt-2">
                  <h4 className="text-xs font-semibold tracking-wider text-zinc-700 dark:text-zinc-300 font-mono flex items-center gap-1.5 transition-colors">
                    <span className="h-1.5 w-1.5 rounded-full bg-zinc-800 dark:bg-white animate-pulse" />
                    EVIDENCIAS Y HECHOS FÁCTICOS:
                  </h4>
                  <ul className="space-y-2 text-xs text-zinc-650 dark:text-zinc-400 leading-relaxed font-light">
                    {selectedNode.scientificFacts.map((fact, i) => (
                      <li key={i} className="flex items-start gap-2 bg-white dark:bg-zinc-950/40 p-3 rounded-xl border border-zinc-200 dark:border-zinc-800/40 transition-colors">
                        <span className="text-zinc-400 dark:text-zinc-650 font-mono font-medium mt-0.5">[{i + 1}]</span>
                        <span>{fact}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {selectedNode.citation && (
                  <div className="p-3 bg-zinc-100/50 dark:bg-zinc-950/30 rounded-xl border border-zinc-200 dark:border-zinc-800/30 text-[10px] font-mono text-zinc-500 dark:text-zinc-500 leading-relaxed transition-colors">
                    <span className="text-[8px] uppercase tracking-widest text-zinc-650 block mb-1 font-bold">
                      Fuente / Referencia Académica:
                    </span>
                    📖 {selectedNode.citation}
                  </div>
                )}
              </div>

              <div className="pt-6 border-t border-zinc-200 dark:border-zinc-800/60 transition-colors">
                <span className="text-[10px] font-mono tracking-widest uppercase text-zinc-400 dark:text-zinc-500 block mb-2">
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
                        className="text-xs px-3 py-1.5 rounded-xl bg-white dark:bg-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-800/80 transition-all flex items-center gap-1.5 hover:border-zinc-300 dark:hover:border-zinc-700 hover:text-zinc-900 dark:hover:text-white shadow-sm dark:shadow-none cursor-pointer"
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          linked.category === 'sintiencia' ? 'bg-red-500' :
                          linked.category === 'clima' ? 'bg-emerald-500' :
                          linked.category === 'historia' ? 'bg-blue-500' : 'bg-amber-500'
                        }`} />
                        {linked.title}
                      </button>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          ) : (
            <div className="flex flex-col items-center justify-center text-center h-full text-zinc-450 dark:text-zinc-500 py-16">
              <HelpCircle className="w-12 h-12 stroke-1 text-zinc-400 dark:text-zinc-700 mb-2 animate-pulse" />
              <p className="text-sm font-light">Selecciona un nodo del grafo para explorar su lógica causal.</p>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
