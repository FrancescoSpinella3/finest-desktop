import { useMemo } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useData } from "../../../context/DataContext";
import { monthKey, monthLabel } from "../../../util/dateUtils";
import { currencyFormatter } from "../../../util/currencyFormatter";
import { useTheme } from "../../../context/ThemeContext";
import { TYPE_HEX } from "../../../util/typeStyles";

const COLORS = {
  entrate: TYPE_HEX.income,
  uscite: TYPE_HEX.expense,
  risparmi: TYPE_HEX.saving,
};

function yFormatter(v) {
  if (v >= 1000) return `€${(v / 1000).toFixed(0)}k`;
  return `€${v}`;
}

export default function MonthlyChart() {
  const { transactions } = useData();
  const { theme } = useTheme();
  const year = new Date().getFullYear();

  const data = useMemo(() => {
    const months = Array.from({ length: 12 }, (_, i) =>
      `${year}-${String(i + 1).padStart(2, "0")}`
    );
    const map = Object.fromEntries(
      months.map((k) => [k, { entrate: 0, risparmi: 0, uscite: 0 }])
    );
    transactions.forEach((t) => {
      const k = monthKey(t.date);
      if (!map[k]) return;
      if (t.type === "income") map[k].entrate += t.amount;
      else if (t.type === "expense") map[k].uscite += t.amount;
      else if (t.type === "saving") map[k].risparmi += t.amount;
    });
    return months.map((k) => ({ name: monthLabel(k), ...map[k] }));
  }, [transactions, year]);

  const gridColor = theme === "dark" ? "#333547" : "#e1e1df";
  const textColor = theme === "dark" ? "#939393" : "#888888";
  const tooltipBg = theme === "dark" ? "#1b1c24" : "#ffffff";

  return (
    <div className="bg-(--light-bg-container) dark:bg-(--dark-bg-container) rounded-xl border border-(--light-border-color) dark:border-(--dark-border-color) p-5">
      <div className="mb-4">
        <p className="text-xs font-semibold text-(--dark-third-color) uppercase tracking-wide">
          Flusso annuale
        </p>
        <p className="text-2xl font-bold text-(--dark-main-color) dark:text-(--light-color)">{year}</p>
      </div>

      <ResponsiveContainer width="100%" height={240}>
        <AreaChart data={data} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="gradEntrate" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={COLORS.entrate} stopOpacity={0.35} />
              <stop offset="95%" stopColor={COLORS.entrate} stopOpacity={0.02} />
            </linearGradient>
            <linearGradient id="gradUscite" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={COLORS.uscite} stopOpacity={0.35} />
              <stop offset="95%" stopColor={COLORS.uscite} stopOpacity={0.02} />
            </linearGradient>
            <linearGradient id="gradRisparmi" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={COLORS.risparmi} stopOpacity={0.35} />
              <stop offset="95%" stopColor={COLORS.risparmi} stopOpacity={0.02} />
            </linearGradient>
          </defs>

          <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
          <XAxis
            dataKey="name"
            stroke={textColor}
            fontSize={12}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            stroke={textColor}
            fontSize={12}
            tickLine={false}
            axisLine={false}
            width={44}
            tickFormatter={yFormatter}
          />
          <Tooltip
            formatter={(value, name) => [currencyFormatter.format(value), name]}
            contentStyle={{
              background: tooltipBg,
              border: `1px solid ${gridColor}`,
              borderRadius: 10,
              fontSize: 12,
            }}
            labelStyle={{ color: textColor, marginBottom: 4 }}
          />
          <Area
            type="monotone"
            dataKey="entrate"
            name="Entrate"
            stroke={COLORS.entrate}
            strokeWidth={2}
            fill="url(#gradEntrate)"
            dot={false}
            activeDot={{ r: 4 }}
          />
          <Area
            type="monotone"
            dataKey="uscite"
            name="Uscite"
            stroke={COLORS.uscite}
            strokeWidth={2}
            fill="url(#gradUscite)"
            dot={false}
            activeDot={{ r: 4 }}
          />
          <Area
            type="monotone"
            dataKey="risparmi"
            name="Risparmi"
            stroke={COLORS.risparmi}
            strokeWidth={2}
            fill="url(#gradRisparmi)"
            dot={false}
            activeDot={{ r: 4 }}
          />
        </AreaChart>
      </ResponsiveContainer>

      <div className="flex justify-center gap-5 mt-3">
        {[
          { label: "Entrate", color: COLORS.entrate },
          { label: "Uscite", color: COLORS.uscite },
          { label: "Risparmi", color: COLORS.risparmi },
        ].map(({ label, color }) => (
          <div key={label} className="flex items-center gap-1.5">
            <span className="size-2 rounded-full shrink-0" style={{ backgroundColor: color }} />
            <span className="text-xs text-(--dark-third-color)">{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
