import { Phone, Clock, DollarSign, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Stats {
  totalCalls: number;
  totalMinutes: number;
  totalSpent: number;
  thisMonth: number;
}

interface StatsCardsProps {
  stats: Stats;
}

export function StatsCards({ stats }: StatsCardsProps) {
  const cards = [
    {
      title: "Total Calls",
      value: stats.totalCalls.toString(),
      icon: Phone,
      color: "text-primary",
    },
    {
      title: "Total Minutes",
      value: stats.totalMinutes.toFixed(0),
      icon: Clock,
      color: "text-accent-foreground",
    },
    {
      title: "Total Spent",
      value: `$${stats.totalSpent.toFixed(2)}`,
      icon: DollarSign,
      color: "text-warning",
    },
    {
      title: "This Month",
      value: `$${stats.thisMonth.toFixed(2)}`,
      icon: TrendingUp,
      color: "text-success",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => (
        <Card 
          key={card.title}
          className="group hover:shadow-xl hover:shadow-primary/10 transition-all duration-300 hover:-translate-y-1 border-0 bg-gradient-to-br from-white/80 to-white/50 dark:from-slate-900/80 dark:to-slate-900/50 backdrop-blur-sm overflow-hidden relative"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">
              {card.title}
            </CardTitle>
            <div className="p-2 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 group-hover:scale-110 transition-transform duration-300">
              <card.icon className={`w-5 h-5 ${card.color}`} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold bg-gradient-to-br from-foreground to-muted-foreground bg-clip-text text-transparent">
              {card.value}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}