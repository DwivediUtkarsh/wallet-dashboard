import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDollar, formatPercent } from "@/lib/utils";
import { PortfolioSummaryData } from "@/types/api";

interface PortfolioSummaryAggregateProps {
  data: PortfolioSummaryData;
}

export default function PortfolioSummaryAggregate({ data }: PortfolioSummaryAggregateProps) {
  // Check if we have any Hyperliquid value
  const hasHyperliquid = data.hyperliquid_summary && data.hyperliquid_summary.total_equity > 0;
  // Check if we have any EVM value
  const hasEvm = data.evm_summary && data.evm_summary.total_value > 0;
  
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <SummaryCard 
          title="Total Value" 
          value={formatDollar(data.summary.total_value)} 
          description={`${data.wallet_count} Wallets`}
        />

        <SummaryCard 
          title="Solana Value" 
          value={formatDollar(
            data.summary.token_value + 
            data.summary.whirlpool_value + 
            data.summary.raydium_value + 
            data.summary.marginfi_value + 
            data.summary.kamino_value
          )}
          description={`${data.token_balances.length} Tokens`}
        />

        <SummaryCard 
          title="Uncollected Fees" 
          value={formatDollar(data.summary.total_fees)}
          description="Across all positions"
        />

        {hasHyperliquid && (
          <SummaryCard 
            title="Hyperliquid Value" 
            value={formatDollar(data.hyperliquid_summary.total_equity)}
            description={`${data.hyperliquid_summary.account_count} Accounts`}
            trend={data.hyperliquid_summary.total_pnl / data.hyperliquid_summary.total_equity * 100}
          />
        )}

        {hasEvm && data.evm_summary && (
          <SummaryCard 
            title="EVM Value" 
            value={formatDollar(data.evm_summary.total_value)}
            description={`${data.evm_summary.chain_count} Chains`}
          />
        )}
      </div>
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