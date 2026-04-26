import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from "../components/ui/card";
import { useSummaryCards, useWeeklyInteractions, useRecentActivity } from "../hooks/dashboard";
import { BarChart3, Boxes as BoxesIcon, MessageSquare, Users } from "lucide-react";

export function DashboardPage() {
  const { data: summaryCards = [], isLoading: summaryLoading } = useSummaryCards();
  const { data: interactions = [], isLoading: interactionsLoading } = useWeeklyInteractions();
  const { data: activities = [], isLoading: activitiesLoading } = useRecentActivity();

  const loading = summaryLoading || interactionsLoading;
  const hasInteractionValues = interactions.some((h) => Number(h) > 0);

  const fixedSummaryCards = [
    { label: "Total Products", icon: BoxesIcon },
    { label: "Categories", icon: BarChart3 },
    { label: "Farms", icon: BoxesIcon },
    { label: "Bot Users", icon: Users },
    { label: "Messages Sent", icon: MessageSquare },
    { label: "Engagement", icon: BarChart3 }
  ];

  const summaryByLabel = new Map(summaryCards.map((card) => [card.label, card]));

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3 xl:grid-cols-6">
        {loading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="rounded-2xl border border-border/70 shadow-sm animate-pulse">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="h-4 bg-slate-200 rounded w-3/4" />
                <span className="h-8 w-8 rounded-full bg-slate-200" />
              </CardHeader>
              <CardContent>
                <div className="h-6 w-24 bg-slate-200 rounded" />
                <p className="h-3 mt-2 w-16 bg-slate-200 rounded" />
              </CardContent>
            </Card>
          ))
        ) : (
          fixedSummaryCards.map((cardDef) => {
            const apiCard = summaryByLabel.get(cardDef.label);
            const Icon = (apiCard?.icon as any) ?? cardDef.icon;
            return (
              <Card
                key={cardDef.label}
                className="rounded-2xl border border-border/70 shadow-sm"
              >
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-xs font-medium text-muted-foreground">
                    {cardDef.label}
                  </CardTitle>
                  <span className="h-8 w-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
                    <Icon className="h-4 w-4" />
                  </span>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-semibold">{apiCard?.value ?? "0"}</div>
                  <p className="text-xs text-muted-foreground mt-1">{apiCard?.helper || "Aucun element disponible"}</p>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,2fr),minmax(0,1fr)]">
        <Card className="rounded-2xl border border-border/70 shadow-sm">
          <CardHeader>
            <CardTitle className="text-sm font-semibold">
              Bot Interactions This Week
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 rounded-xl bg-gradient-to-t from-blue-50 to-blue-100 border border-blue-100 flex items-end justify-between px-6 pb-6">
              {/* Fake chart bars */}
              {loading ? (
                Array.from({ length: 7 }).map((_, i) => (
                  <div key={i} className="flex flex-col items-center gap-2 text-xs text-muted-foreground">
                    <div className="w-6 rounded-full bg-slate-200" style={{ height: `${60 + i * 10}px` }} />
                    <span className="h-3 w-8 bg-slate-200 rounded" />
                  </div>
                ))
              ) : !hasInteractionValues ? (
                <div className="w-full text-center text-sm text-muted-foreground self-center pb-8">
                  Aucun element disponible dans cette liste.
                </div>
              ) : (
                interactions.map((h, i) => (
                  <div
                    key={i}
                    className="flex flex-col items-center gap-2 text-xs text-muted-foreground"
                  >
                    <div
                      className="w-6 rounded-full bg-blue-400/70"
                      style={{ height: `${Math.max(8, (Math.max(0, h) / 600) * 180)}px` }}
                    />
                    <span>{["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"][i]}</span>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border border-border/70 shadow-sm">
          <CardHeader>
            <CardTitle className="text-sm font-semibold">
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            {activitiesLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="flex items-start justify-between gap-3"
              >
                <div className="flex items-start gap-3">
                  <div className="mt-1 h-7 w-7 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center text-xs">
                    <BoxesIcon className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="h-3 w-24 bg-slate-200 rounded" />
                    <div className="text-xs text-muted-foreground">
                      <div className="h-3 w-36 bg-slate-200 rounded mt-1" />
                    </div>
                  </div>
                </div>
                <span className="text-[11px] text-muted-foreground whitespace-nowrap">
                  ...
                </span>
              </div>
              ))
            ) : activities.length === 0 ? (
              <div className="py-8 text-center text-sm text-muted-foreground">
                Aucun element disponible dans cette liste.
              </div>
            ) : (
              activities.map((activity, i) => (
                <div
                  key={`${activity.title}-${i}`}
                  className="flex items-start justify-between gap-3"
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-1 h-7 w-7 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center text-xs">
                      <BoxesIcon className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="font-medium text-[13px]">{activity.title}</div>
                      <div className="text-xs text-muted-foreground">{activity.desc}</div>
                    </div>
                  </div>
                  <span className="text-[11px] text-muted-foreground whitespace-nowrap">{activity.time}</span>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
