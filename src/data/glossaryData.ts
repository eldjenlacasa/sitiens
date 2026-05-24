export interface GlossaryItem {
  id: string; // unique ID
  term: string; // display name
  patterns: string[]; // word variations to match in text
  definition: string; // clear, accessible explanation
  relatedNodes?: string[]; // IDs of related concepts in CORE_NODES
  relatedDilemmas?: string[]; // IDs of related dilemmas in DILEMMAS_DATA
}

export const GLOSSARY_DATA: GlossaryItem[] = [
  {
    id: "sintiencia",
    term: "Sintiencia",
    patterns: ["sintiencia", "sintiente", "sintientes", "siente"],
    definition: "Es la capacidad que tiene un ser vivo de sentir de forma consciente y en primera persona cosas tanto buenas como malas (dolor, placer, alegría, estrés o aburrimiento). Va más allá de reaccionar mecánicamente: significa que hay un 'alguien' experimentando esa sensación.",
    relatedNodes: ["dolor-fisico", "zonas-grises", "frontera-vegetal"],
    relatedDilemmas: ["plantas-sienten-dolor", "bivalvos-ostras"]
  },
  {
    id: "snc",
    term: "Sistema Nervioso Central (SNC)",
    patterns: ["Sistema Nervioso Central", "SNC", "sistemas nerviosos centrales"],
    definition: "Es la red central que tienen los vertebrados y otros animales complejos (formada por el cerebro, el tronco encefálico y la médula espinal) encargada de procesar las señales de dolor o placer y transformarlas en una experiencia subjetiva o mental.",
    relatedNodes: ["dolor-fisico", "zonas-grises"],
    relatedDilemmas: ["bivalvos-ostras", "comer-insectos-harinas"]
  },
  {
    id: "especismo",
    term: "Especismo",
    patterns: ["especismo", "especista", "especistas"],
    definition: "Es la discriminación moral hacia ciertos animales simplemente por no pertenecer a nuestra propia especie (antropocentrismo), o la distinción injustificada entre especies distintas (por ejemplo, proteger por ley a los perros y gatos en casa mientras se financia la matanza masiva de cerdos o vacas).",
    relatedNodes: ["disonancia-placer", "axiomas-morales", "utilitarismo-singer"],
    relatedDilemmas: ["leones-carne", "granja-feliz-ecologia"]
  },
  {
    id: "disonancia-cognitiva",
    term: "Disonancia Cognitiva",
    patterns: ["disonancia cognitiva", "disonancia", "disonancias"],
    definition: "Es el malestar mental inconsciente que sentimos cuando nuestras acciones contradicen nuestros valores. En este contexto, describe la contradicción de considerarse amantes de los animales mientras consumimos productos que requieren de su confinamiento y sacrificio.",
    relatedNodes: ["disonancia-placer", "axiomas-morales", "ecofeminismo-adams"],
    relatedDilemmas: ["granja-feliz-ecologia", "el-mito-de-la-carne-humanitaria"]
  },
  {
    id: "nocicepcion",
    term: "Nocicepción",
    patterns: ["nocicepción", "nociceptores", "nociceptivas", "nociceptivo", "nociceptivos"],
    definition: "Es la capacidad puramente biológica y física de detectar un daño en los tejidos a través de receptores de alarma (nociceptores). Es diferente al sufrimiento emocional consciente: las plantas tienen respuestas químicas de alarma pero no una traducción emocional de ese dolor.",
    relatedNodes: ["dolor-fisico", "frontera-vegetal", "zonas-grises"],
    relatedDilemmas: ["plantas-sienten-dolor", "bivalvos-ostras"]
  },
  {
    id: "termodinamica",
    term: "Leyes de la Termodinámica",
    patterns: ["termodinámica", "termodinámicas", "ineficiencia termodinámica"],
    definition: "Reglas físicas que dictan cómo la energía se transforma y se pierde. En agricultura, esto significa que cuando alimentas a un animal con plantas para luego comerte al animal, cerca del 90% de las calorías originales del vegetal se pierden en el calor corporal y el metabolismo del animal.",
    relatedNodes: ["recursos-termo", "deforestacion-ecosist"],
    relatedDilemmas: ["plantas-sienten-dolor", "explotacion-industrial-clima"]
  },
  {
    id: "metano",
    term: "Metano (CH4)",
    patterns: ["metano", "CH4"],
    definition: "Un gas de efecto invernadero sumamente potente que calienta el planeta con una intensidad de 28 a 34 veces superior al dióxido de carbono (CO2) a corto plazo. Es generado masivamente por la digestión de las vacas y ovejas de la industria ganadera.",
    relatedNodes: ["metano-emisiones", "deforestacion-ecosist"],
    relatedDilemmas: ["explotacion-industrial-clima"]
  },
  {
    id: "deforestacion",
    term: "Deforestación",
    patterns: ["deforestación", "deforestar", "deforestadas", "pérdida forestal"],
    definition: "Proceso de destrucción de bosques nativos y selvas (como la selva amazónica) para convertirlos en tierras de pastoreo de ganado o en campos de soja industrial, usada principalmente para alimentar a los animales confinados en granjas del primer mundo.",
    relatedNodes: ["deforestacion-ecosist", "recursos-termo", "industria-global-hechos"],
    relatedDilemmas: ["explotacion-industrial-clima"]
  },
  {
    id: "utilitarismo",
    term: "Utilitarismo",
    patterns: ["utilitarismo", "utilitarista", "utilitaristas"],
    definition: "Teoría filosófica que defiende que la acción moralmente correcta es aquella que maximiza la felicidad y el bienestar general reduciendo todo lo posible el sufrimiento de cualquier ser capaz de sentir, sin importar su nivel de inteligencia.",
    relatedNodes: ["utilitarismo-singer", "axiomas-morales", "deontologia-regan"],
    relatedDilemmas: ["granja-feliz-ecologia", "conservacion-dehesas"]
  },
  {
    id: "deontologia",
    term: "Deontología",
    patterns: ["deontología", "deontológica", "deontológicos"],
    definition: "Teoría filosófica basada en que ciertos seres poseen derechos absolutos y un valor intrínseco inalienable que prohíbe usarlos éticamente como simples herramientas o mercancías, sin importar el supuesto beneficio para otros.",
    relatedNodes: ["deontologia-regan", "axiomas-morales", "enfoque-capacidades-nussbaum"],
    relatedDilemmas: ["granja-feliz-ecologia", "conservacion-dehesas"]
  },
  {
    id: "b12",
    term: "Vitamina B12",
    patterns: ["vitamina B12", "B12", "cobalamina"],
    definition: "Un micronutriente esencial para el cerebro humano que no es producido por plantas ni por animales, sino por bacterias en el suelo. Hoy en día se produce de forma ultra limpia en laboratorios sin necesidad de explotar o sacrificar a ningún ser vivo.",
    relatedNodes: ["suplementacion-progreso", "evolucion-dieta"],
    relatedDilemmas: ["granja-feliz-ecologia"]
  },
  {
    id: "principio-precaucion",
    term: "Principio de Precaución",
    patterns: ["principio de precaución", "precaución"],
    definition: "Principio moral que establece que si existe una sospecha razonable de que una acción causa daño severo (como el dolor en insectos o bivalvos), y carecemos de un consenso absoluto, lo éticamente correcto es evitar esa acción de manera cautelar.",
    relatedNodes: ["zonas-grises", "axiomas-morales"],
    relatedDilemmas: ["bivalvos-ostras", "comer-insectos-harinas"]
  },
  {
    id: "ganaderia-industrial",
    term: "Ganadería Industrial / Macrogranjas",
    patterns: ["ganadería industrial", "ganadería intensiva", "macrogranjas", "macrogranja", "ganadería ecológica"],
    definition: "Sistema moderno de confinamiento masivo que trata a los seres sintientes como máquinas industriales. Su objetivo es producir carne, huevos o leche al menor precio posible, sometiendo la salud física y mental del animal a la eficiencia mercantil.",
    relatedNodes: ["domesticacion-industrial", "el-brambell-report", "recursos-termo"],
    relatedDilemmas: ["granja-feliz-ecologia", "explotacion-industrial-clima", "el-mito-de-la-carne-humanitaria"]
  },
  {
    id: "antropocentrismo",
    term: "Antropocentrismo",
    patterns: ["antropocentrismo", "antropocentrista", "antropocentristas", "antropocéntrico"],
    definition: "Corriente de pensamiento que sitúa al ser humano como el único centro e interés del universo, relegando al resto del ecosistema y a los animales a meros objetos para su beneficio, diversión o alimentación.",
    relatedNodes: ["axiomas-morales", "disonancia-placer", "utilitarismo-singer"],
    relatedDilemmas: ["leones-carne", "el-limite-del-contrato-social"]
  },
  {
    id: "derechos-animales",
    term: "Derechos de los Animales",
    patterns: ["derechos de los animales", "derechos animales", "derechos de los animales domésticos"],
    definition: "La idea moral y jurídica de que los animales merecen una consideración de justicia directa. Esto significa que tienen intereses fundamentales inherentes (a la vida, libertad e integridad) que la ley y los humanos deben respetar.",
    relatedNodes: ["deontologia-regan", "enfoque-capacidades-nussbaum", "axiomas-morales"],
    relatedDilemmas: ["granja-feliz-ecologia", "el-limite-del-contrato-social"]
  },
  {
    id: "declaracion-cambridge",
    term: "Declaración de Cambridge sobre la Conciencia",
    patterns: ["Declaración de Cambridge", "Declaración de Cambridge sobre la Conciencia"],
    definition: "Consenso formal firmado en 2012 por eminentes neurocientíficos que declaró científicamente que los animales no humanos (mamíferos, aves, pulpos) tienen las bases cerebrales y químicas para experimentar estados conscientes y subjetivos de la misma forma que los humanos.",
    relatedNodes: ["dolor-fisico", "zonas-grises"],
    relatedDilemmas: ["plantas-sienten-dolor", "bivalvos-ostras"]
  },
  {
    id: "agricultura-celular",
    term: "Agricultura Celular / Carne Cultivada",
    patterns: ["agricultura celular", "carne cultivada", "fermentación de precisión"],
    definition: "Conjunto de tecnologías innovadoras que permiten fabricar carne real, lácteos y huevos directamente cultivando células o mediante bacterias modificadas en tanques. Esto permite obtener alimento idéntico sin criar, enjaular ni matar animales en absoluto.",
    relatedNodes: ["suplementacion-progreso", "evolucion-dieta"],
    relatedDilemmas: ["granja-feliz-ecologia", "explotacion-industrial-clima"]
  },
  {
    id: "referente-ausente",
    term: "Referente Ausente",
    patterns: ["referente ausente"],
    definition: "Fenómeno lingüístico propuesto por Carol J. Adams donde el lenguaje comercial oculta al animal vivo. Al renombrar el cadáver del animal como 'carne', 'chuleta', 'filete' o 'salchicha', el lenguaje elimina al animal sintiente de nuestra empatía cotidiana.",
    relatedNodes: ["ecofeminismo-adams", "disonancia-placer"],
    relatedDilemmas: ["el-mito-de-la-carne-humanitaria"]
  },
  {
    id: "enfoque-capacidades",
    term: "Enfoque de las Capacidades",
    patterns: ["enfoque de las capacidades", "capacidades esenciales"],
    definition: "Marco filosófico propuesto por Martha Nussbaum que argumenta que cada animal sintiente tiene derecho a prosperar en libertad desarrollando sus actividades naturales específicas (como jugar, correr, volar, interactuar socialmente y vivir libres de miedo).",
    relatedNodes: ["enfoque-capacidades-nussbaum", "deontologia-regan"],
    relatedDilemmas: ["granja-feliz-ecologia", "conservacion-dehesas"]
  }
];
