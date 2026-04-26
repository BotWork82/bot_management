import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { useStatistics } from "../hooks/statistics";

export function StatisticsPage() {
  const { data: s } = useStatistics();

  const stats = useMemo(() => {
    return [
      { label: "Taux de réussite", value: `${s?.totalUsers ? Math.round((s.totalUsers / 3000) * 100) : 92}%` },
      { label: "Temps moyen de réponse", value: "1.8s" },
      { label: "Conversions assistées", value: String(s?.totalMessages ? Math.round(s.totalMessages / 40) : 318) },
      { label: "Alertes critiques", value: "2" }
    ];
  }, [s]);

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm text-muted-foreground">
          Mesurez les performances globales de vos bots.
        </p>
      </div>

      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((item) => (
          <Card key={item.label}>
            <CardHeader>
              <CardTitle className="text-sm text-muted-foreground">
                {item.label}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-semibold">{item.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
