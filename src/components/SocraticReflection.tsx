import { useState, useEffect } from "react";
import { HelpCircle, Heart, Scale, Sparkles, ChevronDown, EyeOff, RotateCcw, Shuffle, Eye, HelpCircle as HelpIcon, Flame, Globe } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface ReflectionItem {
  id: number;
  icon: any;
  title: string;
  question: string;
  reflection: string;
  deepDiveQuestion: string;
  colorClass: string;
  activeBorderClass: string;
  badgeText: string;
  broadCategory: "sintiencia" | "ecologia" | "etica" | "cultura";
}

const ALL_QUESTIONS: ReflectionItem[] = [
  {
    id: 1,
    icon: Heart,
    badgeText: "Coherencia Moral",
    broadCategory: "etica",
    title: "La paradoja de la empatía",
    question: "¿Si amamos y protegemos a nuestras mascotas, qué nos lleva a trazar una línea moral tan distinta para otros animales con la misma capacidad de sentir?",
    reflection: "Las vacas, cerdos and aves experimentan alegría, dolor y apego de forma muy similar a un perro o un gato. Esta distinción suele responder más a la inercia de nuestras costumbres y tradiciones culinarias que a una diferencia neurobiológica real.",
    deepDiveQuestion: "¿Es esta distinción moral un axioma deducido por la razón, o simplemente una costumbre heredada que repetimos de forma automática?",
    colorClass: "from-rose-500/10 via-rose-500/5 to-transparent border-rose-200/50 dark:border-rose-900/30 text-rose-500 dark:text-rose-450",
    activeBorderClass: "border-rose-500/20 dark:border-rose-500/30"
  },
  {
    id: 2,
    icon: Scale,
    badgeText: "Alternativas",
    broadCategory: "etica",
    title: "La elección inofensiva",
    question: "¿Si hoy en día es perfectamente viable nutrirnos y vivir de manera saludable sin causar sufrimiento a otros seres, cuál es la razón para elegir lo contrario?",
    reflection: "Cuando nuestra supervivencia o salud no dependen de la explotación animal (gracias a la enorme abundancia de alternativas modernas), el consumo se convierte en una elección ética activa y diaria en lugar de una necesidad biológica.",
    deepDiveQuestion: "Si tenemos la libertad and el poder de evitar el dolor sin sacrificar nuestro propio bienestar, ¿no es la compasión la opción más coherente?",
    colorClass: "from-emerald-500/10 via-emerald-500/5 to-transparent border-emerald-200/50 dark:border-emerald-900/30 text-emerald-500 dark:text-emerald-400",
    activeBorderClass: "border-emerald-500/20 dark:border-emerald-500/30"
  },
  {
    id: 3,
    icon: Sparkles,
    badgeText: "Cultura",
    broadCategory: "cultura",
    title: "Tradición vs. Consciencia",
    question: "¿Nuestra relación actual con el resto de animales es el resultado de una reflexión ética propia, o simplemente una inercia cultural heredada?",
    reflection: "Casi todas nuestras costumbres culinarias nacieron en épocas de escasez extrema y dinámicas del pasado. Hoy, al gozar de información y alternativas excelentes, tenemos la libertad de redefinir de manera consciente nuestro propio legado moral.",
    deepDiveQuestion: "¿Deben las costumbres del pasado dictar nuestras decisiones éticas del presente, o podemos diseñar activamente nuestra relación con el entorno?",
    colorClass: "from-purple-500/10 via-purple-500/5 to-transparent border-purple-200/50 dark:border-purple-900/30 text-purple-600 dark:text-purple-400",
    activeBorderClass: "border-purple-500/20 dark:border-purple-500/30"
  },
  {
    id: 4,
    icon: Eye,
    badgeText: "Percepción",
    broadCategory: "cultura",
    title: "Ojos que no ven...",
    question: "¿Si tuviéramos que obtener nuestra carne participando directamente en el sacrificio del animal, mantendríamos el mismo nivel de consumo actual?",
    reflection: "La industrialización alimentaria aleja el producto final del animal vivo. Este distanciamiento psicológico nos protege del malestar de presenciar o causar la muerte, permitiéndonos consumir sin asociar el alimento con el dolor de un individuo.",
    deepDiveQuestion: "¿Es éticamente coherente delegar en terceros un acto industrial que nos causaría profundo rechazo o compasión realizar por nosotros mismos?",
    colorClass: "from-amber-500/10 via-amber-500/5 to-transparent border-amber-200/50 dark:border-amber-900/30 text-amber-500 dark:text-amber-400",
    activeBorderClass: "border-amber-500/20 dark:border-amber-500/30"
  },
  {
    id: 5,
    icon: HelpIcon,
    badgeText: "Inteligencia",
    broadCategory: "sintiencia",
    title: "El umbral de la inteligencia",
    question: "¿Si justificamos el uso de animales basándonos en su menor inteligencia, deberíamos aplicar el mismo criterio a humanos con capacidades cognitivas limitadas?",
    reflection: "La capacidad de sufrir y experimentar la vida no depende del intelecto ni de la capacidad de lenguaje, sino de la posesión de un sistema nervioso y sintiencia. Un animal sintiente experimenta el dolor con la misma intensidad que un humano.",
    deepDiveQuestion: "Como planteaba Jeremy Bentham: la pregunta crucial no es ¿pueden razonar? ni ¿pueden hablar?, sino ¿pueden sufrir?",
    colorClass: "from-blue-500/10 via-blue-500/5 to-transparent border-blue-200/50 dark:border-blue-900/30 text-blue-500 dark:text-blue-400",
    activeBorderClass: "border-blue-500/20 dark:border-blue-500/30"
  },
  {
    id: 6,
    icon: Globe,
    badgeText: "Termodinámica",
    broadCategory: "ecologia",
    title: "El intermediario calórico",
    question: "¿Tiene sentido destinar enormes extensiones de tierra a alimentar animales para luego consumirlos, en lugar de consumir directamente esos nutrientes?",
    reflection: "Producir una caloría de carne requiere multiplicar los recursos vegetales consumidos por el ganado. Esta ineficiencia termodinámica acelera la deforestación y el desperdicio calórico global simplemente para satisfacer una preferencia sensorial.",
    deepDiveQuestion: "¿Es justificable priorizar el placer del paladar por encima de la eficiencia ecológica de nuestro planeta?",
    colorClass: "from-cyan-500/10 via-cyan-500/5 to-transparent border-cyan-200/50 dark:border-cyan-900/30 text-cyan-500 dark:text-cyan-400",
    activeBorderClass: "border-cyan-500/20 dark:border-cyan-500/30"
  },
  {
    id: 7,
    icon: Flame,
    badgeText: "Biología",
    broadCategory: "sintiencia",
    title: "La falsa equivalencia vegetal",
    question: "¿Por qué equiparamos el consumo de plantas (que carecen de sistema nervioso) con el de animales con una indiscutible capacidad sintiente?",
    reflection: "Las plantas reaccionan a estímulos físicos de forma bioquímica, pero carecen de la arquitectura neurobiológica necesaria para la experiencia subjetiva del dolor. Además, consumir animales exige multiplicar la cantidad de plantas cosechadas para alimentarlos.",
    deepDiveQuestion: "¿Utilizamos a veces la 'vida vegetal' como una falacia lógica para neutralizar nuestro malestar por el dolor animal real?",
    colorClass: "from-red-500/10 via-red-500/5 to-transparent border-red-200/50 dark:border-red-900/30 text-red-500 dark:text-red-450",
    activeBorderClass: "border-red-500/20 dark:border-red-500/30"
  },
  {
    id: 8,
    icon: Scale,
    badgeText: "Derecho Natural",
    broadCategory: "etica",
    title: "La ley del más fuerte",
    question: "¿Si justificamos comer animales porque somos 'superiores' evolutivamente, aceptaríamos que una especie alienígena superior nos explotara como alimento?",
    reflection: "Nuestra capacidad para dominar a otras especies nos otorga poder físico, pero no legitimidad moral para utilizarlos a nuestro antojo. La madurez ética de una especie se mide protegiendo al vulnerable, no sometiéndolo por la fuerza.",
    deepDiveQuestion: "¿Confundimos la mera capacidad física y tecnológica de someter a otros seres con el derecho moral de hacerlo?",
    colorClass: "from-indigo-500/10 via-indigo-500/5 to-transparent border-indigo-200/50 dark:border-indigo-900/30 text-indigo-500 dark:text-indigo-400",
    activeBorderClass: "border-indigo-500/20 dark:border-indigo-500/30"
  },
  {
    id: 9,
    icon: Heart,
    badgeText: "Placer Sensorial",
    broadCategory: "etica",
    title: "El límite del placer",
    question: "¿Si en cualquier otro ámbito rechazamos causar daño para obtener conveniencia o placer propio, por qué lo validamos cuando nos sentamos a comer?",
    reflection: "El placer gustativo de comer carne es momentáneo, pero la privación de la vida del animal es absoluta. Evaluar esta asimetría nos ayuda a cuestionar si el disfrute de los sentidos justifica éticamente anular la existencia y bienestar de otro ser.",
    deepDiveQuestion: "Si coincidimos en que el placer personal no justifica maltratar a un perro o gato, ¿por qué cambiaría el principio moral con otros animales sintientes?",
    colorClass: "from-rose-500/10 via-rose-500/5 to-transparent border-rose-200/50 dark:border-rose-900/30 text-rose-500 dark:text-rose-450",
    activeBorderClass: "border-rose-500/20 dark:border-rose-500/30"
  },
  {
    id: 10,
    icon: Scale,
    badgeText: "Ley Natural",
    broadCategory: "cultura",
    title: "La ética del león",
    question: "¿Es racional guiar nuestra conducta moral imitando el comportamiento de animales salvajes en lugar de usar nuestra propia capacidad de razonar?",
    reflection: "Un depredador caza por instinto ciego y estricta supervivencia, careciendo de alternativas o sentido ético. Los humanos en sociedades modernas poseemos abundancia de opciones y una capacidad consciente que nos confiere una responsabilidad única.",
    deepDiveQuestion: "Si no imitamos a los depredadores salvajes en sus otras conductas biológicas dentro de la sociedad, ¿por qué los tomamos como referencia moral en nuestro plato?",
    colorClass: "from-amber-500/10 via-amber-500/5 to-transparent border-amber-200/50 dark:border-amber-900/30 text-amber-500 dark:text-amber-400",
    activeBorderClass: "border-amber-500/20 dark:border-amber-500/30"
  },
  {
    id: 11,
    icon: HelpIcon,
    badgeText: "Nutrición",
    broadCategory: "sintiencia",
    title: "Rendimiento y salud",
    question: "¿Por qué creemos que explotar animales es indispensable para la salud o el alto rendimiento, a pesar de los millones de deportistas y personas sanas que no lo hacen?",
    reflection: "Los principales consensos de nutrición globales y multitud de atletas de élite demuestran que una alimentación basada en plantas bien planificada es saludable e idónea para cualquier etapa de la vida. La vinculación de fuerza y carne es un mito cultural.",
    deepDiveQuestion: "Si la ciencia respalda que podemos estar fuertes y sanos sin productos animales, ¿sigue siendo la nutrición un obstáculo real o una inercia aprendida?",
    colorClass: "from-blue-500/10 via-blue-500/5 to-transparent border-blue-200/50 dark:border-blue-900/30 text-blue-500 dark:text-blue-450",
    activeBorderClass: "border-blue-500/20 dark:border-blue-500/30"
  },
  {
    id: 12,
    icon: Globe,
    badgeText: "Economía",
    broadCategory: "ecologia",
    title: "El factor económico",
    question: "¿Es el veganismo realmente más costoso, o es que comparamos productos procesados de nicho en lugar de la cesta de la compra básica?",
    reflection: "Los alimentos más baratos, abundantes y nutritivos del planeta (legumbres, granos, tubérculos, avena y vegetales locales) son 100% vegetales. El coste alto suele asociarse a los sustitutos ultraprocesados imitación carne, los cuales son totalmente opcionales.",
    deepDiveQuestion: "Si las compras de materias primas vegetales son las más económicas del mundo, ¿por qué persiste la idea de que la alimentación ética es un lujo?",
    colorClass: "from-emerald-500/10 via-emerald-500/5 to-transparent border-emerald-200/50 dark:border-emerald-900/30 text-emerald-500 dark:text-emerald-400",
    activeBorderClass: "border-emerald-500/20 dark:border-emerald-500/30"
  },
  {
    id: 13,
    icon: Sparkles,
    badgeText: "Apatía Moral",
    broadCategory: "cultura",
    title: "La inercia de la apatía",
    question: "¿Si sospechamos que un acto causa sufrimiento innecesario y preferimos ignorarlo, esa desconexión anula nuestra parte de responsabilidad?",
    reflection: "Es humano experimentar disonancia cognitiva y evitar ver la cruda realidad industrial para no sentir incomodidad. Sin embargo, apartar la mirada de las dinámicas del matadero no elimina el impacto de nuestras elecciones de compra cotidianas.",
    deepDiveQuestion: "Dado que la inacción también financia activamente la industria, ¿qué nos frena a alinear las compras diarias con los valores de compasión que ya sentimos?",
    colorClass: "from-purple-500/10 via-purple-500/5 to-transparent border-purple-200/50 dark:border-purple-900/30 text-purple-600 dark:text-purple-400",
    activeBorderClass: "border-purple-500/20 dark:border-purple-500/30"
  }
];

