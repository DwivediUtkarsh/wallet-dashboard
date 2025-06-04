import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDollar, formatPercent } from "@/lib/utils";
import { PortfolioSummaryData } from "@/types/api";

interface PortfolioSummaryAggregateProps {
  data: PortfolioSummaryData;
}

export default function PortfolioSummaryAggregate({ data }: PortfolioSummaryAggregateProps) {
  // Check if we have any value for different chains
  const hasHyperliquid = data.hyperliquid_summary && data.hyperliquid_summary.total_equity > 0;
  const hasEvm = data.evm_summary && data.evm_summary.total_value > 0;
  const hasSui = data.sui_summary && data.sui_summary.total_value > 0;
  
  // Calculate Solana value (excluding other chains)
  const solanaValue = data.summary.token_value + 
                     data.summary.whirlpool_value + 
                     data.summary.raydium_value + 
                     data.summary.marginfi_value + 
                     data.summary.kamino_value;

  // Calculate total fees including Sui if available
  const totalFees = data.summary.total_fees + (data.sui_summary?.total_bluefin_fees || 0);
  
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
        <SummaryCard 
          title="Total Value" 
          value={formatDollar(data.summary.total_value)} 
          description={`${data.wallet_count} Wallets`}
        />

        <SummaryCard 
          title="Solana Value" 
          value={formatDollar(solanaValue)}
          description={`${data.token_balances.length} Tokens`}
        />

        <SummaryCard 
          title="Uncollected Fees" 
          value={formatDollar(totalFees)}
          description={hasSui ? "All protocols" : "LP positions"}
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

        {hasSui && data.sui_summary && (
          <SummaryCard 
            title="Sui Value" 
            value={formatDollar(data.sui_summary.total_value)}
            description={`${data.sui_summary.wallet_count} Wallets`}
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