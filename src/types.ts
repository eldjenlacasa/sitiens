export type ConsensusType = "CONSENSO" | "ESCENARIO_GRIS" | "DILEMA" | "FALACIA";

export interface NodeDetail {
  id: string;
  category: "sintiencia" | "historia" | "clima" | "eleccion";
  title: string;
  shortDesc: string;
  longDesc: string;
  scientificFacts: string[];
  connections: string[]; // connects to other node IDs
  citation?: string; // Academic reference
}

export interface DilemmaDetail {
  id: string;
  category: "sintiencia" | "historia" | "clima" | "eleccion";
  title: string;
  popularStatement: string;
  consensus: ConsensusType;
  scientificDeconstruction: string;
  philosophicalDeconstruction: string;
  coexistenceImpact: string;
  citation?: string; // Academic reference
}

export const CORE_NODES: NodeDetail[] = [
  // SINTIENCIA
  {
    id: "dolor-fisico",
    category: "sintiencia",
    title: "El Dolor Físico y el SNC",
    shortDesc: "La presencia demostrada de sistema nervioso central y nociceptores homólogos en vertebrados.",
    longDesc: "La nocicepción es la capacidad de detectar un daño tisular nocivo. La neurobiología moderna confirma que todos los vertebrados (mamíferos, aves, reptiles, anfibios, peces) poseen un sistema nervioso central, receptores de dolor (nociceptores) y vías cerebrales complejas (como el tálamo y el córtex frontal) capaces de traducir los impulsos electroquímicos en una experiencia subjetiva consciente de dolor y estrés psicológico.",
    scientificFacts: [
      "Los animales muestran conductas de evitación condicionada, automedicación analgésica y cambios en la frecuencia cardíaca ante dolor estimulado.",
      "La Declaración de Cambridge sobre la Conciencia (2012) afirma formalmente que los animales no humanos tienen los sustratos neuroanatómicos para generar conciencia de sí y de su entorno."
    ],
    connections: ["zonas-grises", "frontera-vegetal", "disonancia-placer", "el-brambell-report"],
    citation: "Low, P., Panksepp, J., Reiss, D., Edelman, D., Van Swinderen, B., & Koch, C. (2012). The Cambridge Declaration on Consciousness."
  },
  {
    id: "zonas-grises",
    category: "sintiencia",
    title: "Zonas Grises: Bivalvos e Insectos",
    shortDesc: "El debate del procesamiento del dolor en seres sin encefalización compleja.",
    longDesc: "En las fronteras de la sintiencia animal se encuentran organismos como los moluscos bivalvos (mejillones, ostras) e insectos. Mientras que los bivalvos carecen de encéfalo central y nocicepción demostrada (poseen ganglios neurales simples que responden a estímulos de forma refleja), los insectos muestran comportamientos de escape más complejos, pero con un procesamiento de dolor aún cuestionado. Representa un espacio estimulante de debate moral donde se suele aplicar el 'Principio de Precaución'.",
    scientificFacts: [
      "Los bivalvos no tienen receptores de dolor ni emiten respuestas neuroquímicas complejas de estrés que se asocien a la sintiencia cerebral.",
      "Ciertos insectos demuestran comportamientos de autocuidado tras lesiones, pero su cerebro descentralizado desafía la definición antropomórfica de la experiencia del sufrimiento."
    ],
    connections: ["dolor-fisico", "frontera-vegetal", "metano-emisiones"],
    citation: "Gibbons, M., Sarlak, S., & Chittka, L. (2022). Can insects feel pain? A review of the neural and behavioural evidence."
  },
  {
    id: "frontera-vegetal",
    category: "sintiencia",
    title: "La Frontera Vegetal",
    shortDesc: "Por qué las respuestas bioquímicas de las plantas no equivalen a la conciencia del dolor.",
    longDesc: "Existe una tendencia común a equiparar las respuestas adaptativas de las plantas (como emitir compuestos volátiles tras ser cortadas) con el dolor físico animal. No obstante, la ciencia demuestra que esta es una reacción mecánica, electroquímica y hormonal refleja que carece de procesamiento cognitivo, ya que las plantas no disponen de sistema nervioso central, cerebro ni redes nociceptivas para experimentar dolor subjetivo.",
    scientificFacts: [
      "Las plantas reaccionan biológicamente de la misma manera que una célula aislada o un sistema metabólico autónomo, sin sustrato cognitivo.",
      "Desde el punto de vista evolutivo, el dolor animal sirve para huir y buscar refugio. Al ser sésiles (incapaces de moverse), el dolor físico aportaría un elevado coste metabólico sin beneficio evolutivo directo para las plantas."
    ],
    connections: ["dolor-fisico", "zonas-grises", "recursos-termo"],
    citation: "Taiz, L., Alkon, D., Draguhn, A., Murphy, A., Blatt, M., Robinson, D. G., & Mallatt, J. (2019). Plant sentience: The burden of proof."
  },

  // HISTORIA
  {
    id: "animal-herramienta",
    category: "historia",
    title: "El Animal como Herramienta",
    shortDesc: "La subordinación animal como la infraestructura biológica que levantó la civilización.",
    longDesc: "Desde la domesticación primitiva en el Neolítico, los animales no humanos han actuado como la infraestructura muscular, logística, textil y nutricional de las primeras civilizaciones. El arado arrastrado por bueyes, el transporte por caballos y el uso de abono orgánico sentaron las bases del sedentarismo humano. El animal se configuró históricamente como una herramienta de rendimiento tecnológico antes de ser considerado un fin moral autónomo.",
    scientificFacts: [
      "El crecimiento cerebral humano dependió inicialmente de la densidad calórica de las grasas cocinadas antes del desarrollo agrícola sustentable.",
      "La expansión del Imperio Romano y las rutas de la seda habrían sido físicamente imposibles sin la tracción y la logística animal."
    ],
    connections: ["evolucion-dieta", "domesticacion-industrial", "suplementacion-progreso", "el-brambell-report"],
    citation: "Diamond, J. (1997). Guns, Germs, and Steel: The Fates of Human Societies."
  },
  {
    id: "evolucion-dieta",
    category: "historia",
    title: "Evolución y Nutrición Histórica",
    shortDesc: "El papel que jugó el canibalismo calórico y el procesamiento de grasas en nuestra anatomía.",
    longDesc: "El Homo sapiens evolucionó biológicamente como un omnívoro versátil. El consumo esporádico e histórico de carne aportó nutrientes ultraconcentrados esenciales en un entorno de escasez severa, liberando energía metabólica que facilitó el crecimiento e hipertrofia del cerebro humano (conforme a la hipótesis del tejido costoso). Esta adaptación histórica, sin embargo, chocará posteriormente con la disponibilidad excesiva de recursos de las urbes modernas.",
    scientificFacts: [
      "La evolución redujo la longitud de nuestro tracto digestivo digestivo comparado con primates herbívoros estrictos para digerir grasas y carnes con mayor eficiencia calórica.",
      "La necesidad histórica de densidades energéticas extremas se ha vuelto redundante hoy en día con las dietas planificadas modernas y los canales de distribución."
    ],
    connections: ["animal-herramienta", "suplementacion-progreso", "disonancia-placer"],
    citation: "Aiello, L. C., & Wheeler, P. (1995). The expensive-tissue hypothesis: the brain and the digestive system in human and primate evolution."
  },
  {
    id: "domesticacion-industrial",
    category: "historia",
    title: "Domesticación e Industria Intensiva",
    shortDesc: "La gran mutación: de la convivencia utilitaria al sistema masivo de conversión calórica.",
    longDesc: "A mediados del siglo XX, la automatización y los conocimientos sobre microbiología propiciaron el nacimiento de la ganadería industrial intensiva. Los animales fueron extirpados de los ecosistemas tradicionales y reubicados en macrogranjas configuradas como fábricas de ensamblaje. Su valor fáctico se redujo a variables de tasa de conversión alimenticia por kilo, sometiéndolos a ritmos de confinamiento biológicamente aberrantes.",
    scientificFacts: [
      "Se sacrifican más de 70.000 millones de animales terrestres anualmente, en instalaciones optimizadas puramente en términos de eficiencia calórica por unidad de espacio.",
      "El uso indiscriminado de antibióticos profilácticos en estas plantas representa el 70% del uso global de fármacos, acelerando la resistencia bacteriana."
    ],
    connections: ["animal-herramienta", "metano-emisiones", "deforestacion-ecosist", "el-brambell-report", "industria-global-hechos"],
    citation: "Harrison, R. (1964). Animal Machines: The New Factory Farming Industry."
  },
  {
    id: "el-brambell-report",
    category: "historia",
    title: "El Informe Brambell (1965)",
    shortDesc: "El origen del bienestarismo animal moderno y los primeros estándares científicos de confinamiento.",
    longDesc: "Publicado en el Reino Unido en 1965 tras el revuelo del libro 'Animal Machines' de Ruth Harrison, el Informe Brambell sentó las bases para el estudio científico del bienestar animal. De este informe surgieron las famosas 'Cinco Libertades', que hoy definen los estándares de bienestar en todo el mundo: libres de hambre/sed, de incomodidad, de dolor/enfermedad, de expresar comportamiento natural y de miedo/estrés.",
    scientificFacts: [
      "Estableció por primera vez que el sufrimiento animal incluye el aburrimiento, la frustración y el estrés psicológico crónico inducido por confinamiento.",
      "Fue el primer documento gubernamental en reconocer formalmente que los animales criados para consumo poseen necesidades complejas de conducta."
    ],
    connections: ["dolor-fisico", "animal-herramienta", "domesticacion-industrial"],
    citation: "Brambell Committee. (1965). Report of the Technical Committee to Enquire into the Welfare of Animals kept under Intensive Livestock Husbandry Systems."
  },

  // CLIMA
  {
    id: "recursos-termo",
    category: "clima",
    title: "La Termodinámica del Despilfarro",
    shortDesc: "La baja eficiencia energética de filtrar nutrientes vegetales a través de seres sintientes.",
    longDesc: "Desde una perspectiva termodinámica, la ganadería actúa como uno de los sumideros energéticos más ineficientes del planeta. Para producir 1 kilo de carne de ternera se necesitan hasta 12 o 16 kilos de grano vegetal. Esto implica desperdiciar aproximadamente el 90% de la energía biológica inicial alimentando el metabolismo propio del animal, sus huesos, calor corporal y deposiciones, en vez de destinar ese grano vegetal para el consumo directo humano.",
    scientificFacts: [
      "Alimentar directamente a la humanidad con cultivos vegetales liberaría hasta un 75% de las tierras de cultivo mundiales.",
      "Aproximadamente el 80% de las tierras agrícolas de la Tierra se dedican parcial o totalmente al ganado, pero este solo proporciona el 18% de las calorías que consume la especie humana."
    ],
    connections: ["frontera-vegetal", "metano-emisiones", "deforestacion-ecosist", "industria-global-hechos"],
    citation: "Poore, J., & Nemecek, T. (2018). Reducing food’s environmental impacts through producers and consumers."
  },
  {
    id: "metano-emisiones",
    category: "clima",
    title: "Gases de Efecto Invernadero y Metano",
    shortDesc: "El impacto devastador de los gases entéricos de efecto invernadero rápido.",
    longDesc: "La ganadería intensiva y extensiva es responsable de alrededor de un 14.5% a un 18% de las emisiones antropogénicas mundiales de gases de efecto Invernadero (GEI). La digestión entérica de rumiantes genera emisiones masivas de gas metano (CH4), un compuesto con un potencial de calentamiento global hasta 28 a 34 veces superior al del dióxido de carbono (CO2) en una escala de 100 años.",
    scientificFacts: [
      "El metano permanece menos tiempo en la atmósfera que el CO2 pero genera un forzamiento radiactivo inmediato que acelera la velocidad de desestabilización climática.",
      "Las emisiones colectivas del ganado equivalen aproximadamente al volumen emitido por todo el sector del transporte global (aviones, trenes, barcos y camiones combinados)."
    ],
    connections: ["recursos-termo", "deforestacion-ecosist", "domesticacion-industrial", "industria-global-hechos"],
    citation: "IPCC. (2019). Special Report on Climate Change and Land."
  },
  {
    id: "deforestacion-ecosist",
    category: "clima",
    title: "Devastación de Ecosistemas y Deforestación",
    shortDesc: "La sustitución masiva de ecosistemas vírgenes por monocultivos de soja forrajera.",
    longDesc: "Para sostener la demanda mundial de carne barata, se talan millones de hectáreas de bosques y selvas tropicales vírgenes (como la cuenca amazónica). Esos terrenos se destinan al pastoreo de ganado o a monocultivos gigantes de soja transgénica altamente dependientes de plaguicidas. Esto desencadena un colapso irreversible de biodiversidad endémica y elimina sumideros de carbono vitales frente a la crisis climática.",
    scientificFacts: [
      "La ganadería extensiva e intensiva estimula más de un 70% de la deforestación de la selva del Amazonas.",
      "La pérdida rápida de biodiversidad sitúa el planeta en la sexta extinción masiva de especies terrestres de la historia física de la Tierra."
    ],
    connections: ["recursos-termo", "metano-emisiones", "domesticacion-industrial", "industria-global-hechos"],
    citation: "FAO & UNEP. (2020). The State of the World's Forests: Forests, biodiversity and people."
  },
  {
    id: "industria-global-hechos",
    category: "clima",
    title: "Anatomía de la Industria Global",
    shortDesc: "Cifras críticas y realidades operacionales del sistema alimentario industrial intensivo.",
    longDesc: "La industria ganadera moderna se apoya en un sistema global altamente tecnificado e intensivo que cría y sacrifica decenas de miles de millones de seres vivos cada año. Este modelo ejerce una presión extrema sobre la biosfera y el bienestar de los animales, operando en cadenas de procesamiento hiperoptimadas donde las condiciones físicas y sociales del animal se reducen a la maximización del rendimiento económico.",
    scientificFacts: [
      "La FAO estima que más de 80.000 millones de animales terrestres (excluyendo peces y crustáceos marinos) son sacrificados cada año para consumo.",
      "La producción de carne y lácteos consume el 83% de la tierra cultivable mundial y genera aproximadamente el 56% de las emisiones agrícolas mundiales."
    ],
    connections: ["domesticacion-industrial", "recursos-termo", "metano-emisiones", "deforestacion-ecosist"],
    citation: "FAO. (2022). World Food and Agriculture: Statistical Yearbook 2022."
  },

  // ELECCION
  {
    id: "disonancia-placer",
    category: "eleccion",
    title: "Disonancia Cognitiva y Placer",
    shortDesc: "Por qué amamos a unos seres vivos y nos sentamos en la mesa a devorar a otros.",
    longDesc: "El ser humano moderno manifiesta una profunda disonancia cognitiva moral. Desarrollamos sentimientos de gran empatía y cuidado por animales de compañía (perros, gatos, caballos) a los que dotamos de valor intrínseco y derechos, mientras que financiamos de forma indirecta el confinamiento de cerdos, gallinas o terneros que ostentan capacidades neurológicas análogas de experimentar dolor y apego social. El sabor, el placer y la tradición cultural actúan como la anestesia mental contra esta inconsistencia moral interna.",
    scientificFacts: [
      "Estudios etológicos revelan que los cerdos superan a los perros en ciertas tareas de resolución lógica de problemas y tienen una autoconciencia cognitiva sofisticada.",
      "La disonancia moral se gestiona mediante la 'paradoja de la carne': racionalizamos el consumo despojando mentalmente de sintiencia y personalidad cognitiva a los animales de granja."
    ],
    connections: ["dolor-fisico", "evolucion-dieta", "axiomas-morales", "utilitarismo-singer", "ecofeminismo-adams"],
    citation: "Loughnan, S., Bastian, B., & Haslam, N. (2014). The psychology of eating animals."
  },
  {
    id: "suplementacion-progreso",
    category: "eleccion",
    title: "Suplementación y Progreso Tecnológico",
    shortDesc: "Cómo la biotecnología moderna nos independiza finalmente de la depredación biológica.",
    longDesc: "Por primera vez en millones de años de evolución biogenética, la especie humana dispone de un sistema de síntesis bacteriana capaz de producir vitamina B12 (cobalamina) sin necesidad de sacrificar o parasitar animales. El progreso industrial y los alimentos enriquecidos rompen el lazo de la necesidad nutricional fáctica de los omnívoros, trasladando de inmediato el debate dietético directo del terreno biológico inevitable al ámbito ético voluntario.",
    scientificFacts: [
      "La vitamina B12 de origen animal se origina realmente en las bacterias del suelo antes de ser asimilada por el animal; el ganado industrial moderno es de hecho suplementado con cobalamina de laboratorio debido al desgaste industrial de los campos agrarios.",
      "La biotecnología alimentaria moderna nos dota de un control absoluto para formular una nutrición balanceada y óptima basada 100% en plantas."
    ],
    connections: ["evolucion-dieta", "animal-herramienta", "axiomas-morales"],
    citation: "Rizzo, G. et al. (2016). Vitamin B12 sources and bioavailability: Systematic review."
  },
  {
    id: "axiomas-morales",
    category: "eleccion",
    title: "Los Axiomas Morales de la Alimentación",
    shortDesc: "El choque fundamental de ideales: la evitación del dolor individual frente a la supremacía antropogénica.",
    longDesc: "Las decisiones humanas sobre la comida residen sobre ideales éticos fundamentales y a menudo inconscientes. Por un lado, el utilitarismo sintiente argumenta que causar daño severo para obtener un beneficio menor (placer sensorial efímero) es inmoral. Por otro lado, la supremacía antropocéntrica sitúa al Homo sapiens como el único depositario de dignidad moral al ostentar habilidades abstractas, relegando el resto de las vidas fácticas a meras mercancías sustituibles de mercado.",
    scientificFacts: [
      "La filosofía contemporánea defiende que si un ser 'siente un dolor que le importa a sí mismo', privarlo de experimentar bienestar futuro requiere un motivo fáctico de subsistencia real o fuerza mayor, no mero capricho estético u ocio.",
      "El cuestionamiento de los axiomas tradicionales constituye el primer paso para salir de la parálisis social y asumir acciones individuales coherentes."
    ],
    connections: ["disonancia-placer", "suplementacion-progreso", "dolor-fisico", "utilitarismo-singer", "deontologia-regan", "enfoque-capacidades-nussbaum"],
    citation: "Bentham, J. (1789). An Introduction to the Principles of Morals and Legislation."
  },
  {
    id: "utilitarismo-singer",
    category: "eleccion",
    title: "Utilitarismo y Singer",
    shortDesc: "La deconstrucción del especismo mediante el principio de igual consideración de intereses.",
    longDesc: "En 'Liberación Animal' (1975), Peter Singer argumenta que el límite moral de nuestras decisiones debe basarse en la capacidad de sufrir y experimentar bienestar (sintiencia), y no en la inteligencia o la especie. Define el 'especismo' como un prejuicio arbitrario similar al racismo o al sexismo, exigiendo que dolores equivalentes reciban el mismo peso ético.",
    scientificFacts: [
      "El utilitarismo argumenta que no hay justificación moral racional para no tomar el dolor de un animal en la misma consideración que el dolor de un humano.",
      "Singer demuestra cómo los hábitos alimentarios modernos se sostienen mediante la instrumentalización sistemática de seres con plena sintiencia."
    ],
    connections: ["axiomas-morales", "disonancia-placer", "deontologia-regan"],
    citation: "Singer, P. (1975). Animal Liberation: A New Ethics for our Treatment of Animals."
  },
  {
    id: "deontologia-regan",
    category: "eleccion",
    title: "Deontología y Tom Regan",
    shortDesc: "El valor intrínseco de los seres que son 'sujetos-de-una-vida'.",
    longDesc: "Tom Regan defiende en 'El Caso de los Derechos de los Animales' (1983) un marco de derechos absolutos. Ciertos animales son 'sujetos-de-una-vida': tienen deseos, memoria, sentimientos y una vida emocional. Esto les dota de un 'valor intrínseco' absoluto, prohibiendo moralmente instrumentalizarlos como meras mercancías o medios para fines humanos.",
    scientificFacts: [
      "El concepto de 'sujeto-de-una-vida' exige ir más allá del mero bienestarismo; prohíbe el uso biológico de los animales independientemente de cuán humanitario sea el proceso.",
      "Aplica éticamente a todos los mamíferos y aves, extendiéndose a otros vertebrados según la evidencia neurológica contemporánea."
    ],
    connections: ["axiomas-morales", "utilitarismo-singer", "enfoque-capacidades-nussbaum"],
    citation: "Regan, T. (1983). The Case for Animal Rights."
  },
  {
    id: "ecofeminismo-adams",
    category: "eleccion",
    title: "Ecofeminismo y Carol J. Adams",
    shortDesc: "El vínculo estructural entre el patriarcado, la dominación de la mujer y los animales.",
    longDesc: "En 'La Política Sexual de la Carne' (1990), Carol J. Adams analiza cómo el patriarcado y el especismo están estructuralmente interconectados. Introduce el concepto de 'referente ausente': la forma en que el lenguaje y la industria culinaria invisibilizan al animal vivo detrás de palabras como 'carne', fragmentando su cuerpo para eliminar la empatía subjetiva de forma similar a la cosificación.",
    scientificFacts: [
      "La cultura alimentaria asocia históricamente la ingesta de carne con la virilidad, la fuerza y la dominación masculina sobre la naturaleza.",
      "Despojar a los animales de su individualidad subjetiva mediante el lenguaje comercial neutraliza la disonancia cognitiva en el consumidor de consumo masivo."
    ],
    connections: ["disonancia-placer", "axiomas-morales"],
    citation: "Adams, C. J. (1990). The Sexual Politics of Meat: A Feminist-Vegetarian Critical Theory."
  },
  {
    id: "enfoque-capacidades-nussbaum",
    category: "eleccion",
    title: "Capacidades y Nussbaum",
    shortDesc: "La justicia aristotélica aplicada al derecho animal a florecer según su propia naturaleza.",
    longDesc: "Martha Nussbaum expande el 'Enfoque de las Capacidades' hacia la ética animal. Sostiene que los animales son sujetos de justicia activa y tienen derecho a florecer de acuerdo con su propia especie. La sociedad humana tiene el deber ético de garantizar que los animales dispongan de oportunidades para desplegar sus capacidades básicas (juego, vida social, integridad y libertad de movimiento).",
    scientificFacts: [
      "Nussbaum define que causar daño sistemático a las capacidades naturales esenciales de una especie animal constituye una injusticia constitucional fundamental.",
      "Propone un marco legal cosmopolita que otorga estatus moral directo a los animales no humanos frente a los estados nación."
    ],
    connections: ["axiomas-morales", "deontologia-regan"],
    citation: "Nussbaum, M. C. (2006). Frontiers of Justice: Disability, Nationality, Species Membership."
  }
];

