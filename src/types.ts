export type ConsensusType = "CONSENSO" | "ESCENARIO_GRIS" | "DILEMA" | "FALACIA";

export interface ReferenceDetail {
  id: string; // e.g. "1", "2"
  citation: string; // Full APA citation
  url?: string; // Optional official link/DOI
}

export interface NodeDetail {
  id: string;
  category: "sintiencia" | "historia" | "ecologia" | "etica";
  title: string;
  shortDesc: string;
  longDesc: string;
  scientificFacts: string[];
  connections: string[]; // connects to other node IDs
  citation?: string; // Legacy field for backwards compatibility
  references?: ReferenceDetail[];
}

export interface DilemmaDetail {
  id: string;
  category: "sintiencia" | "historia" | "ecologia" | "etica";
  title: string;
  popularStatement: string;
  consensus: ConsensusType;
  scientificDeconstruction: string;
  philosophicalDeconstruction: string;
  coexistenceImpact: string;
  citation?: string; // Legacy field for backwards compatibility
  references?: ReferenceDetail[];
}

export const CORE_NODES: NodeDetail[] = [
  // SINTIENCIA Y CONCIENCIA
  {
    id: "dolor-fisico",
    category: "sintiencia",
    title: "Sintiencia y SNC",
    shortDesc: "El sustrato neurobiológico del dolor consciente y la experiencia subjetiva en animales.",
    longDesc: "La sintiencia es la capacidad de experimentar sensaciones de manera subjetiva y consciente [1]. La neurobiología moderna demuestra que el maltrato animal no es una mera reacción refleja; los vertebrados poseen un Sistema Nervioso Central (SNC), nociceptores de dolor homólogos a los humanos y estructuras cerebrales complejas (como el tálamo y el neocórtex frontal) capaces de transformar estímulos electroquímicos en dolor emocional, estrés y suffering [2].",
    scientificFacts: [
      "La Declaración de Cambridge sobre la Conciencia (2012) confirma que los animales no humanos poseen los sustratos neuroanatómicos, neuroquímicos y neurofisiológicos para experimentar estados conscientes [1].",
      "Los animales demuestran conductas complejas de evitación del peligro, automedicación activa con fármacos analgésicos tras lesiones tisulares y respuestas endocrinas al estrés agudo homólogas a las humanas [3]."
    ],
    connections: ["zonas-grises", "frontera-vegetal", "disonancia-placer", "el-brambell-report"],
    citation: "Low, P. et al. (2012). The Cambridge Declaration on Consciousness.",
    references: [
      {
        id: "1",
        citation: "Low, P., Panksepp, J., Reiss, D., Edelman, D., Van Swinderen, B., & Koch, C. (2012). The Cambridge Declaration on Consciousness. Churchill College, University of Cambridge.",
        url: "https://fcmconference.org/img/CambridgeDeclarationOnConsciousness.pdf"
      },
      {
        id: "2",
        citation: "Sneddon, L. U. (2019). Clinical signs of pain in vertebrates and invertebrates. Journal of Experimental Biology, 222(14), jeb205773.",
        url: "https://doi.org/10.1242/jeb.205773"
      },
      {
        id: "3",
        citation: "Colpaert, F. C., Tarayre, J. P., Alliaga, M., Bruins Slot, L. A., Attal, N., & Koek, W. (2001). Opiate self-administration as a measure of chronic nociceptive pain in arthritic rats. Pain, 91(1-2), 33-45.",
        url: "https://doi.org/10.1016/S0304-3959(00)00418-8"
      }
    ]
  },
  {
    id: "zonas-grises",
    category: "sintiencia",
    title: "Zonas Grises de Conciencia",
    shortDesc: "El debate del dolor en organismos sin un encéfalo centralizado complejo.",
    longDesc: "En las fronteras de la sintiencia animal se analizan organismos como moluscos bivalvos (mejillones, ostras) e insectos [1]. Mientras los bivalvos carecen de encéfalo centralizado y nocicepción demostrada, respondiendo mediante ganglios locales [2], los insectos poseen comportamientos sofisticados pero descentralizados, lo que plantea dilemas éticos y el principio de precaución en la alimentación humana [1].",
    scientificFacts: [
      "Los insectos muestran conductas consistentes con la nocicepción y el dolor, tales como la modulación descendente del dolor (antinocicepción) y comportamientos protectores persistentes tras lesiones [1].",
      "Los moluscos bivalvos carecen de un cerebro centralizado y de nociceptores típicos, y no emiten neurotransmisores de estrés asociados al sufrimiento consciente en vertebrados [2]."
    ],
    connections: ["dolor-fisico", "frontera-vegetal", "metano-emisiones"],
    citation: "Gibbons, M. et al. (2022). Can insects feel pain? A review of the neural and behavioural evidence.",
    references: [
      {
        id: "1",
        citation: "Gibbons, M., Crump, A., Barrett, M., Sarlak, S., Birch, J., & Chittka, L. (2022). Can insects feel pain? A review of the neural and behavioural evidence. Advances in Insect Physiology, 63, 155-229.",
        url: "https://doi.org/10.1016/bs.aiip.2022.06.002"
      },
      {
        id: "2",
        citation: "Birch, J., et al. (2021). Review of the Evidence of Sentience in Cephalopod Molluscs and Decapod Crustaceans. LSE Consulting, London School of Economics.",
        url: "https://www.lse.ac.uk/News/News-Assets/PDFs/2021/Sentience-Review.pdf"
      }
    ]
  },
  {
    id: "frontera-vegetal",
    category: "sintiencia",
    title: "La Frontera Vegetal",
    shortDesc: "Por qué las respuestas biológicas de las plantas no equivalen al sufrimiento consciente.",
    longDesc: "Existe un argumento recurrente que equipara las defensas biológicas de las plantas con el sufrimiento animal [1]. Sin embargo, al carecer de sistema nervioso centralizado, nociceptores y cerebro, las plantas no sufren ni experimentan dolor emocional consciente; sus respuestas son reflejos bioquímicos sin traducción cognitiva subjetiva [2].",
    scientificFacts: [
      "Las plantas reaccionan mecánicamente a nivel celular y hormonal emitiendo fitohormonas volátiles, pero carecen de la infraestructura neurológica y de centralización necesarias para procesar experiencias subjetivas [2].",
      "Evolutivamente, al ser sésiles (inmóviles), el dolor físico consciente carece de beneficio adaptativo; para el animal, en cambio, es la señal de alarma indispensable que estimula la huida [1]."
    ],
    connections: ["dolor-fisico", "zonas-grises", "recursos-termo"],
    citation: "Taiz, L. et al. (2019). Plant sentience: The burden of proof.",
    references: [
      {
        id: "1",
        citation: "Taiz, L., Robinson, D. G., Blatt, M. R., Draguhn, A., & Mallatt, J. (2019). Plants neither possess nor require consciousness. Trends in Plant Science, 24(8), 677-687.",
        url: "https://doi.org/10.1016/j.tplants.2019.05.010"
      },
      {
        id: "2",
        citation: "Robinson, D. G., Blatt, M. R., Draguhn, A., Mallatt, J., & Taiz, L. (2023). Plant sentience: The burden of proof. Animal Sentience, 8(36), 1-12.",
        url: "https://wellbeingintlstudiesrepository.org/animsent/vol8/iss36/1/"
      }
    ]
  },

  // HISTORIA Y EXPLOTACIÓN
  {
    id: "animal-herramienta",
    category: "historia",
    title: "El Animal como Infraestructura",
    shortDesc: "La subordinación utilitaria del animal en el nacimiento de las civilizaciones humanas.",
    longDesc: "Desde la domesticación en el Neolítico, la historia humana ha estado ligada a la explotación animal [1]. Los animales sirvieron como infraestructura biológica clave: fuerza motriz para el arado, logística de transporte y abrigo textil [2]. Esta instrumentalización utilitaria sentó las bases de la civilización antes de que se estructurara la primera preocupación ética formal sobre sus vidas [3].",
    scientificFacts: [
      "El sedentarismo y la revolución agrícola dependieron de la tracción y el abono biológico generado por rumiantes domesticados [1].",
      "La expansión militar y comercial de los primeros imperios habría sido materialmente inviable sin la logística de équidos y camélidos [2]."
    ],
    connections: ["evolucion-dieta", "domesticacion-industrial", "suplementacion-progreso", "el-brambell-report"],
    citation: "Diamond, J. (1997). Guns, Germs, and Steel: The Fates of Human Societies.",
    references: [
      {
        id: "1",
        citation: "Diamond, J. (1997). Guns, Germs, and Steel: The Fates of Human Societies. W. W. Norton & Company.",
        url: "https://www.wwnorton.com/books/Guns-Germs-and-Steel/"
      },
      {
        id: "2",
        citation: "Clutton-Brock, J. (2012). A Natural History of Domesticated Mammals. Cambridge University Press.",
        url: "https://doi.org/10.1017/CBO9781139165662"
      },
      {
        id: "3",
        citation: "Bulliet, R. W. (2005). Hunters, Herders, and Hamburgers: The Past and Future of Human-Animal Relationships. Columbia University Press."
      }
    ]
  },
  {
    id: "evolucion-dieta",
    category: "historia",
    title: "Evolución y Nutrición",
    shortDesc: "El rol de la densidad calórica de origen animal en entornos históricos de escasez.",
    longDesc: "El Homo sapiens evolucionó como un omnívoro flexible. El consumo de grasas y carne animal proporcionó nutrientes concentrados que facilitaron la hipertrofia metabólica de nuestro cerebro en épocas de escasez de recursos (hipótesis del tejido costoso) [1]. Esta inercia evolutiva choca con la realidad de las sociedades modernas, donde disponemos de abundancia y alternativas nutricionales éticas y seguras [2].",
    scientificFacts: [
      "Nuestra morfología digestiva se redujo en comparación con herbívoros estrictos para digerir nutrientes de alta densidad con menor gasto energético celular [1].",
      "El desarrollo neurológico dependió de la densidad energética de la dieta cocinada, un factor hoy totalmente prescindible gracias a los cultivos planificados y la biotecnología moderna [2]."
    ],
    connections: ["animal-herramienta", "suplementacion-progreso", "disonancia-placer"],
    citation: "Aiello, L. C., & Wheeler, P. (1995). The expensive-tissue hypothesis.",
    references: [
      {
        id: "1",
        citation: "Aiello, L. C., & Wheeler, P. (1995). The expensive-tissue hypothesis: the brain and the digestive system in human and primate evolution. Current Anthropology, 36(2), 199-221.",
        url: "https://doi.org/10.1086/204350"
      },
      {
        id: "2",
        citation: "Melina, V., Craig, W., & Levin, S. (2016). Position of the Academy of Nutrition and Dietetics: Vegetarian Diets. Journal of the Academy of Nutrition and Dietetics, 116(12), 1970-1980.",
        url: "https://doi.org/10.1016/j.jand.2016.09.025"
      }
    ]
  },
  {
    id: "domesticacion-industrial",
    category: "historia",
    title: "Ganadería Industrial Intensiva",
    shortDesc: "La mutación moderna: del pastoreo utilitario al sistema de ensamblaje en cadena.",
    longDesc: "A mediados del siglo XX, la ganadería industrial intensiva transformó a los animales en meras máquinas de conversión calórica [1]. La tecnificación masiva eliminó a los seres sintientes de su hábitat natural, confinándolos en macrogranjas optimizadas únicamente en términos de coste-beneficio, sometiendo su salud física y psicológica al rendimiento mercantil [2].",
    scientificFacts: [
      "La industria global de explotación intensiva cría y sacrifica anualmente a más de 80.000 millones de animales terrestres, restringiendo drásticamente su movilidad [2].",
      "El hacinamiento masivo requiere el uso profiláctico de un porcentaje abrumador de los antibióticos mundiales (aproximadamente el 70%), acelerando la crisis de resistencia bacteriana global [3]."
    ],
    connections: ["animal-herramienta", "metano-emisiones", "deforestacion-ecosist", "el-brambell-report", "industria-global-hechos"],
    citation: "Harrison, R. (1964). Animal Machines: The New Factory Farming Industry.",
    references: [
      {
        id: "1",
        citation: "Harrison, R. (1964). Animal Machines: The New Factory Farming Industry. Vincent Stuart Publishers."
      },
      {
        id: "2",
        citation: "Webster, J. (2008). Animal Welfare: Limiting Pain and Suffering. Wiley-Blackwell.",
        url: "https://www.wiley.com/en-us/Animal+Welfare%3A+Limiting+Pain+and+Suffering-p-9780470752500"
      },
      {
        id: "3",
        citation: "Landrigan, P. J., et al. (2018). The Lancet Commission on Pollution and Health. The Lancet, 391(10119), 462-512.",
        url: "https://doi.org/10.1016/S0140-6736(17)32345-0"
      }
    ]
  },
  {
    id: "el-brambell-report",
    category: "historia",
    title: "El Informe Brambell (1965)",
    shortDesc: "El origen de la ciencia del bienestar animal y las 'Cinco Libertades' fundacionales.",
    longDesc: "Tras la denuncia social del maltrato animal en macrogranjas [1], el Reino Unido encargó el Informe Brambell. Este documento sentó las bases científicas del bienestarismo moderno al definir que los animales tienen necesidades biológicas y psíquicas que derivaron en las 'Cinco Libertades' básicas [2].",
    scientificFacts: [
      "Fue el primer texto oficial en reconocer que los animales en granjas intensivas experimentan estados mentales como el aburrimiento, la frustración y el estrés crónico por confinamiento [1].",
      "Estableció criterios medibles para evaluar el sufrimiento en función del comportamiento anómalo (como las estereotipias) y la fisiología endocrina [2]."
    ],
    connections: ["dolor-fisico", "animal-herramienta", "domesticacion-industrial"],
    citation: "Brambell Committee. (1965). Report of the Technical Committee.",
    references: [
      {
        id: "1",
        citation: "Brambell Committee. (1965). Report of the Technical Committee to Enquire into the Welfare of Animals Kept under Intensive Livestock Husbandry Systems. HM Stationery Office."
      },
      {
        id: "2",
        citation: "Mellor, D. J. (2016). Moving beyond the Five Freedoms: Positive welfare states. Animals, 6(3), 21.",
        url: "https://doi.org/10.3390/ani6030021"
      }
    ]
  },

  // ECOLOGÍA, TERMODINÁMICA Y BIOSFERA
  {
    id: "recursos-termo",
    category: "ecologia",
    title: "Ineficiencia Termodinámica",
    shortDesc: "El coste físico de filtrar calorías vegetales a través del metabolismo animal.",
    longDesc: "Desde las leyes de la termodinámica, la ganadería es un sumidero energético insostenible [1]. Los animales consumen alimento para mantener su propio metabolismo, generar calor corporal, desarrollar huesos y defecar, perdiendo cerca del 90% de la energía original [2]. Filtrar proteínas vegetales a través de seres sintientes para obtener carne requiere multiplicar enormemente la superficie agraria en detrimento de la biosfera [3].",
    scientificFacts: [
      "Producir 1 kg de ternera requiere entre 12 y 16 kg de cereales y legumbres, además de miles de litros de agua dulce [1].",
      "El ganado utiliza el 80% de las tierras agrícolas globales, pero solo provee el 18% de las calorías y el 37% de las proteínas de la dieta humana mundial [1]."
    ],
    connections: ["frontera-vegetal", "metano-emisiones", "deforestacion-ecosist", "industria-global-hechos"],
    citation: "Poore, J., & Nemecek, T. (2018). Reducing food’s environmental impacts.",
    references: [
      {
        id: "1",
        citation: "Poore, J., & Nemecek, T. (2018). Reducing food’s environmental impacts through producers and consumers. Science, 360(6392), 987-992.",
        url: "https://doi.org/10.1126/science.aaq0216"
      },
      {
        id: "2",
        citation: "Cassidy, E. S., West, P. C., Gerber, J. S., & Foley, J. A. (2013). Redefining agricultural yields: from tonnes to people fed per hectare. Environmental Research Letters, 8(3), 034015.",
        url: "https://doi.org/10.1088/1748-9326/8/3/034015"
      },
      {
        id: "3",
        citation: "Shepon, A., Eshel, G., Noor, E., & Milo, R. (2018). The opportunity cost of animal based diets exceeds all food losses. Proceedings of the National Academy of Sciences, 115(15), 3804-3809.",
        url: "https://doi.org/10.1073/pnas.1713820115"
      }
    ]
  },
  {
    id: "metano-emisiones",
    category: "ecologia",
    title: "Límites Planetarios y GEI",
    shortDesc: "El impacto crítico de los rumiantes en la desestabilización térmica de la atmósfera.",
    longDesc: "La ganadería es uno de los principales motores de la crisis climática, responsable de cerca del 14.5% de los gases de efecto invernadero (GEI) antropogénicos [1]. La digestión entérica de rumiantes libera ingentes cantidades de metano (CH4), un gas con un potencial de calentamiento global hasta 28 a 34 veces superior al CO2 en un horizonte de 100 años [2], acelerando los límites planetarios [3].",
    scientificFacts: [
      "El metano entérico provoca un forzamiento radiactivo inmediato de corta duración que acelera el derretimiento de criosferas [2].",
      "La huella de carbono de la industria de la carne y lácteos equivale a las emisiones de todo el sector de transporte global combinado (incluidos aviones y barcos) [1]."
    ],
    connections: ["recursos-termo", "deforestacion-ecosist", "domesticacion-industrial", "industria-global-hechos"],
    citation: "IPCC. (2019). Special Report on Climate Change and Land.",
    references: [
      {
        id: "1",
        citation: "Gerber, P. J., et al. (2013). Tackling climate change through livestock: a global assessment of emissions and mitigation opportunities. Food and Agriculture Organization (FAO).",
        url: "https://www.fao.org/3/i3437e/i3437e.pdf"
      },
      {
        id: "2",
        citation: "IPCC. (2019). Special Report on Climate Change and Land. Intergovernmental Panel on Climate Change.",
        url: "https://www.ipcc.ch/srccl/"
      },
      {
        id: "3",
        citation: "Shine, K. P., Fuglestvedt, J. S., Hailemariam, K., & Stuber, N. (2007). Alternative metrics for comparing greenhouse gas emissions. Climatic Change, 80(3), 263-285.",
        url: "https://doi.org/10.1007/s10584-006-9136-1"
      }
    ]
  },
  {
    id: "deforestacion-ecosist",
    category: "ecologia",
    title: "Monocultivos y Deforestación",
    shortDesc: "La devastación de bosques para el pastoreo y la siembra masiva de piensos industriales.",
    longDesc: "La gran demanda de carne barata estimula la destrucción de ecosistemas vitales, principalmente en el Amazonas y otras selvas tropicales [1]. Millones de hectáreas de bosque virgen son deforestadas para transformarlas en pastizales de ganado o en monocultivos de soja forrajera [2]. Esto destruye sumideros de carbono y aniquila hábitats nativos, convirtiendo la alimentación humana en una máquina de deforestación sistémica [3].",
    scientificFacts: [
      "La ganadería extensiva y los cultivos de soja destinados al ganado causan más del 70% de la pérdida forestal en la selva amazónica [1].",
      "La sustitución de ecosistemas complejos por monocultivos empobrece el suelo, genera erosión masiva y contamina acuíferos con pesticidas industriales [2]."
    ],
    connections: ["recursos-termo", "metano-emisiones", "domesticacion-industrial", "industria-global-hechos"],
    citation: "FAO & UNEP. (2020). The State of the World's Forests.",
    references: [
      {
        id: "1",
        citation: "FAO & UNEP. (2020). The State of the World's Forests: Forests, biodiversity and people. Food and Agriculture Organization.",
        url: "https://doi.org/10.4060/ca8642en"
      },
      {
        id: "2",
        citation: "Gibbs, H. K., et al. (2015). Tropical forest consumption driven by agriculture. Science, 347(6224), 837-838.",
        url: "https://doi.org/10.1126/science.aaa0082"
      },
      {
        id: "3",
        citation: "Pendrill, F., Persson, U. M., Godar, J., Kastner, T., Moran, D., Schmidt, S., & Wood, R. (2019). Agricultural land-use change and forest loss. Global Environmental Change, 56, 8-10.",
        url: "https://doi.org/10.1016/j.gloenvcha.2019.03.002"
      }
    ]
  },
  {
    id: "industria-global-hechos",
    category: "ecologia",
    title: "Destrucción Silvestre Colateral",
    shortDesc: "Cómo la ocupación territorial del ganado extingue a las especies animales salvajes.",
    longDesc: "El impacto ecológico de la ganadería trasciende a los animales criados en granjas; es el principal vector de extinción de fauna silvestre [1]. Al ocupar el 80% del suelo agrícola del planeta para forraje y pastoreo, la humanidad arrebata su espacio biológico a miles de especies de mamíferos, aves, insectos y depredadores salvajes, provocando una masiva pérdida de biodiversidad trófica colateral [2].",
    scientificFacts: [
      "La pérdida de hábitat inducida por la agricultura animal sitúa al planeta en la sexta extinción masiva de especies terrestres de la historia [2].",
      "Los animales salvajes representan hoy menos del 4% de la biomasa total de mamíferos de la Tierra, mientras que los humanos y el ganado doméstico constituyen el 96% [1]."
    ],
    connections: ["domesticacion-industrial", "recursos-termo", "metano-emisiones", "deforestacion-ecosist"],
    citation: "Bar-On, Y. M. et al. (2018). The biomass distribution on Earth.",
    references: [
      {
        id: "1",
        citation: "Bar-On, Y. M., Phillips, R., & Milo, R. (2018). The biomass distribution on Earth. Proceedings of the National Academy of Sciences, 115(25), 6506-6511.",
        url: "https://doi.org/10.1073/pnas.1711842115"
      },
      {
        id: "2",
        citation: "Machovina, B., Feeley, K. J., & Ripple, W. J. (2015). Biodiversity conservation: The key is reducing meat consumption. Science of the Total Environment, 536, 419-431.",
        url: "https://doi.org/10.1016/j.scitotenv.2015.07.022"
      }
    ]
  },

  // ÉTICA, DERECHOS Y DECONSTRUCCIÓN
  {
    id: "disonancia-placer",
    category: "etica",
    title: "Disonancia y Especismo",
    shortDesc: "La paradoja moral de amar a ciertas mascotas mientras financiamos la muerte de otros animales.",
    longDesc: "La sociedad moderna convive con una profunda disonancia cognitiva moral [1]. Desarrollamos relaciones de empatía y otorgamos derechos y protección legal a ciertos animales de compañía (perros, gatos), mientras normalizamos la explotación industrial de cerdos, vacas o aves con capacidades cognitivas y sensoriales análogas de experimentar afecto y dolor [2]. La tradición cultural y el placer culinario actúan como anestesia mental ante esta incoherencia ética [1].",
    scientificFacts: [
      "Los cerdos superan a las mascotas domésticas tradicionales en diversas tareas cognitivas complejas de resolución de problemas y poseen autoconciencia y conciencia social demostradas [3].",
      "La psicología define la 'paradoja de la carne' como el mecanismo mental inconsciente que despoja de personalidad e inteligencia a los animales que vamos a consumir para reducir la culpa [1]."
    ],
    connections: ["dolor-fisico", "evolucion-dieta", "axiomas-morales", "utilitarismo-singer", "ecofeminismo-adams"],
    citation: "Loughnan, S. et al. (2014). The psychology of eating animals.",
    references: [
      {
        id: "1",
        citation: "Loughnan, S., Bastian, B., & Haslam, N. (2014). The psychology of eating animals. Current Directions in Psychological Science, 23(2), 104-108.",
        url: "https://doi.org/10.1177/0963721414525887"
      },
      {
        id: "2",
        citation: "Joy, M. (2010). Why We Love Dogs, Eat Pigs, and Wear Cows: An Introduction to Carnism. Conari Press."
      },
      {
        id: "3",
        citation: "Marino, L., & Colvin, C. M. (2015). Thinking pigs: A comparative review of cognition, emotion, and personality in Sus scrofa domesticus. International Journal of Comparative Psychology, 28.",
        url: "https://escholarship.org/uc/item/8sx4s79c"
      }
    ]
  },
  {
    id: "suplementacion-progreso",
    category: "etica",
    title: "B12 y Veganismo Directo",
    shortDesc: "Cómo la biotecnología moderna independiza la nutrición humana de la explotación animal.",
    longDesc: "Por primera vez en la historia evolutiva, el ser humano dispone de métodos de síntesis bacteriana para producir vitamina B12 (cobalamina) sintética sin mediar la explotación animal [1]. Al romper el lazo de la necesidad fáctica de la ingesta de carne, el debate sobre el veganismo y vegetarianismo se traslada de inmediato del terreno del determinismo biológico al ámbito de la ética voluntaria y el compromiso moral [2].",
    scientificFacts: [
      "La B12 de origen animal proviene realmente de bacterias del suelo; en la ganadería intensiva moderna, al propio ganado se le suplementa sistemáticamente con B12 sintética debido a la degradación bacteriana de los suelos industriales [2].",
      "Las principales academias de nutrición globales avalan que las dietas vegetarianas y veganas bien planificadas son saludables y nutricionalmente adecuadas para todas las etapas del ciclo vital [1]."
    ],
    connections: ["evolucion-dieta", "animal-herramienta", "axiomas-morales"],
    citation: "Melina, V. et al. (2016). Position of the Academy of Nutrition and Dietetics: Vegetarian Diets.",
    references: [
      {
        id: "1",
        citation: "Melina, V., Craig, W., & Levin, S. (2016). Position of the Academy of Nutrition and Dietetics: Vegetarian Diets. Journal of the Academy of Nutrition and Dietetics, 116(12), 1970-1980.",
        url: "https://doi.org/10.1016/j.jand.2016.09.025"
      },
      {
        id: "2",
        citation: "Watanabe, F. (2007). Vitamin B12 sources and bioavailability. Experimental Biology and Medicine, 232(10), 1266-1274.",
        url: "https://doi.org/10.3181/0703-MR-67"
      }
    ]
  },
  {
    id: "axiomas-morales",
    category: "etica",
    title: "Los Axiomas del Especismo",
    shortDesc: "El conflicto ético entre los derechos del individuo sintiente y el antropocentrismo imperante.",
    longDesc: "Nuestras decisiones éticas sobre la explotación animal reposan sobre axiomas profundos e implícitos. Por un lado, la postura humanista laica sostiene que si un ser 'siente un dolor que le importa a sí mismo', causarle daño para un beneficio efímero es inmoral [1]. Por otro lado, el antropocentrismo cartesiano relega a los animales a meras mercancías e instrumentos de consumo, asumiendo una supremacía moral humana absoluta [2, 3].",
    scientificFacts: [
      "El rechazo al especismo exige que dolores fisiológicamente equivalentes reciban una consideración ética equivalente, sin importar la especie del individuo [2].",
      "La deconstrucción socrática demuestra que justificar el daño severo a un animal en base al placer culinario efímero es inconsistente con nuestras propias normas sociales de compasión [1]."
    ],
    connections: ["disonancia-placer", "suplementacion-progreso", "dolor-fisico", "utilitarismo-singer", "deontologia-regan", "enfoque-capacidades-nussbaum"],
    citation: "Bentham, J. (1789). An Introduction to the Principles of Morals and Legislation.",
    references: [
      {
        id: "1",
        citation: "Bentham, J. (1789). An Introduction to the Principles of Morals and Legislation. T. Payne and Son."
      },
      {
        id: "2",
        citation: "Ryder, R. D. (2011). Speciesism, Painism and Happiness. Academic Publishing."
      },
      {
        id: "3",
        citation: "Horta, O. (2010). What is speciesism? Journal of Agricultural and Environmental Ethics, 23(3), 243-266.",
        url: "https://doi.org/10.1007/s10806-009-9205-2"
      }
    ]
  },
  {
    id: "utilitarismo-singer",
    category: "etica",
    title: "Singer: Liberación Animal",
    shortDesc: "El principio de igual consideración de intereses basado en la capacidad de sufrir.",
    longDesc: "En 'Liberación Animal' (1975), Peter Singer argumenta que el límite de la consideración moral es la sintiencia (la capacidad de experimentar placer o dolor), y no la inteligencia [1]. Deconstruye el especismo como un prejuicio ético arbitrario homólogo al racismo o al sexismo, exigiendo que a dolores iguales se les asigne un peso moral equivalente en nuestras decisiones cotidianas [2].",
    scientificFacts: [
      "Singer expone que la ganadería industrial inflige una cantidad masiva de sufrimiento crónico para satisfacer deseos gastronómicos triviales y no vitales [1].",
      "El utilitarismo de preferencia rechaza el bienestarismo superficial cuando este camufla la explotación sistemática de seres con plena sintiencia [2]."
    ],
    connections: ["axiomas-morales", "disonancia-placer", "deontologia-regan"],
    citation: "Singer, P. (1975). Animal Liberation: A New Ethics.",
    references: [
      {
        id: "1",
        citation: "Singer, P. (1975). Animal Liberation: A New Ethics. HarperCollins."
      },
      {
        id: "2",
        citation: "Singer, P. (2011). Practical Ethics (3rd ed.). Cambridge University Press."
      }
    ]
  },
  {
    id: "deontologia-regan",
    category: "etica",
    title: "Regan: Sujetos-de-una-vida",
    shortDesc: "La fundamentación de derechos absolutos basados en el valor intrínseco de los animales.",
    longDesc: "Tom Regan defiende en 'El caso de los derechos de los animales' (1983) un enfoque de derechos absolutos [1]. Argumenta que ciertos animales son 'sujetos-de-una-vida': poseen creencias, memoria, vida emocional y planes futuros [1]. Esto les confiere un valor intrínseco inalienable que prohíbe éticamente tratarlos como meras mercancías o medios para fines gastronómicos [2].",
    scientificFacts: [
      "La deontología exige abolir la ganadería industrial e individual y no meramente 'reformarla' para hacerla más humanitaria [1].",
      "Trazar derechos absolutos a los vertebrados impide que su valor de vida se reduzca a una tasa de conversión de biomasa alimentaria [2]."
    ],
    connections: ["axiomas-morales", "utilitarismo-singer", "enfoque-capacidades-nussbaum"],
    citation: "Regan, T. (1983). The Case for Animal Rights.",
    references: [
      {
        id: "1",
        citation: "Regan, T. (1983). The Case for Animal Rights. University of California Press."
      },
      {
        id: "2",
        citation: "Regan, T. (2001). Defending Animal Rights. University of Illinois Press."
      }
    ]
  },
  {
    id: "ecofeminismo-adams",
    category: "etica",
    title: "Adams: Referente Ausente",
    shortDesc: "El vínculo cultural y lingüístico entre la cosificación patriarcal y la dominación animal.",
    longDesc: "En 'La política sexual de la carne' (1990), Carol J. Adams deconstruye los vínculos entre el patriarcado y el especismo [1]. Introduce el concepto de 'referente ausente', explicando cómo el lenguaje disuelve al animal vivo transformándolo en trozos de alimento de consumo (ej. 'ternera', 'chuleta'), despojando al consumidor de su empatía natural [1, 2].",
    scientificFacts: [
      "La cultura gastronómica asocia de forma persistente e histórica el consumo de carne con ideales de virilidad, fuerza y dominación jerárquica [1].",
      "El despiece industrial y el lenguaje comercial enmascaran el maltrato animal para evitar que se active la disonancia cognitiva en el consumidor [2]."
    ],
    connections: ["disonancia-placer", "axiomas-morales"],
    citation: "Adams, C. J. (1990). The Sexual Politics of Meat.",
    references: [
      {
        id: "1",
        citation: "Adams, C. J. (1990). La política sexual de la carne: Una teoría crítica feminista vegetariana. Continuum."
      },
      {
        id: "2",
        citation: "Adams, C. J. (2010). The Sexual Politics of Meat (20th Anniversary Edition). Bloomsbury."
      }
    ]
  },
  {
    id: "enfoque-capacidades-nussbaum",
    category: "etica",
    title: "Nussbaum: Justicia Animal",
    shortDesc: "El derecho constitucional de las especies a florecer conforme a sus capacidades naturales.",
    longDesc: "Martha Nussbaum extiende el 'enfoque de las capacidades' al ámbito de los derechos de los animales [1]. Sostiene que los animales no son meros objetos de compasión, sino sujetos activos de justicia política [1]. Tienen el derecho intrínseco a florecer de acuerdo a su naturaleza biológica (derecho al juego, integridad física, movilidad y vida comunitaria), imponiendo deberes morales directos a los Estados [2].",
    scientificFacts: [
      "El confinamiento intensivo ataca directamente las capacidades esenciales de los cerdos y aves, constituyendo una injusticia severa y sistemática [1].",
      "Propone una ética cosmopolita global que traduzca la sintiencia animal en leyes con protección constitucional directa en los sistemas jurídicos de los Estados [2]."
    ],
    connections: ["axiomas-morales", "deontologia-regan"],
    citation: "Nussbaum, M. C. (2006). Frontiers of Justice: Species Membership.",
    references: [
      {
        id: "1",
        citation: "Nussbaum, M. C. (2006). Frontiers of Justice: Species Membership. Harvard University Press."
      },
      {
        id: "2",
        citation: "Nussbaum, M. C. (2023). Justice for Animals: Our Collective Responsibility. Simon & Schuster."
      }
    ]
  }
];

