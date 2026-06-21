import { TrendingDown, TrendingUp, Wallet, PiggyBank } from "lucide-react";
import Section from "../../ui/Section";
import { useData } from "../../../context/DataContext";
import { currencyFormatter } from "../../../util/currencyFormatter";
import { TYPE_ICON, TYPE_AMOUNT_COLOR } from "../../../util/typeStyles";
import MonthlyChart from "./MonthlyChart";
import RecentTransactions from "./RecentTransactions";
import RecentSubscriptions from "./RecentSubscriptions";
import GoalsSummary from "./GoalsSummary";

export default function Overview({ onNavigate }) {
  const { totals } = useData();

  return (
    <Section>
      <div className="flex flex-col gap-5 lg:flex-row">
        <div className="flex flex-col gap-5 flex-1 min-w-0">
          {/* Total balance card */}
          <div className="bg-(--light-bg-container) dark:bg-(--dark-bg-container) rounded-xl border border-(--light-border-color) dark:border-(--dark-border-color) p-5">
            <div className="flex items-center gap-2 mb-3">
              <div className="size-2 bg-green-700 rounded-full" />
              <h3 className="font-semibold text-xs text-(--dark-third-color) tracking-wide">PATRIMONIO NETTO</h3>
            </div>
            <h2 className="text-4xl font-semibold mb-7 text-(--dark-main-color) dark:text-(--light-color)">
              {currencyFormatter.format(totals.netWorth)}
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-0 border-t border-(--light-border-color) dark:border-(--dark-border-color) pt-4">
              <div className="flex items-center gap-3">
                <div className="size-9 rounded-lg bg-green-700/10 text-(--success-color) flex items-center justify-center shrink-0">
                  <TrendingUp className="size-4.5" />
                </div>
                <div>
                  <p className="text-xs text-(--dark-third-color)">Entrate totali</p>
                  <p className="font-semibold text-(--dark-main-color) dark:text-(--light-color)">
                    {currencyFormatter.format(totals.income)}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 sm:border-l sm:border-(--light-border-color) sm:dark:border-(--dark-border-color) sm:pl-4">
                <div className="size-9 rounded-lg bg-orange-700/10 text-(--warning-color) flex items-center justify-center shrink-0">
                  <TrendingDown className="size-4.5" />
                </div>
                <div>
                  <p className="text-xs text-(--dark-third-color)">Uscite totali</p>
                  <p className="font-semibold text-(--dark-main-color) dark:text-(--light-color)">
                    {currencyFormatter.format(totals.expense)}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 sm:border-l sm:border-(--light-border-color) sm:dark:border-(--dark-border-color) sm:pl-4">
                <div className={`size-9 rounded-lg flex items-center justify-center shrink-0 ${TYPE_ICON.saving}`}>
                  <Wallet className="size-4.5" />
                </div>
                <div>
                  <p className="text-xs text-(--dark-third-color)">Risparmi totali</p>
                  <p className="font-semibold text-(--dark-main-color) dark:text-(--light-color)">
                    {currencyFormatter.format(totals.saving)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <MonthlyChart />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <GoalsSummary onNavigate={onNavigate} />
            <div className="bg-(--light-bg-container) dark:bg-(--dark-bg-container) rounded-xl border border-(--light-border-color) dark:border-(--dark-border-color) p-5 flex flex-col">
              <div className="mb-4">
                <p className="text-xs font-semibold text-(--dark-third-color) uppercase tracking-wide">Questo mese</p>
                <p className="text-xl font-bold text-(--dark-main-color) dark:text-(--light-color) capitalize">
                  {new Date().toLocaleDateString("it-IT", { month: "long" })}
                </p>
              </div>
              <MonthSummary />
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-5 lg:w-110 shrink-0">
          <RecentTransactions onNavigate={onNavigate} />
          <RecentSubscriptions onNavigate={onNavigate} />
        </div>
      </div>
    </Section>
  );
}

function MonthSummary() {
  const { monthTotals } = useData();
  const net = monthTotals.income - monthTotals.expense - monthTotals.saving;
  const isPositive = net >= 0;

  const rows = [
    {
      label: "Entrate",
      value: monthTotals.income,
      icon: TrendingUp,
      iconBg: "bg-green-700/10",
      iconColor: "text-(--success-color)",
      valueColor: "text-(--success-color)",
      prefix: "+",
    },
    {
      label: "Uscite",
      value: monthTotals.expense,
      icon: TrendingDown,
      iconBg: "bg-red-700/10",
      iconColor: "text-(--danger-color)",
      valueColor: "text-(--danger-color)",
      prefix: "-",
    },
    {
      label: "Risparmiato",
      value: monthTotals.saving,
      icon: PiggyBank,
      iconBg: "bg-yellow-500/10",
      iconColor: "text-yellow-500",
      valueColor: "text-yellow-500",
      prefix: "",
    },
  ];

  return (
    <div className="flex flex-col gap-3 flex-1 justify-center">
      {rows.map(({ label, value, icon: Icon, iconBg, iconColor, valueColor, prefix }) => (
        <div key={label} className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className={`size-8 rounded-lg flex items-center justify-center shrink-0 ${iconBg} ${iconColor}`}>
              <Icon className="size-4" />
            </div>
            <span className="text-sm text-(--dark-second-color) dark:text-(--dark-third-color)">{label}</span>
          </div>
          <span className={`text-sm font-semibold ${valueColor}`}>
            {prefix}{currencyFormatter.format(value)}
          </span>
        </div>
      ))}

      <div className={`mt-2 rounded-xl p-3 flex items-center justify-between ${isPositive ? "bg-green-700/8" : "bg-red-700/8"}`}>
        <span className="text-sm font-medium text-(--dark-main-color) dark:text-(--light-color)">Bilancio mensile</span>
        <span className={`text-sm font-bold ${isPositive ? "text-(--success-color)" : "text-(--danger-color)"}`}>
          {isPositive ? "+" : ""}{currencyFormatter.format(net)}
        </span>
      </div>
    </div>
  );
}
