import { ChevronRight } from "lucide-react";
import { useData } from "../../../context/DataContext";
import { currencyFormatter } from "../../../util/currencyFormatter";
import { useTheme } from "../../../context/ThemeContext";

const R = 52;
const CX = 120;
const CY = 63;   // CY - R = 11 → arco non viene tagliato in alto
const SW = 10;
const HALF_CIRC = Math.PI * R;
const ARC = `M ${CX - R} ${CY} A ${R} ${R} 0 0 1 ${CX + R} ${CY}`;

export default function GoalsSummary({ onNavigate }) {
  const { goals, computeGoalProgress } = useData();
  const { theme } = useTheme();

  const totalTarget = goals.reduce((sum, g) => sum + g.targetAmount, 0);
  const totalCurrent = goals.reduce((sum, g) => sum + computeGoalProgress(g), 0);
  const pct = totalTarget > 0 ? Math.min(100, (totalCurrent / totalTarget) * 100) : 0;
  const dashOffset = HALF_CIRC * (1 - pct / 100);

  const textMain = theme === "dark" ? "#F0F0F0" : "#171717";
  const textMuted = "#939393";
  const trackColor = theme === "dark" ? "#1e2132" : "#e5e7eb";

  return (
    <div className="bg-(--light-bg-container) dark:bg-(--dark-bg-container) rounded-xl border border-(--light-border-color) dark:border-(--dark-border-color) p-5">
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="text-xs font-semibold text-(--dark-third-color) uppercase tracking-wide">Obiettivi</p>
          <p className="text-xl font-bold text-(--dark-main-color) dark:text-(--light-color)">In corso</p>
        </div>
        <button
          onClick={() => onNavigate("obiettivi")}
          className="text-xs font-semibold text-(--dark-third-color) hover:text-(--dark-main-color) dark:hover:text-(--light-color) cursor-pointer flex items-center gap-0.5 mt-1"
        >
          Vedi tutti <ChevronRight className="size-3.5" />
        </button>
      </div>

      {goals.length === 0 ? (
        <p className="text-sm text-(--dark-third-color) py-6 text-center">
          Nessun obiettivo definito ancora.
        </p>
      ) : (
        <div className="flex flex-col items-center">
          {/* viewBox: larghezza 240, altezza 116
              arco top  = CY - R = 11  → margine 11px dal bordo superiore
              arco bottom = CY    = 76
              etichette   = CY+22 = 98  → margine 18px dal bordo inferiore */}
          <svg width="100%" viewBox="0 0 240 97">
            <defs>
              <linearGradient id="gaugeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#6366f1" />
                <stop offset="100%" stopColor="#a855f7" />
              </linearGradient>
            </defs>

            {/* Track */}
            <path d={ARC} fill="none" stroke={trackColor} strokeWidth={SW} strokeLinecap="round" />

            {/* Progress */}
            <path
              d={ARC}
              fill="none"
              stroke="url(#gaugeGrad)"
              strokeWidth={SW}
              strokeLinecap="round"
              strokeDasharray={HALF_CIRC}
              strokeDashoffset={dashOffset}
            />

            {/* Percentuale — centrata nello spazio dell'arco */}
            <text
              x={CX} y={CY - 18}
              textAnchor="middle"
              fontSize="16"
              fontWeight="700"
              fill={textMain}
              fontFamily="Montserrat, sans-serif"
            >
              {Math.round(pct)}%
            </text>

            {/* Corrente / Target */}
            <text x={CX} y={CY - 5} textAnchor="middle" fontSize="6" fill={textMuted}>
              {currencyFormatter.format(totalCurrent)} di {currencyFormatter.format(totalTarget)}
            </text>

            {/* Etichetta sinistra */}
            <text x={CX - R} y={CY + 18} textAnchor="middle" fontSize="7" fill={textMuted}>
              €0
            </text>

            {/* Etichetta destra */}
            <text x={CX + R} y={CY + 18} textAnchor="middle" fontSize="7" fill={textMuted}>
              {currencyFormatter.format(totalTarget)}
            </text>
          </svg>

          <p className="text-sm font-semibold text-(--dark-main-color) dark:text-(--light-color) mt-2">
            Raggiunto vs Target
          </p>
        </div>
      )}
    </div>
  );
}
