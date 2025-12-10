import { Phone, Clock, DollarSign, TrendingUp, ArrowUp, ArrowDown } from "lucide-react";
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
      color: "#0891b2",
      bgColor: "#0891b2/10",
      change: "+12%",
      isPositive: true,
    },
    {
      title: "Total Minutes",
      value: stats.totalMinutes.toFixed(0),
      icon: Clock,
      color: "#8b5cf6",
      bgColor: "#8b5cf6/10",
      change: "+8%",
      isPositive: true,
    },
    {
      title: "Total Spent",
      value: `$${stats.totalSpent.toFixed(2)}`,
      icon: DollarSign,
      color: "#f97316",
      bgColor: "#f97316/10",
      change: "-3%",
      isPositive: false,
    },
    {
      title: "This Month",
      value: `$${stats.thisMonth.toFixed(2)}`,
      icon: TrendingUp,
      color: "#10b981",
      bgColor: "#10b981/10",
      change: "+15%",
      isPositive: true,
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => (
        <Card
          key={card.title}
          className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-gray-100 bg-white rounded-2xl overflow-hidden relative"
        >
          {/* Hover gradient overlay */}
          <div
            className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            style={{ background: `linear-gradient(135deg, ${card.color}08 0%, transparent 50%)` }}
          />

          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0 relative">
            <CardTitle className="text-sm font-medium text-gray-500 group-hover:text-gray-700 transition-colors">
              {card.title}
            </CardTitle>
            <div
              className="p-2 rounded-xl group-hover:scale-110 transition-transform duration-300"
              style={{ backgroundColor: `${card.color}15` }}
            >
              <card.icon className="w-5 h-5" style={{ color: card.color }} />
            </div>
          </CardHeader>
          <CardContent className="relative">
            <div className="text-3xl font-bold text-[#1a365d]">
              {card.value}
            </div>
            <div className={`flex items-center gap-1 mt-2 text-sm ${card.isPositive ? "text-green-600" : "text-red-500"
              }`}>
              {card.isPositive ? (
                <ArrowUp className="w-3 h-3" />
              ) : (
                <ArrowDown className="w-3 h-3" />
              )}
              <span className="font-medium">{card.change}</span>
              <span className="text-gray-400">vs last month</span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