export default function SocraticReflection() {
  const [isHidden, setIsHidden] = useState<boolean>(true); // start true to prevent flash
  const [visibleQuestions, setVisibleQuestions] = useState<ReflectionItem[]>([]);
  const [expandedCard, setExpandedCard] = useState<number | null>(null);
  const [spinDegrees, setSpinDegrees] = useState<number>(0);

  // Get 3 random unique questions from 3 different categories for maximum diversity
  const get3RandomQuestions = () => {
    const categories: ("sintiencia" | "ecologia" | "etica" | "cultura")[] = ["sintiencia", "ecologia", "etica", "cultura"];
    // Shuffle categories and pick 3
    const selectedCats = [...categories].sort(() => 0.5 - Math.random()).slice(0, 3);
    
    return selectedCats.map(cat => {
      const pool = ALL_QUESTIONS.filter(q => q.broadCategory === cat);
      return pool[Math.floor(Math.random() * pool.length)];
    });
  };

  useEffect(() => {
    const saved = localStorage.getItem("sintiens-reflection-hidden");
    if (saved === "true") {
      setIsHidden(true);
    } else {
      setIsHidden(false);
    }
    // Set 3 initial random diverse questions
    setVisibleQuestions(get3RandomQuestions());
  }, []);

  const handleHide = () => {
    setIsHidden(true);
    localStorage.setItem("sintiens-reflection-hidden", "true");
  };

  const handleShow = () => {
    setIsHidden(false);
    localStorage.removeItem("sintiens-reflection-hidden");
    setVisibleQuestions(get3RandomQuestions());
  };

  const handleShuffle = () => {
    setExpandedCard(null);
    setSpinDegrees(prev => prev + 360);
    setTimeout(() => {
      setVisibleQuestions(get3RandomQuestions());
    }, 150);
  };

  const handleToggleCard = (id: number) => {
    setExpandedCard(expandedCard === id ? null : id);
  };

  if (isHidden) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex justify-start pt-2 animate-fade-in"
      >
        <button
          onClick={handleShow}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white bg-zinc-100 dark:bg-zinc-900 hover:bg-zinc-200 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 transition-all cursor-pointer shadow-xs"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Restaurar preguntas de reflexión socrática</span>
        </button>
      </motion.div>
    );
  }

  // Find the selected question details
  const activeQuestion = visibleQuestions.find(q => q.id === expandedCard);

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.3 }}
      className="w-full bg-white/40 dark:bg-zinc-900/10 backdrop-blur-md border border-zinc-200 dark:border-zinc-900 rounded-3xl p-6 relative transition-all duration-300 shadow-xs"
    >
      {/* Background ambient lighting */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-radial from-purple-500/5 dark:from-purple-500/10 via-transparent to-transparent pointer-events-none" />
      <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-radial from-emerald-500/5 dark:from-emerald-500/8 via-transparent to-transparent pointer-events-none" />

      {/* Header of the reflection box */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 border-b border-zinc-200 dark:border-zinc-900 pb-5 mb-6 relative z-10">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-1 rounded bg-purple-500/10 border border-purple-500/20 text-purple-600 dark:text-purple-400">
              <HelpCircle className="w-4 h-4" />
            </span>
            <span className="text-[10px] font-mono font-bold tracking-widest uppercase text-zinc-500">
              Autoexamen Filosófico
            </span>
          </div>
          <h3 className="text-lg font-extrabold text-zinc-950 dark:text-white tracking-tight">
            Una breve pausa para la reflexión
          </h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 font-light max-w-2xl leading-relaxed">
            No pretendemos decirte qué pensar, sino invitarte a explorar la coherencia de tus convicciones cotidianas. Mostramos 3 preguntas aleatorias de nuestro catálogo.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            onClick={handleShuffle}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-bold font-mono text-zinc-650 hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-white border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-950 transition-all cursor-pointer select-none active:scale-98"
            title="Cambiar a otras 3 preguntas"
          >
            <motion.div
              animate={{ rotate: spinDegrees }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
              className="flex items-center justify-center"
            >
              <Shuffle className="w-3.5 h-3.5 text-purple-500 dark:text-purple-400" />
            </motion.div>
            <span>NUEVAS PREGUNTAS</span>
          </button>
          
          <button
            onClick={handleHide}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-bold font-mono text-zinc-400 hover:text-zinc-700 dark:text-zinc-650 dark:hover:text-zinc-350 border border-zinc-200 dark:border-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-950 transition-all cursor-pointer select-none"
            title="Ocultar esta sección"
          >
            <EyeOff className="w-3.5 h-3.5" />
            <span>OCULTAR GUÍA</span>
          </button>
        </div>
      </div>

      {/* Main stable layout with smooth tween morphing transitions */}
      <div className="relative z-10 w-full">
        <div
          className={`flex flex-col md:flex-row w-full relative transition-all duration-400 ${
            expandedCard !== null ? "gap-0" : "gap-5"
          }`}
        >
          {visibleQuestions.map((item) => {
            const isExpanded = expandedCard === item.id;
            const isAnyExpanded = expandedCard !== null;
            const isThisCollapsed = isAnyExpanded && !isExpanded;
            const Icon = item.icon;

            return (
              <motion.div
                key={item.id}
                layout
                transition={{
                  layout: { type: "tween", ease: [0.25, 1, 0.5, 1], duration: 0.45 },
                  opacity: { type: "tween", ease: "easeOut", duration: 0.3 }
                }}
                onClick={() => !isExpanded && handleToggleCard(item.id)}
                className={`group flex flex-col rounded-2xl border text-left bg-white dark:bg-zinc-950/40 relative overflow-hidden transition-all duration-400 select-none ${
                  isExpanded
                    ? `${item.activeBorderClass} shadow-md p-6 w-full h-[310px] md:h-[285px] md:flex-[3]`
                    : isThisCollapsed
                    ? "w-0 md:w-0 h-0 md:h-0 opacity-0 p-0 border-0 overflow-hidden pointer-events-none md:flex-[0]"
                    : "border-zinc-200 dark:border-zinc-900 shadow-xs hover:-translate-y-0.5 cursor-pointer hover:shadow-md md:flex-1 h-[310px] md:h-[285px] p-5 w-full"
                }`}
              >
                {/* Subtle gradient matching card category */}
                <div className={`absolute inset-0 bg-gradient-to-b ${item.colorClass} opacity-40 pointer-events-none`} />

                {!isThisCollapsed && (
                  <div className="w-full h-full flex flex-col justify-between relative z-10">
                    {!isExpanded ? (
                      // Collapsed Card Content (stable and simple)
                      <div className="flex flex-col justify-between h-full w-full">
                        <div className="flex items-center justify-between w-full">
                          <span className="text-[9px] font-mono font-bold tracking-wider px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-500">
                            {item.badgeText}
                          </span>
                        </div>

                        <div className="space-y-1.5 flex-1 my-3">
                          <div className="flex items-center gap-1.5">
                            <Icon className="w-4 h-4 text-zinc-450 dark:text-zinc-400" />
                            <h4 className="text-xs font-bold text-zinc-850 dark:text-zinc-200 font-mono uppercase tracking-wider">
                              {item.title}
                            </h4>
                          </div>
                          <p className="text-[12.5px] text-zinc-650 dark:text-zinc-350 leading-relaxed font-medium">
                            {item.question}
                          </p>
                        </div>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleToggleCard(item.id);
                          }}
                          className="w-full pt-3 mt-1 border-t border-zinc-100 dark:border-zinc-900/60 text-[9.5px] font-bold font-mono text-zinc-450 group-hover:text-zinc-600 dark:group-hover:text-zinc-300 transition-colors flex items-center justify-between cursor-pointer focus:outline-none"
                        >
                          <span>Profundizar pensamiento</span>
                          <ChevronDown className="w-3.5 h-3.5 -rotate-90" />
                        </button>
                      </div>
                    ) : (
                      // Expanded Card Content
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full h-full">
                        {/* Column 1: The Question & Toggle Return */}
                        <div className="flex flex-col justify-between h-full space-y-4 md:border-r border-zinc-200 dark:border-zinc-900/60 md:pr-6">
                          <div className="space-y-3">
                            <span className="inline-block self-start text-[9px] font-mono font-bold tracking-wider px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-500">
                              {item.badgeText}
                            </span>

                            <div className="space-y-1.5">
                              <div className="flex items-center gap-1.5">
                                <Icon className="w-4 h-4 text-zinc-450 dark:text-zinc-400" />
                                <h4 className="text-xs font-bold text-zinc-850 dark:text-zinc-200 font-mono uppercase tracking-wider">
                                  {item.title}
                                </h4>
                              </div>
                              <p className="text-[13px] text-zinc-850 dark:text-zinc-200 leading-relaxed font-semibold">
                                {item.question}
                              </p>
                            </div>
                          </div>

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleToggleCard(item.id);
                            }}
                            className="w-full pt-3 border-t border-zinc-100 dark:border-zinc-900/60 text-[9.5px] font-bold font-mono text-zinc-450 hover:text-zinc-650 dark:text-zinc-400 dark:hover:text-white transition-colors flex items-center justify-between cursor-pointer focus:outline-none"
                          >
                            <span>Volver a las preguntas</span>
                            <ChevronDown className="w-3.5 h-3.5 rotate-90" />
                          </button>
                        </div>

                        {/* Column 2: Detailed Reflection */}
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.15, duration: 0.3 }}
                          className="flex flex-col justify-between h-full space-y-3 md:border-r border-zinc-200 dark:border-zinc-900/60 md:pr-6 min-h-0"
                        >
                          <div className="space-y-3 flex flex-col flex-1 min-h-0">
                            <div className="flex items-center gap-1.5 shrink-0">
                              <span className="p-0.5 rounded bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-500">
                                <HelpCircle className="w-3.5 h-3.5 text-zinc-450 dark:text-zinc-400" />
                              </span>
                              <h4 className="text-[9.5px] font-bold text-zinc-450 dark:text-zinc-355 font-mono uppercase tracking-wider">
                                REFLEXIÓN DETALLADA
                              </h4>
                            </div>
                            <div className="flex-1 overflow-y-auto max-h-[160px] md:max-h-[190px] pr-1 text-[11.5px] text-zinc-650 dark:text-zinc-400 leading-relaxed font-light custom-scrollbar select-text">
                              {item.reflection}
                            </div>
                          </div>
                        </motion.div>

                        {/* Column 3: Autoexamen (Deep-dive) */}
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.2, duration: 0.3 }}
                          className="flex flex-col justify-between h-full space-y-3 min-h-0"
                        >
                          <div className="space-y-3 flex flex-col flex-1 min-h-0">
                            <div className="flex items-center gap-1.5 shrink-0">
                              <span className="p-0.5 rounded bg-purple-500/10 border border-purple-500/20 text-purple-600 dark:text-purple-400">
                                <Sparkles className="w-3.5 h-3.5" />
                              </span>
                              <h4 className="text-[9.5px] font-bold text-purple-650 dark:text-purple-455 font-mono uppercase tracking-wider">
                                AUTOEXAMEN
                              </h4>
                            </div>
                            <div className="bg-zinc-100/50 dark:bg-zinc-900/60 p-4 rounded-xl border border-zinc-200/50 dark:border-zinc-850/50 flex-1 flex items-center justify-center min-h-0 select-text">
                              <p className="text-[11.5px] text-zinc-900 dark:text-zinc-250 leading-relaxed italic font-semibold text-center w-full">
                                &ldquo;{item.deepDiveQuestion}&rdquo;
                              </p>
                            </div>
                          </div>
                        </motion.div>
                      </div>
                    )}
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}
