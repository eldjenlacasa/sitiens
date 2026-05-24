export type ConsensusType = "CONSENSO" | "ESCENARIO_GRIS" | "DILEMA" | "FALACIA";

export interface NodeDetail {
  id: string;
  category: "sintiencia" | "historia" | "clima" | "eleccion";
  title: string;
  shortDesc: string;
  longDesc: string;
  scientificFacts: string[];
  connections: string[]; // connects to other node IDs
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
    connections: ["zonas-grises", "frontera-vegetal", "disonancia-placer"]
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
    connections: ["dolor-fisico", "frontera-vegetal", "metano-emisiones"]
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
    connections: ["dolor-fisico", "zonas-grises", "recursos-termo"]
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
    connections: ["evolucion-dieta", "domesticacion-industrial", "suplementacion-progreso"]
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
    connections: ["animal-herramienta", "suplementacion-progreso", "disonancia-placer"]
  },
  {
    id: "domesticacion-industrial",
    category: "historia",
    title: "Domesticación e Industria Intensiva",
    shortDesc: "La gran mutación: de la convivencia utilitaria al sistema masivo de conversión calórica.",
    longDesc: "A mediados del siglo XX, la automatización y los conocimientos sobre microbiología propiciaron el nacimiento de la ganadería industrial intensiva. Los animales fueron extirpados de los ecosistemas tradicionales y reubicados en macrogranjas configuradas como fábricas de ensambmaje. Su valor fáctico se redujo a variables de tasa de conversión alimenticia por kilo, sometiéndolos a ritmos de confinamiento biológicamente aberrantes.",
    scientificFacts: [
      "Se sacrifican más de 70.000 millones de animales terrestres anualmente, en instalaciones optimizadas puramente en términos de eficiencia calórica por unidad de espacio.",
      "El uso indiscriminado de antibióticos profilácticos en estas plantas representa el 70% del uso global de fármacos, acelerando la resistencia bacteriana."
    ],
    connections: ["animal-herramienta", "metano-emisiones", "deforestacion-ecosist"]
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
    connections: ["frontera-vegetal", "metano-emisiones", "deforestacion-ecosist"]
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
    connections: ["recursos-termo", "deforestacion-ecosist", "domesticacion-industrial"]
  },
  {
    id: "deforestacion-ecosist",
    category: "clima",
    title: "Devastación de Ecosistemas y Deforestación",
    shortDesc: "La sustitución masiva de ecosistemas vírgenes por monocultivos de soja forrajera.",
    longDesc: "Para sostener la demanda mundial de carne barata, se talan millones de hectáreas de bosques y selvas tropicales vírgenes (como la cuenca amazónica). Esos terrenos se destinan al pastoreo de ganado o a monocultivos gigantes de soja transgénica altamente dependientes de plaguicidas. Esto desencadena un colapso irreversible de biodiversidad endémica y elimina sumideros de carbono vitales frente a la crisis climática.",
    scientificFacts: [
      "La ganadería extensiva y extensiva estimula más de un 70% de la deforestación de la selva del Amazonas.",
      "La pérdida rápida de biodiversidad sitúa el planeta en la sexta extinción masiva de especies terrestres de la historia física de la Tierra."
    ],
    connections: ["recursos-termo", "metano-emisiones", "domesticacion-industrial"]
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
    connections: ["dolor-fisico", "evolucion-dieta", "axiomas-morales"]
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
    connections: ["evolucion-dieta", "animal-herramienta", "axiomas-morales"]
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
    connections: ["disonancia-placer", "suplementacion-progreso", "dolor-fisico"]
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
    coexistenceImpact: "Relegarse a la cadena trófica salvaje para justificar la destrucción artificial industrial de 70.000 millones de vidas es una renuncia voluntaria al libre albedrío y al discernimiento humanitario."
  },
  {
    id: "plantas-sienten-dolor",
    category: "sintiencia",
    title: "La Sensibilidad de las Plantas",
    popularStatement: "Las plantas también sienten dolor al ser cosechadas, así que comer lechuga es igual que comer ternera.",
    consensus: "FALACIA",
    scientificDeconstruction: "Las plantas reaccionan a agresiones mediante señales químicas, eléctricas u hormonales automáticas (como emitir ácido jasmónico o gases etilénicos). Estas respuestas bioquímicas reflejas carecen de traducción cognitiva subjetiva. Las plantas carecen de nociceptores, sistema nervioso centralizado y cerebro, indispensables para que esas señales eléctricas se perciban intelectualmente como 'dolor' o 'sufrimiento'.",
    philosophicalDeconstruction: "Incluso si aceptásemos hipotéticamente el absurdo científico de que las plantas sufren, el omnivorismo humano seguiría devorando hasta 10 veces más vidas vegetales que una dieta vegetal directa. Esto se debe a la ineficiencia termodinámica del ganado, que necesita comer toneladas de soja y pasto para generar un solo kilo de músculo del que alimentarse. La minimización del daño exige reducir el intermediario cárnico.",
    coexistenceImpact: "Equiparar la defensa bioquímica refleja de un vegetal que no ostenta conciencia con el sufrimiento consciente y el trauma relacional de una vaca o un cerdo delata una profunda simplificación."
  },
  {
    id: "bivalvos-ostras",
    category: "sintiencia",
    title: "El Dilema de los Bivalvos",
    popularStatement: "¿Es moralmente aceptable el consumo de bivalvos como mejillones u ostras con total tranquilidad?",
    consensus: "ESCENARIO_GRIS",
    scientificDeconstruction: "Los bivalvos (mejillones, almejas, ostras) son moluscos sésiles extremadamente simples. Carecen de encéfalo central, cerebro o sistema nervioso centralizado; tan solo ostentan una red descentralizada de ganglios neurales sencillos. La biología no halla indicios de nocicepción activa ni estrés doloroso análogo al de los vertebrados. Además, su cultivo no requiere forraje, filtra agua y genera una huella de carbono sumamente diminuta.",
    philosophicalDeconstruction: "Este es un conflicto ético que divide posturas. El pragmatismo utilitarista afirma que consumir bivalvos es perfectamente correcto, pues no genera dolor neto en el universo y reduce el impacto de otros cultivos de plantas que sí exigen recolección mecanizada peligrosa para roedores en el campo. El abolicionismo, en cambio, defiende el principio de precaución: ante la falta de una certeza experimental absoluta de amoralidad, es preferible no considerarlos mercancías mercantiles comestibles.",
    coexistenceImpact: "Un área gris fértil que demuestra que trazar la línea requiere evaluar con tremenda humildad la graduación de la conciencia biológica humana y animal."
  },
  {
    id: "granja-feliz-ecologia",
    category: "eleccion",
    title: "El Argumento de la Granja Feliz",
    popularStatement: "Consumir animales criados en libertad (ganadería ecológica) y sacrificados con métodos indoloros no tiene nada de malo.",
    consensus: "DILEMA",
    scientificDeconstruction: "Aunque en la ganadería ecológica tradicional el animal dispone de un bienestar diario infinitamente superior al infierno industrial, el sacrificio se ejecuta a una edad extremadamente temprana comparada con su longevidad biológica natural. Una vaca es sacrificada antes de los 2 años de vida, cuando podría llegar a vivir de forma saludable unos 20 años. Además, este modelo de pastoreo extensivo requiere una superficie de tierra tan gigantesca que es físicamente inviable para nutrir a la humanidad.",
    philosophicalDeconstruction: "Este es el núcleo de la paradoja de la muerte indolora (Epicureísmo vs Teoría de la Privación). El bienestarismo afirma que una vaca recibe una existencia digna que de otro modo nunca habría disfrutado, de modo que su balance vital es positivo. El abolicionismo de derechos réplica que, aunque no haya dolor físico fáctico al morir, matar al animal lo priva injustamente de un futuro repleto de experiencias vitales agradables por puro ociosidad sensorial humana.",
    coexistenceImpact: "Una tensión directa entre admitir que los animales son sujetos con valor intrínseco e irremplazables ante el universo, o meros recipientes de bienestar intercambiables."
  },
  {
    id: "conservacion-dehesas",
    category: "clima",
    title: "La Paradoja de la Ganadería Sostenible",
    popularStatement: "Si eliminamos el ganado, ecosistemas protegidos como la dehesa ibérica o las de montaña desaparecerían por completo.",
    consensus: "DILEMA",
    scientificDeconstruction: "Ecosistemas antrópicos como las dehesas mediterráneas o las praderas alpinas de alta montaña dependen del pastoreo de ganado rumiante para conservar su equilibrio de biodiversidad, limpiar matorrales de cara a frenar incendios incontrolables y reciclar fertilidad en el suelo local. Eliminar drásticamente este ganado degradaría estos paisajes, destruyendo directamente el hábitat idóneo de cientos de especies de aves, insectos, polinizadores y flora.",
    philosophicalDeconstruction: "Este es un conflicto ético brutal entre el enfoque 'individualista' (interes moral de la vaca individual a no ser explotada) y el enfoque 'ecocéntrico' (deber de conservar el ecosistema colectivo, el paisaje común y su biodiversidad integrada). Al priorizar lo ecocéntrico, el pastoreo de carne en baja densidad es una herramienta simbiótica noble; al priorizar lo individual, es uso ilícito del ser sintiente.",
    coexistenceImpact: "Nos sitúa delante del espejo más áspero: a veces proteger la integridad global de la biosfera choca con nuestros mandatos absolutos de derechos individuales."
  },
  {
    id: "comer-insectos-harinas",
    category: "eleccion",
    title: "La Apuesta del Consumo de Insectos",
    popularStatement: "La entomofagia (ingerir grillos o gusanos) es el sustituto ideal de la ganadería barata para proteger el cambio climático.",
    consensus: "ESCENARIO_GRIS",
    scientificDeconstruction: "La producción de proteínas a base de harinas de insectos es termodinámicamente colosalmente más eficiente que los mamíferos, emitiendo un 99% menos de metano y consumiendo apenas agua y territorio fértil. Sin embargo, la ciencia aún debate las complejidades sintientes de los artrópodos: demuestran aprendizaje, pero se sospecha que sus respuestas neurales son predominantemente reflejas, sin la presencia de dolor emocional conscientes.",
    philosophicalDeconstruction: "Si el dolor es nulo o mínimo, esta práctica es una alternativa maravillosa para erradicar las destructivas macrogranjas a escala barata. Para el veganismo abolicionista absoluto, cultivar insectos por millardos en jaulas mecanizadas sigue perpetuando al ser humano como amo, señor y manipulador absoluto del resto de las vidas biológicas sintientes cerebrales del planeta.",
    coexistenceImpact: "Un portal híbrido fascinante donde la urgencia de salvar la biosfera del cambio climático se enfrenta a nuestras teorías sobre las microconciencias neurales."
  },
  {
    id: "humanos-caninos-biologia",
    category: "historia",
    title: "La Dentadura y Caninos Humanos",
    popularStatement: "Nuestros dientes tienen caninos (colmillos), lo que demuestra biológicamente que estamos hechos para triturar carne.",
    consensus: "FALACIA",
    scientificDeconstruction: "Los colmillos o caninos humanos son morfológica y fisiológicamente inapropiados para la desgarradura de pieles y huesos de presas salvajes, comparados con la dentadura de mamíferos carnívoros verdaderos (gatos, leones). De hecho, nuestros caninos son protuberancias reducidas vestigiales de una herencia evolutiva homínida, adaptados fácticamente para pelar frutos duros o vegetales, mientras que nuestros molares planos están optimizados para trillar grano.",
    philosophicalDeconstruction: "Considerar que una característica morfológica física de valor vestigial o parcial nos impone un mandato ético obligatorio de alimentación destructiva es una pirueta mental extrema. Al ser agentes dotados de razón deliberativa y estanterías de supermercados repletas de alternativas sanas directas, no podemos justificar decisiones morales basándonos en analogías dentales limitadas erróneas.",
    coexistenceImpact: "Someter nuestro juicio moral moderno a una tosca malinterpretación de la anatomía bucal revela la fuerza con la que nos aferramos a racionalizaciones para proteger el hábito."
  },
  {
    id: "ganaderia-industrial-hecho",
    category: "clima",
    title: "La Ganadería Industrial es Sostenible",
    popularStatement: "La carne de macrogranjas es necesaria para alimentar al mundo de forma barata y es sostenible con las nuevas tecnologías.",
    consensus: "CONSENSO",
    scientificDeconstruction: "La ineficiencia calórica estructural de filtrar grano vegetal a través del ganado es inalterable por la física y la digestión. La industria intensiva acelera de forma científicamente incuestionable la eutrofización de acuíferos locales (por purines de cerdos), contamina el suelo mediante amoníaco, consume un volumen colosal de agua dulce y deforesta selvas para piensos, siendo insostenible con cualquier limitación térmica planetaria de cara al siglo XXI.",
    philosophicalDeconstruction: "No existe justificación filosófica seria que defienda someter a miles de millones de seres vivos con demostrada nocicepción a un sufrimiento crónico masivo diario con el fin de proteger las plusvalías de una industria gastronómica ineficiente y redundante. Este hecho une a utilitaristas, ecocentristas, defensores de derechos y humanistas en una opinión unánime: la macrogranja es una anomalía ética aberrante irremediable.",
    coexistenceImpact: "La abolicion del apoyo financiero pasivo a las macrogranjas constituye el escalón mínimo indispensable y urgente de cualquier andamiaje moral humano sincero de hoy."
  }
];