export const DILEMMAS_DATA: DilemmaDetail[] = [
  {
    id: "leones-carne",
    category: "historia",
    title: "El Argumento de la Cadena Trófica",
    popularStatement: "Los leones comen carne en la naturaleza, por tanto es natural que los seres humanos hagamos lo mismo.",
    consensus: "FALACIA",
    scientificDeconstruction: "Los felinos obligatorios carecen de la capacidad fisiológica para sintetizar ciertos aminoácidos y lípidos de origen vegetal, siendo carnívoros biológicos estrictos. El ser humano, en cambio, es un omnívoro flexible que asimila con excelente rendimiento de salud todos los macronutrientes de fuentes vegetales. Además, los animales no crean industrias de tortura, no modifican genéticamente a sus presas ni sostienen macrogranjas masivas destructivas sobre la biosfera.",
    philosophicalDeconstruction: "Este razonamiento cae directamente en la 'Falacia Naturalista' o ley de Hume: asumir que 'lo que es' en la naturaleza determina inmediatamente 'lo que debe ser' en el terreno ético. Un león carece de racionalidad moral y no puede ser juzgado por sus actos depredadores. Los humanos, al gozar de capacidad de juicio ético, decisiones deliberadas y suplementos nutricionales, no podemos justificar decisiones morales basándonos en comportamientos instintivos o salvajes.",
    coexistenceImpact: "Relegarse a la cadena trófica salvaje para justificar la destrucción artificial industrial de 70.000 millones de vidas es una renuncia voluntaria al libre albedrío y al discernimiento humanitario.",
    citation: "Singer, P. (1975). Animal Liberation (Chapter 6)."
  },
  {
    id: "plantas-sienten-dolor",
    category: "sintiencia",
    title: "La Sensibilidad de las Plantas",
    popularStatement: "Las plantas también sienten dolor al ser cosechadas, así que comer lechuga es igual que comer ternera.",
    consensus: "FALACIA",
    scientificDeconstruction: "Las plantas reaccionan a agresiones mediante señales químicas, eléctricas u hormonales automáticas (como emitir ácido jasmónico o gases etilénicos). Estas respuestas bioquímicas reflejas carecen de traducción cognitiva subjetiva. Las plantas carecen de nociceptores, sistema nervioso centralizado y cerebro, indispensables para que esas señales eléctricas se perciban intelectualmente como 'dolor' o 'sufrimiento'.",
    philosophicalDeconstruction: "Incluso si aceptásemos hipotéticamente el absurdo científico de que las plantas sufren, el omnivorismo humano seguiría devorando hasta 10 veces más vidas vegetales que una dieta vegetal directa. Esto se debe a la ineficiencia termodinámica del ganado, que necesita comer toneladas de soja y pasto para generar un solo kilo de músculo del que alimentarse. La minimización del daño exige reducir el intermediario cárnico.",
    coexistenceImpact: "Equiparar la defensa bioquímica refleja de un vegetal que no ostenta conciencia con el sufrimiento consciente y el trauma relacional de una vaca o un cerdo delata una profunda simplificación.",
    citation: "Taiz, L. et al. (2019). Plant sentience: The burden of proof."
  },
  {
    id: "bivalvos-ostras",
    category: "sintiencia",
    title: "El Dilema de los Bivalvos",
    popularStatement: "¿Es moralmente aceptable el consumo de bivalvos como mejillones u ostras con total tranquilidad?",
    consensus: "ESCENARIO_GRIS",
    scientificDeconstruction: "Los bivalvos (mejillones, almejas, ostras) son moluscos sésiles extremadamente simples. Carecen de encéfalo central, cerebro o sistema nervioso centralizado; tan solo ostentan una red descentralizada de ganglios neurales sencillos. La biología no halla indicios de nocicepción activa ni estrés doloroso análogo al de los vertebrados. Además, su cultivo no requiere forraje, filtra agua y genera una huella de carbono sumamente diminuta.",
    philosophicalDeconstruction: "Este es un conflicto ético que divide posturas. El pragmatismo utilitarista afirma que consumir bivalvos es perfectamente correcto, pues no genera dolor neto en el universo y reduce el impacto de otros cultivos de plantas que sí exigen recolección mecanizada peligrosa para roedores en el campo. El abolicionismo, en cambio, defiende el principio de precaución: ante la falta de una certeza experimental absoluta de amoralidad, es preferible no considerarlos mercancías mercantiles comestibles.",
    coexistenceImpact: "Un área gris fértil que demuestra que trazar la línea requiere evaluar con tremenda humildad la graduación de la conciencia biológica humana y animal.",
    citation: "Cox, C. (2010). Ethical considerations of bivalve consumption in vegan diets."
  },
  {
    id: "granja-feliz-ecologia",
    category: "eleccion",
    title: "El Argumento de la Granja Feliz",
    popularStatement: "Consumir animales criados en libertad (ganadería ecológica) y sacrificados con métodos indoloros no tiene nada de malo.",
    consensus: "DILEMA",
    scientificDeconstruction: "Aunque en la ganadería ecológica tradicional el animal dispone de un bienestar diario infinitamente superior al infierno industrial, el sacrificio se ejecuta a una edad extremadamente temprana comparada con su longevidad biológica natural. Una vaca es sacrificada antes de los 2 años de vida, cuando podría llegar a vivir de forma saludable unos 20 años. Además, este modelo de pastoreo extensivo requiere una superficie de tierra tan gigantesca que es físicamente inviable para nutrir a la humanidad.",
    philosophicalDeconstruction: "Este es el núcleo de la paradoja de la muerte indolora (Epicureísmo vs Teoría de la Privación). El bienestarismo afirma que una vaca recibe una existencia digna que de otro modo nunca habría disfrutado, de modo que su balance vital es positivo. El abolicionismo de derechos réplica que, aunque no haya dolor físico fáctico al morir, matar al animal lo priva injustamente de un futuro repleto de experiencias vitales agradables por puro ociosidad sensorial humana.",
    coexistenceImpact: "Una tensión directa entre admitir que los animales son sujetos con valor intrínseco e irremplazables ante el universo, o meros recipientes de bienestar intercambiables.",
    citation: "Regan, T. (1983). The Case for Animal Rights (Chapter 8)."
  },
  {
    id: "conservacion-dehesas",
    category: "clima",
    title: "La Paradoja de la Ganadería Sostenible",
    popularStatement: "Si eliminamos el ganado, ecosistemas protegidos como la dehesa ibérica o las de montaña desaparecerían por completo.",
    consensus: "DILEMA",
    scientificDeconstruction: "Ecosistemas antrópicos como las dehesas mediterráneas o las praderas alpinas de alta montaña dependen del pastoreo de ganado rumiante para conservar su equilibrio de biodiversidad, limpiar matorrales de cara a frenar incendios incontrolables y reciclar fertilidad en el suelo local. Eliminar drásticamente este ganado degradaría estos paisajes, destruyendo directamente el hábitat idóneo de cientos de especies de aves, insectos, polinizadores y flora.",
    philosophicalDeconstruction: "Este es un conflicto ético brutal entre el enfoque 'individualista' (interés moral de la vaca individual a no ser explotada) y el enfoque 'ecocéntrico' (deber de conservar el ecosistema colectivo, el paisaje común y su biodiversidad integrada). Al priorizar lo ecocéntrico, el pastoreo de carne en baja densidad es una herramienta simbiótica noble; al priorizar lo individual, es uso ilícito del ser sintiente.",
    coexistenceImpact: "Nos sitúa delante del espejo más áspero: a veces proteger la integridad global de la biosfera choca con nuestros mandatos absolutos de derechos individuales.",
    citation: "Callicott, J. B. (1980). Animal liberation: A triangular affair."
  },
  {
    id: "comer-insectos-harinas",
    category: "eleccion",
    title: "La Apuesta del Consumo de Insectos",
    popularStatement: "La entomofagia (ingerir grillos o gusanos) es el sustituto ideal de la ganadería barata para proteger el cambio climático.",
    consensus: "ESCENARIO_GRIS",
    scientificDeconstruction: "La producción de proteínas a base de harinas de insectos es termodinámicamente colosalmente más eficiente que los mamíferos, emitiendo un 99% menos de metano y consumiendo apenas agua y territorio fértil. Sin embargo, la ciencia aún debate las complejidades sintientes de los artrópodos: demuestran aprendizaje, pero se sospecha que sus respuestas neurales son predominantemente reflejas, sin la presencia de dolor emocional conscientes.",
    philosophicalDeconstruction: "Si el dolor es nulo o mínimo, esta práctica es una alternativa maravillosa para erradicar las destructivas macrogranjas a escala barata. Para el veganismo abolicionista absoluto, cultivar insectos por millardos en jaulas mecanizadas sigue perpetuando al ser humano como amo, señor y manipulador absoluto del resto de las vidas biológicas sintientes cerebrales del planeta.",
    coexistenceImpact: "Un portal híbrido fascinante donde la urgencia de salvar la biosfera del cambio climático se enfrenta a nuestras teorías sobre las microconciencias neurales.",
    citation: "Chittka, L. (2022). The Mind of a Bee."
  },
  {
    id: "humanos-caninos-biologia",
    category: "historia",
    title: "La Dentadura y Caninos Humanos",
    popularStatement: "Nuestros dientes tienen caninos (colmillos), lo que demuestra biológicamente que estamos hechos para triturar carne.",
    consensus: "FALACIA",
    scientificDeconstruction: "Los colmillos o caninos humanos son morfológica y fisiológicamente inapropiados para la desgarradura de pieles y huesos de presas salvajes, comparados con la dentadura de mamíferos carnívoros verdaderos (gatos, leones). De hecho, nuestros caninos son protuberancias reducidas vestigiales de una herencia evolutiva homínida, adaptados fácticamente para pelar frutos duros o vegetales, mientras que nuestros molares planos están optimizados para trillar grano.",
    philosophicalDeconstruction: "Considerar que una característica morfológica física de valor vestigial o parcial nos impone un mandato ético obligatorio de alimentación destructiva es una pirueta mental extrema. Al ser agentes dotados de razón deliberativa y estanterías de supermercados repletas de alternativas sanas directas, no podemos justificar decisiones morales basándonos en analogías dentales limitadas erróneas.",
    coexistenceImpact: "Someter nuestro juicio moral moderno a una tosca malinterpretación de la anatomía bucal revela la fuerza con la que nos aferramos a racionalizaciones para proteger el hábito.",
    citation: "Ungar, P. S. (2010). Mammal Teeth: Origin, Evolution, and Diversity."
  },
  {
    id: "ganaderia-industrial-hecho",
    category: "clima",
    title: "La Ganadería Industrial es Sostenible",
    popularStatement: "La carne de macrogranjas es necesaria para alimentar al mundo de forma barata y es sostenible con las nuevas tecnologías.",
    consensus: "CONSENSO",
    scientificDeconstruction: "La ineficiencia calórica estructural de filtrar grano vegetal a través del ganado es inalterable por la física y la digestión. La industria intensiva acelera de forma científicamente incuestionable la eutrofización de acuíferos locales (por purines de cerdos), contamina el suelo mediante amoníaco, consume un volumen colosal de agua dulce y deforesta selvas para piensos, siendo insostenible con cualquier limitación térmica planetaria de cara al siglo XXI.",
    philosophicalDeconstruction: "No existe justificación filosófica seria que defienda someter a miles de millones de seres vivos con demostrada nocicepción a un sufrimiento crónico masivo diario con el fin de proteger las plusvalías de una industria gastronómica ineficiente y redundante. Este hecho une a utilitaristas, ecocentristas, defensores de derechos y humanistas en una opinión unánime: la macrogranja es una anomalía ética aberrante irremediable.",
    coexistenceImpact: "La abolición del apoyo financiero pasivo a las macrogranjas constituye el escalón mínimo indispensable y urgente de cualquier andamiaje moral humano sincero de hoy.",
    citation: "Poore, J., & Nemecek, T. (2018). Reducing food’s environmental impacts."
  },
  {
    id: "el-argumento-del-antropocentrismo-cartesiano",
    category: "sintiencia",
    title: "El Autómata Cartesiano",
    popularStatement: "René Descartes argumentaba que los animales son máquinas biológicas sin alma ni capacidad de sufrir dolor real.",
    consensus: "FALACIA",
    scientificDeconstruction: "La neurobiología moderna rechaza tajantemente a Descartes. La Declaración de Cambridge sobre la Conciencia (2012) determinó que los animales poseen los sustratos anatómicos y químicos necesarios para la conciencia subjetiva. El dolor físico animal activa nociceptores, vías talámicas y respuestas complejas de comportamiento e incremento de hormonas del estrés idénticas a las humanas.",
    philosophicalDeconstruction: "La hipótesis cartesiana sirvió históricamente como justificación teológica para legitimar la disección y explotación sistemática sin remordimientos éticos. Racionalizar el abuso privando al sujeto de su experiencia interna es una defensa psicológica para neutralizar la compasión elemental. Carece de cualquier fundamento científico o lógico actual.",
    coexistenceImpact: "Tratar a seres con capacidades biológicas sofisticadas de sufrimiento como simples engranajes mecánicos deshumaniza nuestra propia empatía y capacidad ética.",
    citation: "Descartes, R. (1637). Discurso del método (Parte V); Low, P. et al. (2012). The Cambridge Declaration on Consciousness."
  },
  {
    id: "el-argumento-del-contrato-social",
    category: "eleccion",
    title: "El Límite del Contrato Social",
    popularStatement: "Los animales no pueden firmar el contrato social ni respetar nuestros derechos, por tanto no tenemos deberes morales hacia ellos.",
    consensus: "FALACIA",
    scientificDeconstruction: "Si bien los animales no humanos carecen de la capacidad cognitiva abstracta para formalizar contratos jurídicos, la biología confirma que son pacientes con plena capacidad sensitiva. El hecho de que un ser vivo no comprenda un deber legal no neutraliza su capacidad física para experimentar dolor, miedo o estrés provocado por nuestras acciones directas.",
    philosophicalDeconstruction: "Este argumento confunde 'agentes morales' (quienes razonan deberes) con 'pacientes morales' (quienes merecen consideración ética). Los humanos con discapacidad cognitiva severa, bebés o personas con demencia tampoco firman contratos ni asumen deberes, pero les otorgamos plenos derechos debido a su vulnerabilidad y sintiencia. Excluir a los animales basándose en la especie es especismo.",
    coexistenceImpact: "Trazar los límites de la compasión únicamente sobre la base de la reciprocidad legal convalida una ética de la dominación sobre los más vulnerables.",
    citation: "Regan, T. (1983). The Case for Animal Rights; Rowlands, M. (2012). Can Animals Be Moral?."
  },
  {
    id: "el-argumento-del-bienestarismo-industrial",
    category: "historia",
    title: "El Mito de la Carne Humanitaria",
    popularStatement: "Las regulaciones actuales garantizan que la carne del supermercado proviene de animales criados humanitariamente y sacrificados sin crueldad.",
    consensus: "FALACIA",
    scientificDeconstruction: "Las auditorías demuestran que a escala industrial las normas de bienestar animal no impiden condiciones crónicas de hacinamiento, amputación de colas o picos sin anestesia, y severas privaciones biológicas. El aturdimiento industrial previo al degüello (gases, choque eléctrico) falla frecuentemente debido a la velocidad extrema de las líneas de procesamiento.",
    philosophicalDeconstruction: "El bienestarismo funciona como un analgésico mental para el consumidor. Reduce el malestar psicológico de financiar la muerte industrial bajo la etiqueta de 'compasión'. Sin embargo, como explica Gary Francione, regular la explotación animal perpetúa su estatus legal de propiedad de mercado, cronificando su cosificación sistémica.",
    coexistenceImpact: "Consumir bajo la convicción de una explotación libre de dolor oculta la cruda realidad física de la mercantilización de vidas sintientes.",
    citation: "Francione, G. L. (1995). Animals, Property, and the Law; Harrison, R. (1964). Animal Machines."
  },
  {
    id: "el-argumento-de-la-prioridad-humanitaria",
    category: "eleccion",
    title: "La Prioridad Humanitaria",
    popularStatement: "Debemos solucionar la pobreza y las guerras humanas antes de preocuparnos o debatir sobre la ética de los animales.",
    consensus: "DILEMA",
    scientificDeconstruction: "Ambos problemas están sinérgicamente interconectados. Termodinámicamente, reorientar tierras de forraje ganadero hacia el consumo vegetal humano directo aumentaría la disponibilidad calórica global y abarataría alimentos. Además, las macrogranjas aceleran pandemias zoonóticas y el cambio climático, afectando principalmente a las poblaciones humanas vulnerables de países en desarrollo.",
    philosophicalDeconstruction: "Este argumento plantea una falsa dicotomía moral (falacia de bifurcación) al asumir que la empatía humana es un recurso escaso excluyente. El veganismo o el consumo ético de plantas no exige tiempo, dinero ni resta esfuerzos a las luchas sociales humanas; es simplemente una decisión pasiva cotidiana de consumo que retira la financiación a un sistema destructivo.",
    coexistenceImpact: "Separar de forma absoluta las crisis de derechos humanos de la devastación animal ignora que ambas formas de violencia proceden de la misma lógica de dominación instrumental.",
    citation: "Adams, C. J. (1990). The Sexual Politics of Meat; Singer, P. (1975). Animal Liberation."
  }
];
