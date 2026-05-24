import { useState } from "react";
import { 
  Plus, 
  Minus, 
  Droplet, 
  Grid, 
  Trees, 
  Flame, 
  ChevronRight, 
  Share2, 
  Info, 
  LineChart, 
  TrendingDown, 
  Calculator,
  ArrowRight
} from "lucide-react";
import { motion } from "motion/react";

export default function ImpactCalculator() {
  const [weeklyMeals, setWeeklyMeals] = useState(7); // default 7 animal-based meals a week

  // Coefficients (Per animal meal equivalent - simplified averages based on global studies like Poore & Nemecek 2018)
  // Assumes average meal consists of 150g of mixed animal products (beef, pork, chicken, dairy, eggs)
  const WATER_PER_MEAL = 900; // liters (average weighted across beef/pork/poultry/eggs per 150g)
  const CO2_PER_MEAL = 4.2; // kg of CO2 equivalent
  const FOREST_PER_MEAL = 3.5; // m2 of land occupied/deforested (per 150g equivalent)
  const GRAIN_PER_MEAL = 1.2; // kg of feed grain needed to filter through the animal

  // Yearly estimates
  const yearlyWater = Math.round(weeklyMeals * WATER_PER_MEAL * 52);
  const yearlyCo2 = Math.round(weeklyMeals * CO2_PER_MEAL * 52 * 10) / 10;
  const yearlyForest = Math.round(weeklyMeals * FOREST_PER_MEAL * 52);
  const yearlyGrain = Math.round(weeklyMeals * GRAIN_PER_MEAL * 52 * 10) / 10;

  // Equivalencies
  const olympicPools = Math.round((yearlyWater / 2500000) * 100) / 100; // 2.5 million liters in Olympic pool
  const carKm = Math.round(yearlyCo2 / 0.12); // Average car emits 120g/km (0.12 kg/km)
  const soccerFields = Math.round((yearlyForest / 7140) * 100) / 100; // Soccer field is ~7140 m2

  return (
    <div id="impact-calculator-view" className="space-y-8 w-full max-w-6xl mx-auto">
      
      {/* Introduction layout */}
      <div className="bg-white dark:bg-zinc-950/40 p-6 lg:p-8 border border-zinc-200 dark:border-zinc-800/80 rounded-3xl grid grid-cols-1 md:grid-cols-12 gap-6 items-center transition-all duration-300">
        <div className="md:col-span-8 space-y-3">
          <h3 className="text-sm font-semibold tracking-wider font-mono text-zinc-800 dark:text-zinc-300 uppercase flex items-center gap-1.5">
            <Calculator className="w-4 h-4 text-emerald-600 dark:text-emerald-500" />
            Cuantificador Planetario de la Demanda de Carne
          </h3>
          <p className="text-zinc-600 dark:text-zinc-400 text-xs font-light leading-relaxed">
            Las decisiones dietéticas individuales se agregan mecánicamente en la demanda agregada industrial. Utiliza este cuantificador interactivo para ver los m3 de agua limpia consumidos, los kg de CO2 térmico inyectados, la superficie forestal destruida y el cereal desperdiciado para nutrir tus hábitos semanales.
          </p>
        </div>
        <div className="md:col-span-4 flex flex-col justify-center items-end bg-zinc-100/70 dark:bg-zinc-900/60 p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800/80">
          <span className="text-[10px] font-mono text-zinc-500 dark:text-zinc-400 uppercase tracking-widest block mb-1">Tu Hábito Semanal de Consumo:</span>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setWeeklyMeals((v) => Math.max(0, v - 1))}
              className="p-2 bg-white dark:bg-zinc-950 hover:bg-zinc-100 dark:hover:bg-zinc-800 border border-zinc-400 dark:border-zinc-800 rounded-xl rounded-l-full text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white transition-all cursor-pointer shadow-sm dark:shadow-none"
            >
              <Minus className="w-4 h-4" />
            </button>
            <span className="text-2xl font-black text-zinc-900 dark:text-white px-2 tracking-tight">
              {weeklyMeals} <span className="text-xs text-zinc-500 dark:text-zinc-400 font-normal">comidas</span>
            </span>
            <button
              onClick={() => setWeeklyMeals((v) => Math.min(21, v + 1))}
              className="p-2 bg-white dark:bg-zinc-950 hover:bg-zinc-100 dark:hover:bg-zinc-800 border border-zinc-400 dark:border-zinc-800 rounded-xl rounded-r-full text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white transition-all cursor-pointer shadow-sm dark:shadow-none"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
          <span className="text-[9px] font-mono text-zinc-500 dark:text-zinc-500 mt-1 uppercase text-right">Equivalente a {Math.round(weeklyMeals / 3 * 10) / 10} días completos</span>
        </div>
      </div>

      {/* Grid displays of outcomes */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Metric A: Water */}
        <div className="bg-white dark:bg-zinc-950/40 border border-zinc-200 dark:border-zinc-800/80 rounded-3xl p-6 flex flex-col justify-between hover:border-zinc-400 dark:hover:border-zinc-700 transition-all group shadow-sm dark:shadow-none">
          <div className="space-y-4">
            <div className="w-10 h-10 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
              <Droplet className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
            </div>
            <div>
              <span className="text-[10px] font-mono text-zinc-500 dark:text-zinc-400 tracking-wider uppercase block">Gasto de Agua Anual</span>
              <span className="text-3xl font-extrabold text-cyan-600 dark:text-cyan-400 tracking-tight block">
                {yearlyWater.toLocaleString()} <span className="text-sm text-zinc-500 font-normal">L</span>
              </span>
            </div>
          </div>
          <p className="text-[11px] text-zinc-600 dark:text-zinc-400 leading-relaxed font-light mt-4 pt-4 border-t border-zinc-200 dark:border-zinc-900 transition-colors">
            Equivale a llenar unas <strong className="text-zinc-800 dark:text-zinc-300 font-semibold">{olympicPools} piscinas olímpicas</strong> completas de agua potable o {Math.round(yearlyWater / 150).toLocaleString()} duchas de 10 minutos.
          </p>
        </div>

        {/* Metric B: CO2 */}
        <div className="bg-white dark:bg-zinc-950/40 border border-zinc-200 dark:border-zinc-800/80 rounded-3xl p-6 flex flex-col justify-between hover:border-zinc-400 dark:hover:border-zinc-700 transition-all group shadow-sm dark:shadow-none">
          <div className="space-y-4">
            <div className="w-10 h-10 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center animate-pulse">
              <Flame className="w-5 h-5 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <span className="text-[10px] font-mono text-zinc-500 dark:text-zinc-400 tracking-wider uppercase block">Emisiones CO2 Equivalente</span>
              <span className="text-3xl font-extrabold text-red-600 dark:text-red-400 tracking-tight block">
                {yearlyCo2.toLocaleString()} <span className="text-xs text-zinc-500 font-normal">kg eq</span>
              </span>
            </div>
          </div>
          <p className="text-[11px] text-zinc-600 dark:text-zinc-400 leading-relaxed font-light mt-4 pt-4 border-t border-zinc-200 dark:border-zinc-900 transition-colors">
            Equivale a conducir un turismo estándar de combustión directa por <strong className="text-zinc-800 dark:text-zinc-300 font-semibold">{carKm.toLocaleString()} km</strong> o recargar {Math.round(yearlyCo2 * 120).toLocaleString()} smartphones.
          </p>
        </div>

        {/* Metric C: Forest Deforestation */}
        <div className="bg-white dark:bg-zinc-950/40 border border-zinc-200 dark:border-zinc-800/80 rounded-3xl p-6 flex flex-col justify-between hover:border-zinc-400 dark:hover:border-zinc-700 transition-all group shadow-sm dark:shadow-none">
          <div className="space-y-4">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
              <Trees className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <span className="text-[10px] font-mono text-zinc-500 dark:text-zinc-400 tracking-wider uppercase block">Suelo / Deforestación Aludida</span>
              <span className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400 tracking-tight block">
                {yearlyForest.toLocaleString()} <span className="text-xs text-zinc-500 font-normal">m²</span>
              </span>
            </div>
          </div>
          <p className="text-[11px] text-zinc-600 dark:text-zinc-400 leading-relaxed font-light mt-4 pt-4 border-t border-zinc-200 dark:border-zinc-900 transition-colors">
            Representa unos <strong className="text-zinc-800 dark:text-zinc-300 font-semibold">{soccerFields} campos de fútbol</strong> de selva deforestada para dar cabida a pastizales o cultivo exclusivo de soja forrajera.
          </p>
        </div>

        {/* Metric D: Grain */}
        <div className="bg-white dark:bg-zinc-950/40 border border-zinc-200 dark:border-zinc-800/80 rounded-3xl p-6 flex flex-col justify-between hover:border-zinc-400 dark:hover:border-zinc-700 transition-all group shadow-sm dark:shadow-none">
          <div className="space-y-4">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
              <Grid className="w-5 h-5 text-amber-600 dark:text-amber-500" />
            </div>
            <div>
              <span className="text-[10px] font-mono text-zinc-500 dark:text-zinc-400 tracking-wider uppercase block">Cereal Desperdiciado (Piensos)</span>
              <span className="text-3xl font-extrabold text-amber-600 dark:text-amber-500 tracking-tight block">
                {yearlyGrain.toLocaleString()} <span className="text-xs text-zinc-500 font-normal">kg</span>
              </span>
            </div>
          </div>
          <p className="text-[11px] text-zinc-600 dark:text-zinc-400 leading-relaxed font-light mt-4 pt-4 border-t border-zinc-200 dark:border-zinc-900 transition-colors">
            Kilos de cereal de alta calidad filtrados e ineficientemente perdidos para alimentar ganado, suficientes para nutrir directamente a más de <strong className="text-zinc-800 dark:text-zinc-300 font-semibold">{Math.round(yearlyGrain / 150)} personas</strong> durante un mes completo.
          </p>
        </div>

      </div>

      {/* Projections block */}
      <div className="bg-white dark:bg-zinc-900/10 border border-zinc-200 dark:border-zinc-800/80 p-6 lg:p-8 rounded-3xl grid grid-cols-1 md:grid-cols-2 gap-8 items-center transition-all duration-300 shadow-sm dark:shadow-none">
        
        <div className="space-y-4">
          <h4 className="text-xs font-semibold tracking-wider font-mono text-zinc-800 dark:text-zinc-300 uppercase flex items-center gap-1.5">
            <TrendingDown className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            La Escala Global del Pequeño Cambio
          </h4>
          <p className="text-zinc-600 dark:text-zinc-400 text-xs font-light leading-relaxed">
            Si solo la mitad de los habitantes de un país mediano como España o Colombia redujeran su ingesta por apenas 3 comidas semanales alternativas en base a plantas, se ahorrarían anualmente billones de m3 de agua limpia e inyectarían sumideros de reforestación masiva en la selva amazónica. No se trata de purismo absoluto, sino de la dirección del flujo de consumo.
          </p>
          <div className="flex gap-4 pt-2">
            <div className="space-y-0.5 bg-zinc-100/60 dark:bg-zinc-950/40 border border-zinc-200 dark:border-zinc-900 px-4 py-3 rounded-2xl">
              <span className="text-[10px] font-mono text-zinc-500 block uppercase">Eficiencia Nutricional Directa</span>
              <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">Hasta x10 Eficiente</span>
            </div>
            <div className="space-y-0.5 bg-zinc-100/60 dark:bg-zinc-950/40 border border-zinc-200 dark:border-zinc-900 px-4 py-3 rounded-2xl">
              <span className="text-[10px] font-mono text-zinc-500 block uppercase">Liberación de Tierras Agrícolas</span>
              <span className="text-sm font-bold text-zinc-900 dark:text-white">75% Reducción Mundial</span>
            </div>
          </div>
        </div>

        {/* Transition Comparison Panel */}
        <div className="bg-zinc-50/50 dark:bg-zinc-950/50 p-5 rounded-2xl border border-zinc-300 dark:border-zinc-800 space-y-4 text-xs font-light shadow-sm dark:shadow-none">
          <h4 className="font-mono text-[10px] text-zinc-500 dark:text-zinc-400 uppercase tracking-widest flex items-center gap-1.5 border-b border-zinc-200 dark:border-zinc-900 pb-2">
            <LineChart className="w-3.5 h-3.5 text-zinc-800 dark:text-zinc-200" />
            Simulador de Transición Dietética
          </h4>
          
          <div className="space-y-3">
            <div className="flex justify-between items-center bg-zinc-100/70 dark:bg-zinc-900/40 px-3 py-2 rounded-xl border border-zinc-200 dark:border-transparent">
              <span className="text-zinc-600 dark:text-zinc-400 text-[11px]">Consumo Actual (Dieta Estándar)</span>
              <span className="text-red-600 dark:text-red-400 font-bold font-mono">100% Gasto Fáctico</span>
            </div>
            <div className="flex items-center justify-center py-0.5">
              <ArrowRight className="w-4 h-4 text-zinc-400 dark:text-zinc-700 animate-pulse rotate-90 md:rotate-0" />
            </div>
            <div className="flex justify-between items-center bg-emerald-50 dark:bg-emerald-950/20 px-3 py-2.5 rounded-xl border border-emerald-200 dark:border-emerald-900/30">
              <div className="space-y-0.5">
                <span className="text-zinc-900 dark:text-white text-[11px] font-semibold block">Transición Vegana Directa (0 comidas animales)</span>
                <span className="text-[10px] text-zinc-500">Cero consumo de cobalamina parasitaria ganadera</span>
              </div>
              <span className="text-emerald-700 dark:text-emerald-400 font-bold font-mono text-xs bg-emerald-100 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-900/40 px-2 py-0.5 rounded">
                -92% Huella
              </span>
            </div>
          </div>
          
        </div>

      </div>

    </div>
  );
}
