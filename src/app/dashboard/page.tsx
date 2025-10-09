import { BalanceCard } from "./components/balance-card";
import { ExchangeCard } from "./components/exchange-card";
import { QuickActions } from "./components/quick-actions";

export default function DashboardPage() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-6">
        <BalanceCard />
        <ExchangeCard />
      </div>
      <div className="space-y-6">
        <QuickActions />
      </div>
    </div>
  );
}
