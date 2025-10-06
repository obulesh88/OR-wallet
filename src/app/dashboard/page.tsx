import { BalanceCard } from "./components/balance-card";
import { ConversionForm } from "./components/conversion-form";
import { QuickActions } from "./components/quick-actions";
import { TransactionHistory } from "./components/transaction-history";

export default function DashboardPage() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-6">
        <BalanceCard />
        <ConversionForm />
      </div>
      <div className="space-y-6">
        <QuickActions />
        <TransactionHistory />
      </div>
    </div>
  );
}
