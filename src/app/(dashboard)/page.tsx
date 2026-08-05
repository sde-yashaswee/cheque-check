import { ChevronDown, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  return (
    <div className="mx-auto max-w-2xl space-y-8 pb-8">
      {/* Business Switcher */}
      <div className="flex items-center">
        <button className="flex items-center gap-2 rounded-pill bg-canvas-parchment px-4 py-2 text-sm font-semibold transition-transform active:scale-95 dark:bg-surface-tile-1">
          <ChevronDown className="h-4 w-4" />
          <span>ABC Industries</span>
        </button>
      </div>

      {/* Header */}
      <h1 className="text-display-lg">Home</h1>

      {/* Outstanding Card */}
      <div className="rounded-lg bg-primary p-6 text-primary-foreground shadow-product">
        <p className="text-sm font-medium opacity-80">Outstanding</p>
        <p className="mt-1 text-display-lg">₹18,40,000</p>
        <div className="mt-6 flex gap-8 border-t border-white/20 pt-4">
          <div>
            <p className="text-xs opacity-80 uppercase tracking-wider">Issued</p>
            <p className="text-lg font-semibold">₹22L</p>
          </div>
          <div>
            <p className="text-xs opacity-80 uppercase tracking-wider">Received</p>
            <p className="text-lg font-semibold">₹5L</p>
          </div>
        </div>
      </div>

      {/* Status Grid */}
      <div className="grid grid-cols-2 gap-4">
        {[
          { label: "Today", count: 2, amount: "₹1.2L" },
          { label: "Upcoming", count: 23, amount: "₹4.8L" },
          { label: "Overdue", count: 5, amount: "₹2.1L" },
          { label: "Cleared", count: 142, amount: "₹28L" },
          { label: "Bounced", count: 3, amount: "₹0.9L" },
          { label: "Received", count: 12, amount: "₹5L" },
        ].map((status) => (
          <div key={status.label} className="rounded-lg border bg-card p-4 transition-transform active:scale-95">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">{status.label}</p>
            <p className="mt-2 text-xl font-bold">{status.count}</p>
            <p className="text-sm text-muted-foreground">{status.amount}</p>
          </div>
        ))}
      </div>

      {/* Today's Cheques */}
      <div className="space-y-4">
        <h2 className="text-lead font-semibold">Today&apos;s Cheques</h2>
        <div className="rounded-lg border bg-card p-5 shadow-sm transition-transform active:scale-95">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xl font-bold">₹50,000</p>
              <p className="text-body-strong">ABC Traders</p>
            </div>
            <div className="text-right">
              <p className="text-xs font-semibold text-primary uppercase">Today</p>
              <p className="text-xs text-muted-foreground">ICICI Bank</p>
            </div>
          </div>
          <div className="mt-4 flex justify-between items-center border-t pt-4">
            <p className="text-xs text-muted-foreground">Cheque #12345</p>
            <div className="rounded-pill bg-primary/10 px-2 py-1 text-[10px] font-bold text-primary uppercase">
              Upcoming
            </div>
          </div>
        </div>
      </div>

      {/* FAB */}
      <Button className="fixed bottom-20 right-6 h-14 w-14 rounded-full shadow-lg" size="icon">
        <Plus className="h-6 w-6" />
      </Button>
    </div>
  );
}
