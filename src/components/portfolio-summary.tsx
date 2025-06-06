import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDollar } from "@/lib/utils";
import { PortfolioSummary } from "@/types/api";

interface PortfolioSummaryProps {
  summary: PortfolioSummary;
  walletCount?: number;
  isAggregate?: boolean;
  chain?: 'solana' | 'hyperliquid' | 'evm' | 'sui';
}

export default function PortfolioSummaryComponent({ 
  summary, 
  walletCount,
  isAggregate = false,
  chain 
}: PortfolioSummaryProps) {
  // Check if we have any values for different chains
  const hasHyperliquid = summary.hyperliquid_value > 0 || summary.hyperliquid_staking_value > 0;
  const hasEvm = typeof summary.evm_value === 'number' && summary.evm_value > 0;
  const hasSui = (summary.sui_token_value && summary.sui_token_value > 0) ||
                 (summary.sui_bluefin_value && summary.sui_bluefin_value > 0) ||
                 (summary.sui_suilend_value && summary.sui_suilend_value > 0);

  // Calculate values based on chain
  const lpPositionValue = summary.whirlpool_value + summary.raydium_value;
  const hyperliquidPnl = summary.hyperliquid_pnl || 0;
  const totalSuiValue = (summary.sui_token_value || 0) + 
                        (summary.sui_bluefin_value || 0) + 
                        (summary.sui_suilend_value || 0);
  
  
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
          value={formatDollar(summary.hyperliquid_value)} 
          description={
            summary.hyperliquid_staking_value > 0 
              ? `Trading: $${(summary.hyperliquid_value - summary.hyperliquid_staking_value).toLocaleString()} | Staked: $${summary.hyperliquid_staking_value.toLocaleString()}`
              : hyperliquidPnl >= 0 ? `PnL: +$${hyperliquidPnl.toLocaleString()}` : `PnL: -$${Math.abs(hyperliquidPnl).toLocaleString()}`
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

      {/* Sui Value - only for Sui wallets or aggregate view */}
      {((!chain && hasSui) || chain === 'sui' || (isAggregate && hasSui)) && (
      <SummaryCard 
          title="Sui Value" 
          value={formatDollar(totalSuiValue)} 
          description={
            chain === 'sui' && summary.sui_bluefin_fees && summary.sui_bluefin_fees > 0
              ? `Fees: ${formatDollar(summary.sui_bluefin_fees)}`
              : "Sui Chain Assets"
          }
      />
      )}

      {/* Lending Value - only for Solana wallets or aggregate view */}
      {(!chain || chain === 'solana' || isAggregate) && (summary.marginfi_value > 0 || summary.kamino_value > 0) && (
        <SummaryCard 
          title="Lending Value" 
          value={formatDollar(summary.marginfi_value + summary.kamino_value)} 
          description="Marginfi & Kamino"
        />
      )}

      {/* Fees - only for chains that have fees and aggregate view */}
      {(!chain || chain === 'solana' || chain === 'sui' || isAggregate) && (summary.total_fees > 0 || (summary.sui_bluefin_fees && summary.sui_bluefin_fees > 0)) && (
        <SummaryCard 
          title="Uncollected Fees" 
          value={formatDollar(summary.total_fees + (summary.sui_bluefin_fees || 0))} 
          description={
            chain === 'sui' ? "Bluefin Fees" : 
            chain === 'solana' ? "Whirlpool & Raydium" :
            "All Protocols"
          }
        />
      )}
    </div>
  );
}

interface SummaryCardProps {
  title: string;
  value: string;
  description?: string;
  trend?: number; // 1 for positive, -1 for negative, 0 for neutral
}

function SummaryCard({ title, value, description, trend }: SummaryCardProps) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-gray-600">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold mb-1">{value}</div>
        {description && (
          <p className={`text-xs ${
            trend === 1 ? 'text-green-600' : 
            trend === -1 ? 'text-red-600' : 
            'text-gray-500'
          }`}>
            {description}
            </p>
          )}
      </CardContent>
    </Card>
  );
} 