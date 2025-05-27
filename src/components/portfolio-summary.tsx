import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDollar, formatPercent } from "@/lib/utils";
import { PortfolioSummary } from "@/types/api";

interface PortfolioSummaryProps {
  summary: PortfolioSummary;
  walletCount?: number;
  isAggregate?: boolean;
}

export default function PortfolioSummaryComponent({ 
  summary, 
  walletCount,
  isAggregate = false 
}: PortfolioSummaryProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
      <SummaryCard 
        title="Total Value" 
        value={formatDollar(summary.total_value)} 
        description={isAggregate && walletCount ? `${walletCount} Wallets` : "Portfolio Value"}
      />

      <SummaryCard 
        title="Token Value" 
        value={formatDollar(summary.token_value)}
        description="SOL & SPL Tokens"
      />

      <SummaryCard 
        title="LP Value" 
        value={formatDollar(summary.whirlpool_value + summary.raydium_value)}
        description="Orca & Raydium"
      />

      <SummaryCard 
        title="Lending Value" 
        value={formatDollar(summary.marginfi_value + (summary.kamino_value || 0))}
        description="Marginfi & Kamino"
      />

      <SummaryCard 
        title="Uncollected Fees" 
        value={formatDollar(summary.total_fees)}
        description="Across all positions"
      />
    </div>
  );
}

interface SummaryCardProps {
  title: string;
  value: string;
  description: string;
  trend?: number;
}

function SummaryCard({ title, value, description, trend }: SummaryCardProps) {
  const trendColor = trend ? (trend > 0 ? 'text-green-500' : 'text-red-500') : '';
  const trendPrefix = trend && trend > 0 ? '+' : '';
  
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-gray-500">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <div className="flex items-center mt-1">
          <p className="text-sm text-gray-500">{description}</p>
          {trend !== undefined && (
            <p className={`ml-2 text-sm ${trendColor}`}>
              {trendPrefix}{formatPercent(trend)}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
} 