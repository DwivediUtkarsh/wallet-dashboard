import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDollar, formatPercent } from "@/lib/utils";
import { PortfolioSummary } from "@/types/api";

interface PortfolioSummaryProps {
  summary: PortfolioSummary;
  walletCount?: number;
  isAggregate?: boolean;
  chain?: 'solana' | 'hyperliquid' | 'evm';
}

export default function PortfolioSummaryComponent({ 
  summary, 
  walletCount,
  isAggregate = false,
  chain 
}: PortfolioSummaryProps) {
  // Check if we have any Hyperliquid value
  const hasHyperliquid = summary.hyperliquid_value > 0 || (summary.hyperliquid_staking_value && summary.hyperliquid_staking_value > 0);
  // Check if we have any EVM value
  const hasEvm = summary.evm_value && summary.evm_value > 0;
  // Safety check for missing fields
  const hyperliquidPnl = summary.hyperliquid_pnl || 0;
  // Calculate LP position value (Whirlpool + Raydium)
  const lpPositionValue = (summary.whirlpool_value || 0) + (summary.raydium_value || 0);
  // Calculate total Hyperliquid value (account + staking)
  const totalHyperliquidValue = (summary.hyperliquid_value || 0) + (summary.hyperliquid_staking_value || 0);
  
  // Calculate lending value
  const lendingValue = summary.marginfi_value + summary.kamino_value;
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Total Value - always shown */}
      <SummaryCard 
        title="Total Value" 
        value={formatDollar(summary.total_value)} 
        description={isAggregate && walletCount ? `${walletCount} Wallets` : "Portfolio Value"}
      />

      {/* Token Value - always shown */}
      <SummaryCard 
        title="Token Value" 
        value={formatDollar(summary.token_value)} 
        description="Combined Token Balances"
      />

      {/* LP Position Value - only for Solana wallets or aggregate view */}
      {(!chain || chain === 'solana' || isAggregate) && (
        <SummaryCard 
          title="LP Position Value" 
          value={formatDollar(lpPositionValue)} 
          description="Whirlpool & Raydium"
        />
      )}

      {/* Hyperliquid Value - only for Hyperliquid wallets or aggregate view */}
      {((!chain && hasHyperliquid) || chain === 'hyperliquid' || (isAggregate && hasHyperliquid)) && (
        <SummaryCard 
          title="Hyperliquid Value" 
          value={formatDollar(totalHyperliquidValue)} 
          description={
            summary.hyperliquid_staking_value > 0 
              ? `Trading: ${formatDollar(summary.hyperliquid_value)} | Staked: ${formatDollar(summary.hyperliquid_staking_value)}`
              : hyperliquidPnl >= 0 ? `PnL: +${formatDollar(hyperliquidPnl)}` : `PnL: ${formatDollar(hyperliquidPnl)}`
          }
          trend={hyperliquidPnl > 0 ? 1 : hyperliquidPnl < 0 ? -1 : 0}
        />
      )}

      {/* EVM Value - only for EVM wallets or aggregate view */}
      {((!chain && hasEvm) || chain === 'evm' || (isAggregate && hasEvm)) && typeof summary.evm_value === 'number' && summary.evm_value > 0 && (
        <SummaryCard 
          title="EVM Value" 
          value={formatDollar(summary.evm_value)} 
          description="EVM Chain Assets"
        />
      )}

      {/* Uncollected Fees - only for Solana wallets or aggregate view */}
      {(!chain || chain === 'solana' || isAggregate) && summary.total_fees > 0 && (
        <SummaryCard 
          title="Uncollected Fees" 
          value={formatDollar(summary.total_fees)} 
          description="From LP Positions"
        />
      )}

      {/* Lending Value - only show if there's a value */}
      {lendingValue > 0 && (
        <SummaryCard 
          title="Lending Value" 
          value={formatDollar(lendingValue)} 
          description="Marginfi & Kamino"
        />
      )}
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