import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { usePPA24h } from '@/hooks/usePPA24h';

function Metric({ label, value }: { label: string; value: string }) {
  const formatted = value?.toString() ?? '';
  const isNegative = formatted.trim().startsWith('-');
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className={`font-medium ${isNegative ? 'text-red-500' : 'text-green-500'}`}>{formatted}</p>
    </div>
  );
}

export default function PPAWidget() {
  const { data, error, isLoading } = usePPA24h();

  if (isLoading) {
    return (
      <Card className="border-0 shadow-lg bg-gradient-to-r from-indigo-500/20 to-sky-500/10 backdrop-blur-sm">
        <CardHeader>
          <CardTitle>24 hrs PPA</CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-24 rounded-lg" />
        </CardContent>
      </Card>
    );
  }

  if (error || !data) return null;

  const { apr, totalPnl, fundsDeployed, pnl24h } = data;

  return (
    <Card className="border-0 shadow-lg bg-gradient-to-r from-indigo-500/20 to-sky-500/10 backdrop-blur-sm">
      <CardHeader>
        <CardTitle>24 hrs PPA</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-2 gap-4 text-sm">
        <Metric label="APR" value={apr} />
        <Metric label="Total PnL" value={totalPnl} />
        <Metric label="Funds Deployed" value={fundsDeployed} />
        <Metric label="24 h PnL" value={pnl24h} />
      </CardContent>
    </Card>
  );
} 