export const DILEMMAS_DATA: DilemmaDetail[] = [
  {
    id: "leones-carne",
    category: "historia",
    title: "El Argumento de la Cadena Trófica",
    popularStatement: "Los leones comen carne en la naturaleza, por tanto es natural que los seres humanos hagamos lo mismo.",
    consensus: "FALACIA",
    scientificDeconstruction: "Los felinos salvajes son carnívoros biológicos obligatorios; carecen de enzimas metabólicas para asimilar nutrientes esenciales a partir de proteínas vegetales exclusivas [3]. En cambio, el ser humano es un omnívoro flexible dotado de un tracto digestivo capaz de asimilar óptimamente todos los macro y micronutrientes a partir de una alimentación basada en plantas [1]. Adicionalmente, los animales salvajes no generan industrias de cría masiva confinada ni destruyen la dehesa común con emisiones gaseosas.",
    philosophicalDeconstruction: "Este argumento cae directamente en la 'Falacia Naturalista' o ley de Hume: pretender derivar el 'deber ser' ético a partir del 'ser' fáctico de la naturaleza [2]. Los leones carecen de discernimiento moral y operan bajo instinto depredador de subsistencia [1]. Los seres humanos somos agentes morales con capacidad de reflexión ética, libre albedrío y acceso a alternativas vegetales completas; apelar al salvajismo animal para eludir nuestra responsabilidad es una contradicción lógica [1].",
    coexistenceImpact: "Relegar nuestra ética humana moderna a la conducta depredadora de un felino para justificar la explotación animal masiva de 80.000 millones de vidas es un abandono voluntario de nuestra racionalidad moral y compasión.",
    citation: "Singer, P. (1975). Animal Liberation (Chapter 6).",
    references: [
      {
        id: "1",
        citation: "Singer, P. (1975). Animal Liberation (Chapter 6). HarperCollins."
      },
      {
        id: "2",
        citation: "Hume, D. (1739). A Treatise of Human Nature (Book III, Part I, Section I)."
      },
      {
        id: "3",
        citation: "National Research Council. (2006). Nutrient Requirements of Dogs and Cats. National Academies Press."
      }
    ]
  },
  {
    id: "plantas-sienten-dolor",
    category: "sintiencia",
    title: "La Sensibilidad de las Plantas",
    popularStatement: "Las plantas también sienten dolor al ser cosechadas, así que comer lechuga es igual que comer ternera.",
    consensus: "FALACIA",
    scientificDeconstruction: "Las plantas responden a agresiones físicas mediante rutas metabólicas de alarma química (emitiendo etileno o compuestos volátiles) [1]. Estas reacciones moleculares reflejas son automáticas y mecánicas, careciendo de traducción de dolor subjetivo al no poseer nociceptores, sistema nervioso central, ni cerebro [1]. Las plantas no tienen la infraestructura fisiológica que posibilita el sufrimiento emocional [2].",
    philosophicalDeconstruction: "Incluso si aceptáramos el absurdo biológico de que las plantas sienten, la ineficiencia termodinámica de la ganadería implica que un animal debe consumir entre 10 y 16 veces más alimento vegetal para producir un solo kilo de carne [3]. Por lo tanto, el consumo ético de plantas directo (veganismo o vegetarianismo) sigue minimizando el volumen total de vidas vegetales destruidas en una proporción del 90% [3].",
    coexistenceImpact: "Equiparar la respuesta bioquímica refleja de un vegetal con el dolor consciente y el pánico del maltrato animal en el degüello de una vaca o un cerdo constituye una severa simplificación de la conciencia biológica.",
    citation: "Taiz, L. et al. (2019). Plant sentience: The burden of proof.",
    references: [
      {
        id: "1",
        citation: "Taiz, L., Robinson, D. G., et al. (2019). Plants neither possess nor require consciousness. Trends in Plant Science, 24(8), 677-687.",
        url: "https://doi.org/10.1016/j.tplants.2019.05.010"
      },
      {
        id: "2",
        citation: "Robinson, D. G., et al. (2023). Plant sentience: The burden of proof. Animal Sentience, 8(36), 1-12.",
        url: "https://wellbeingintlstudiesrepository.org/animsent/vol8/iss36/1/"
      },
      {
        id: "3",
        citation: "Poore, J., & Nemecek, T. (2018). Reducing food’s environmental impacts. Science, 360(6392)."
      }
    ]
  },
  {
    id: "bivalvos-ostras",
    category: "sintiencia",
    title: "El Dilema de los Bivalvos",
    popularStatement: "¿Es moralmente aceptable el consumo de bivalvos como mejillones u ostras con total tranquilidad?",
    consensus: "ESCENARIO_GRIS",
    scientificDeconstruction: "Los bivalvos (mejillones, almejas) son moluscos sésiles extremadamente rudimentarios. Carecen de encéfalo, cerebro y sistema nervioso centralizado, disponiendo únicamente de una red descentralizada de ganglios simples [1]. La biología moderna no halla indicios de nocicepción activa ni estrés de sufrimiento análogos al dolor de vertebrados [1]. Su cría además filtra agua limpia, no consume pienso agrícola y tiene una huella de carbono ínfima.",
    philosophicalDeconstruction: "Este es un debate ético interno en el veganismo. El utilitarismo pragmático sostiene que consumir bivalvos es correcto ya que no genera sufrimiento al universo y reduce las muertes colaterales causadas por cosechadoras de campo sobre roedores e insectos en cultivos de cereales [1]. El abolicionismo de derechos apela al principio de precaución: ante la mínima duda sobre su microconciencia, es preferible no mercantilizarlos [2].",
    coexistenceImpact: "Representa un área gris fértil que enseña a graduar la consideración moral basándose con humildad en la escala de complejidad neural de la vida animal.",
    citation: "Cox, C. (2010). Ethical considerations of bivalve consumption in vegan diets.",
    references: [
      {
        id: "1",
        citation: "Cox, C. (2010). Ethical considerations of bivalve consumption in vegan diets. Journal of Agricultural and Environmental Ethics, 23(4)."
      },
      {
        id: "2",
        citation: "Birch, J. (2017). Animal sentience and the precautionary principle. Animal Sentience, 2(16), 1-16.",
        url: "https://doi.org/10.51291/2377-7478.1200"
      }
    ]
  },
  {
    id: "granja-feliz-ecologia",
    category: "etica",
    title: "Mito de la Granja Feliz",
    popularStatement: "Consumir animales criados en libertad (ganadería ecológica) y sacrificados con métodos indoloros no tiene nada de malo.",
    consensus: "DILEMA",
    scientificDeconstruction: "Aunque la ganadería extensiva ecológica aporta a los animales una existencia indudablemente superior al infierno industrial, el sacrificio sistemático se ejecuta en su juventud temprana (ej. terneras sacrificadas a los 18 meses frente a una longevidad natural de 20 años) [1]. Además, alimentar a los 8.000 millones de humanos con este modelo extensivo requeriría disponer de tres planetas Tierra adicionales debido a su baja densidad espacial calórica [3].",
    philosophicalDeconstruction: "Este dilema opone la teoría utilitarista de la agregación de bienestar a la deontología de derechos. El bienestarismo argumenta que dotar al animal de una vida agradable genera utilidad neta positiva [2]. El abolicionismo de derechos (Regan) replica que matar a un 'sujeto-de-una-vida' de forma prematura lo priva injustamente de experimentar bienestar futuro, vulnerando su derecho a la vida por un interés gastronómico redundante [1].",
    coexistenceImpact: "Nos sitúa ante la paradoja del homicidio indoloro: decidir si los animales sintientes son meros depósitos de placer intercambiables o individuos irremplazables con valor intrínseco.",
    citation: "Regan, T. (1983). The Case for Animal Rights (Chapter 8).",
    references: [
      {
        id: "1",
        citation: "Regan, T. (1983). The Case for Animal Rights (Chapter 8). University of California Press."
      },
      {
        id: "2",
        citation: "McMahan, J. (2008). Eating animals the nice way. Daedalus, 137(1), 66-76.",
        url: "https://doi.org/10.1162/daed.2008.137.1.66"
      },
      {
        id: "3",
        citation: "Poore, J., & Nemecek, T. (2018). Reducing food’s environmental impacts. Science, 360(6392)."
      }
    ]
  },
  {
    id: "conservacion-dehesas",
    category: "ecologia",
    title: "La Ganadería en Ecosistemas",
    popularStatement: "Si eliminamos el ganado, ecosistemas protegidos como la dehesa ibérica o las praderas de montaña desaparecerían.",
    consensus: "DILEMA",
    scientificDeconstruction: "Ecosistemas antrópicos como las dehesas mediterráneas o praderas alpinas dependen del pastoreo de herbívoros domésticos para limpiar maleza, fertilizar el suelo local y prevenir incendios forestales [2]. Eliminar por completo el ganado de pastoreo tradicional en estas áreas degradaría gravemente la biodiversidad local de plantas, insectos y aves que coevolucionaron en simbiosis con este ciclo [2].",
    philosophicalDeconstruction: "Este dilema expone la tensión entre la ética ecocéntrica (el deber de proteger la integridad sistémica y biodiversidad del ecosistema colectivo) [1] y la ética individualista (los derechos del animal individual a no ser explotado y sacrificado) [2]. Al priorizar el ecosistema, el pastoreo en bajas cargas es una herramienta de simbiosis; al priorizar al individuo, la cría para matadero constituye un uso ilegítimo de su sintiencia [2].",
    coexistenceImpact: "Nos sitúa ante un espejo incómodo: a veces, proteger la salud global de un bioma común requiere evaluar compromisos éticos con los derechos individuales.",
    citation: "Callicott, J. B. (1980). Animal liberation: A triangular affair.",
    references: [
      {
        id: "1",
        citation: "Callicott, J. B. (1980). Animal liberation: A triangular affair. Environmental Ethics, 2(4), 311-338.",
        url: "https://doi.org/10.5840/enviroethics19802424"
      },
      {
        id: "2",
        citation: "Bugalho, M. N., Caldeira, M. C., Pereira, J. S., Aronson, J., & Diaz, M. (2011). Mediterranean cork oak savannas (dehesas): Biodiversity and conservation. Frontiers in Ecology and the Environment, 9(5), 278-286.",
        url: "https://doi.org/10.1890/100067"
      }
    ]
  },
  {
    id: "comer-insectos-harinas",
    category: "etica",
    title: "La Apuesta de la Entomofagia",
    popularStatement: "La entomofagia (ingerir grillos o gusanos) es el sustituto ideal de la ganadería barata para proteger el cambio climático.",
    consensus: "ESCENARIO_GRIS",
    scientificDeconstruction: "La producción de proteínas a base de harinas de insectos es enormemente más eficiente que la de ganado bovino o porcino, reduciendo un 99% el espacio territorial y emitiendo mínimas trazas de GEI [3]. Sin embargo, la ciencia debate aún la presencia de trazas de sintiencia consciente en artrópodos: aunque muestran aprendizaje complejo, sus sistemas nerviosos descentralizados son en gran parte reflejos [2].",
    philosophicalDeconstruction: "Si el sufrimiento de los insectos es nulo, esta industria representa una vía de transición para erradicar las macrogranjas masivas de vertebrados [3]. Sin embargo, para el veganismo abolicionista, la cría industrial de trillones de insectos hacinados en cajones mecánicos perpetúa el antropocentrismo imperante, tratando a toda vida cerebral como mercancía utilitaria [1, 2].",
    coexistenceImpact: "Un portal híbrido fascinante donde la urgencia de salvar la biosfera del colapso ecológico nos obliga a revaluar la frontera moral de las microconciencias neurales.",
    citation: "Chittka, L. (2022). The Mind of a Bee.",
    references: [
      {
        id: "1",
        citation: "Chittka, L. (2022). The Mind of a Bee. Princeton University Press."
      },
      {
        id: "2",
        citation: "Gibbons, M., et al. (2022). Can insects feel pain? Advances in Insect Physiology, 63, 155-229."
      },
      {
        id: "3",
        citation: "van Huis, A. (2013). Potential of insects as food and feed in assuring food security. Annual Review of Entomology, 58, 563-583.",
        url: "https://doi.org/10.1146/annurev-ento-120811-150247"
      }
    ]
  },
  {
    id: "humanos-caninos-biologia",
    category: "historia",
    title: "La Dentadura y Caninos",
    popularStatement: "Nuestros dientes tienen caninos (colmillos), lo que demuestra biológicamente que estamos hechos para triturar carne.",
    consensus: "FALACIA",
    scientificDeconstruction: "Los caninos humanos son protuberancias anatómicas vestigiales reducidas que derivan de una herencia homínida (usados originalmente en defensa social y no en dieta) [1]. Carecen de la longitud, curvatura y fuerza para desgarrar pieles o triturar huesos como los colmillos de carnívoros verdaderos (félidos o cánidos) [2]. Nuestra fisiología dental y digestiva está optimizada para la masticación y trituración de fibras vegetales mediante molares planos [2].",
    philosophicalDeconstruction: "Atribuir un mandato moral imperativo (explotar y sacrificar a seres con SNC) a partir de una tosca analogía física morfológica constituye un grave sesgo interpretativo. Incluso si nuestros antepasados hubiesen sido carnívoros estrictos, el acceso a la tecnología alimentaria moderna y a fuentes vegetales completas elimina la necesidad biológica fáctica, trasladando la decisión dietética al plano del discernimiento ético [1].",
    coexistenceImpact: "Utilizar una simplificación morfológica de los colmillos para defender la macrogranja industrial ilustra la fuerza de la disonancia para inmunizar el hábito cotidiano.",
    citation: "Ungar, P. S. (2010). Mammal Teeth: Origin, Evolution, and Diversity.",
    references: [
      {
        id: "1",
        citation: "Ungar, P. S. (2010). Mammal Teeth: Origin, Evolution, and Diversity. Johns Hopkins University Press."
      },
      {
        id: "2",
        citation: "Lucas, P. W. (2004). Dental Functional Morphology: How Teeth Work. Cambridge University Press."
      }
    ]
  },
  {
    id: "ganaderia-industrial-hecho",
    category: "ecologia",
    title: "Explotación Industrial y Clima",
    popularStatement: "La carne de macrogranjas es necesaria para alimentar al mundo de forma barata y es sostenible con las nuevas tecnologías.",
    consensus: "CONSENSO",
    scientificDeconstruction: "Las leyes físicas de la termodinámica imposibilitan la sostenibilidad de la ganadería industrial [1]. La macrogranja intensiva destruye de forma demostrada la biosfera: provoca la eutrofización de acuíferos potables por purines saturados de nitratos, inyecta amoníaco en el suelo, consume un porcentaje abrumador del agua dulce planetaria y destruye bosques para pienso, siendo insostenible bajo cualquier límite ecológico [2].",
    philosophicalDeconstruction: "No existe teoría filosófica de la justicia que valide someter a miles de millones de seres con SNC a un confinamiento crónico y sufrimiento sistemático diario para proteger las plusvalías de una industria ineficiente y prescindible [1]. El rechazo a la macrogranja aúna de forma unánime a utilitaristas, deontólogos de derechos, ecologistas y humanistas laicos en una rotunda condena moral [1].",
    coexistenceImpact: "La abolición del apoyo económico pasivo a las macrogranjas (mediante el veganismo o vegetarianismo) es el mínimo ético indispensable de la consistencia moral contemporánea.",
    citation: "Poore, J., & Nemecek, T. (2018). Reducing food’s environmental impacts.",
    references: [
      {
        id: "1",
        citation: "Poore, J., & Nemecek, T. (2018). Reducing food’s environmental impacts through producers and consumers. Science, 360(6392), 987-992."
      },
      {
        id: "2",
        citation: "Steinfeld, H., et al. (2006). Livestock's Long Shadow: Environmental Issues and Options. Food and Agriculture Organization (FAO)."
      }
    ]
  },
  {
    id: "el-argumento-del-antropocentrismo-cartesiano",
    category: "sintiencia",
    title: "El Autómata Cartesiano",
    popularStatement: "René Descartes argumentaba que los animales son máquinas biológicas sin alma ni capacidad de sufrir dolor real.",
    consensus: "FALACIA",
    scientificDeconstruction: "La neurobiología contemporánea desmiente de forma rotunda el reduccionismo cartesiano. Los animales vertebrados comparten con los humanos las mismas vías nociceptivas, neurotransmisores de dolor (sustancia P, glutamato) y estructuras subcorticales [3]. Las respuestas de estrés biológico y comportamiento inteligente ante lesiones físicas demuestran empíricamente la vivencia consciente del dolor animal [3].",
    philosophicalDeconstruction: "La hipótesis cartesiana operó históricamente como un analgésico teológico para silenciar la compasión y legitimar la disección y explotación sistemática de animales sin culpa ética [2]. Retirar la personalidad subjetiva al ser sintiente para justificar el maltrato animal es un clásico mecanismo psicológico de disonancia, hoy totalmente insostenible ante la ciencia empírica [1, 3].",
    coexistenceImpact: "Tratar a seres con capacidades biológicas complejas de dolor como simples resortes mecánicos embrutece nuestra empatía colectiva y daña nuestra capacidad moral.",
    citation: "Descartes, R. (1637). Discurso del método (Parte V); Low, P. et al. (2012). The Cambridge Declaration on Consciousness.",
    references: [
      {
        id: "1",
        citation: "Descartes, R. (1637). Discurso del método (Parte V)."
      },
      {
        id: "2",
        citation: "Harrison, P. (1992). Descartes on animals. Philosophical Quarterly, 42(167), 219-227.",
        url: "https://doi.org/10.2307/2220217"
      },
      {
        id: "3",
        citation: "Low, P., Panksepp, J., Reiss, D., Edelman, D., Van Swinderen, B., & Koch, C. (2012). The Cambridge Declaration on Consciousness. Churchill College, University of Cambridge."
      }
    ]
  },
  {
    id: "el-argumento-del-contrato-social",
    category: "etica",
    title: "El Límite del Contrato Social",
    popularStatement: "Los animales no pueden firmar el contrato social ni respetar nuestros derechos, por tanto no tenemos deberes morales hacia ellos.",
    consensus: "FALACIA",
    scientificDeconstruction: "El contrato social es un constructo jurídico abstracto humano, pero la sintiencia y la capacidad de sufrir dolor son realidades físicas tangibles [1]. El hecho de que un animal no comprenda el concepto de deber civil o de contrato no neutraliza el trauma físico y el estrés que le provocan nuestras agresiones directas, ni invalida su estatus biológico de vulnerabilidad [2].",
    philosophicalDeconstruction: "Este argumento incurre en un error lógico básico al confundir 'agentes morales' (quienes razonan deberes) con 'pacientes morales' (quienes merecen protección ética) [1]. A los bebés, personas con demencia senil o con discapacidades cognitivas severas no les exigimos firmar contratos ni respetar deberes, pero les garantizamos plenos derechos humanos por su vulnerabilidad sintiente [1, 3]. Negarle este estatus a los animales en base a su especie es especismo puro [1].",
    coexistenceImpact: "Sostener que la compasión y la justicia aplican únicamente sobre la base de la reciprocidad legal convalida una ética de dominación y maltrato del fuerte sobre el vulnerable.",
    citation: "Regan, T. (1983). The Case for Animal Rights; Rowlands, M. (2012). Can Animals Be Moral?.",
    references: [
      {
        id: "1",
        citation: "Regan, T. (1983). The Case for Animal Rights. University of California Press."
      },
      {
        id: "2",
        citation: "Rowlands, M. (2012). Can Animals Be Moral?. Oxford University Press."
      },
      {
        id: "3",
        citation: "Carruthers, P. (1992). The Animals Issue: Moral Theory in Practice. Cambridge University Press."
      }
    ]
  },
  {
    id: "el-argumento-del-bienestarismo-industrial",
    category: "historia",
    title: "El Mito de la Carne Humanitaria",
    popularStatement: "Las regulaciones actuales garantizan que la carne proviene de animales criados humanitariamente y sacrificados sin crueldad.",
    consensus: "FALACIA",
    scientificDeconstruction: "Las auditorías demuestran que las normas de bienestar animal no evitan prácticas dolorosas cotidianas en la explotación intensiva (como la castración o despicado sin anestesia) [2]. El aturdimiento industrial previo al sacrificio (gaseo por CO2 o choque eléctrico) presenta elevados índices de error debido al ritmo frenético de las cadenas de procesamiento, prolongando el pánico del degüello [3].",
    philosophicalDeconstruction: "El bienestarismo industrial opera como un analgésico ético para el consumidor, reduciendo el malestar psicológico de financiar la explotación animal bajo el pretexto de la compasión comercial [1]. Como explica Gary Francione, pretender regular el maltrato animal perpetuando su estatus legal de propiedad de mercado cronifica su cosificación absoluta [1].",
    coexistenceImpact: "Consumir carne bajo el mito del bienestar humanitario invisibiliza la violencia fáctica inevitable de convertir a un ser sintiente con SNC en un producto comercial.",
    citation: "Francione, G. L. (1995). Animals, Property, and the Law; Harrison, R. (1964). Animal Machines.",
    references: [
      {
        id: "1",
        citation: "Francione, G. L. (1995). Animals, Property, and the Law. Temple University Press."
      },
      {
        id: "2",
        citation: "Harrison, R. (1964). Animal Machines: The New Factory Farming Industry. Vincent Stuart Publishers."
      },
      {
        id: "3",
        citation: "Grandin, T. (2015). Improving Animal Welfare: A Practical Approach. CABI."
      }
    ]
  },
  {
    id: "el-argumento-de-la-prioridad-humanitaria",
    category: "etica",
    title: "La Prioridad Humanitaria",
    popularStatement: "Debemos solucionar la pobreza y las guerras humanas antes de preocuparnos o debatir sobre la ética de los animales.",
    consensus: "DILEMA",
    scientificDeconstruction: "Las crisis humanitarias y la agricultura animal están entrelazadas. Termodinámicamente, destinar grano agrícola directamente a humanos y reducir la ganadería aumentaría la disponibilidad calórica global, aliviando el hambre en zonas de pobreza [3]. Adicionalmente, las macrogranjas estimulan pandemias zoonóticas y aceleran el colapso ecológico que afecta sobremanera a las poblaciones humanas vulnerables del sur global [2].",
    philosophicalDeconstruction: "Este razonamiento plantea una falsa dicotomía moral al asumir que la empatía humana es un recurso escaso excluyente. El veganismo o el vegetarianismo no restan recursos ni tiempo a la justicia social humana; es una decisión pasiva cotidiana que retira el apoyo financiero a una industria destructiva [2]. Luchar por los derechos de los animales no impide luchar por los derechos humanos; ambas batallas combaten la misma lógica de dominación instrumental [1].",
    coexistenceImpact: "Dividir de forma absoluta las crisis de derechos humanos de la devastación de los animales ignora que ambos abusos proceden de la mercantilización sistemática del vulnerable.",
    citation: "Adams, C. J. (1990). The Sexual Politics of Meat; Singer, P. (1975). Animal Liberation.",
    references: [
      {
        id: "1",
        citation: "Adams, C. J. (1990). The Sexual Politics of Meat. Continuum."
      },
      {
        id: "2",
        citation: "Singer, P. (1975). Animal Liberation. HarperCollins."
      },
      {
        id: "3",
        citation: "Springmann, M., Godfray, H. C. J., Rayner, M., & Scarborough, P. (2016). Analysis and valuation of the health and climate change co-benefits of dietary change. Proceedings of the National Academy of Sciences, 113(15), 4146-4151.",
        url: "https://doi.org/10.1073/pnas.1523119113"
      }
    ]
  }
];
