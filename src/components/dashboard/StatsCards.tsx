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
        <Card key={card.title}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {card.title}
            </CardTitle>
            <card.icon className={`w-4 h-4 ${card.color}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{card.value}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}