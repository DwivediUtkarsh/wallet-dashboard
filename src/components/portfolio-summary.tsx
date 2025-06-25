import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDollar } from "@/lib/utils";
import { PortfolioSummary } from "@/types/api";
import {
  BanknotesIcon,
  CurrencyDollarIcon,
  ChartBarIcon,
  BoltIcon,
  CubeTransparentIcon,
  SparklesIcon,
  ArrowPathIcon,
  FireIcon,
} from "@heroicons/react/24/outline";
import type { ElementType } from "react";

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
  const hasHyperliquid = summary.hyperliquid_value > 0 || summary.hyperliquid_staking_value > 0 || summary.hyperliquid_spot_value > 0;
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
        description={
          isAggregate && walletCount ? `${walletCount} Wallets` : "Portfolio Value"
        }
        icon={BanknotesIcon}
        gradientFrom="from-blue-500/20"
        gradientTo="to-purple-500/20"
        span={2}
      />

      {/* Token Value - always shown except for Hyperliquid wallets */}
      {chain !== 'hyperliquid' && (
        <SummaryCard 
          title="Token Value" 
          value={formatDollar(summary.token_value)}
          description="Combined Token Balances"
          icon={CurrencyDollarIcon}
          gradientFrom="from-emerald-400/20"
          gradientTo="to-green-600/20"
        />
      )}

      {/* LP Position Value - only for Solana wallets or aggregate view */}
      {(!chain || chain === 'solana' || isAggregate) && (
        <SummaryCard 
          title="LP Position Value" 
          value={formatDollar(lpPositionValue)} 
          description="Whirlpool & Raydium"
          icon={ChartBarIcon}
          gradientFrom="from-indigo-400/20"
          gradientTo="to-sky-500/20"
        />
      )}

      {/* Perps Value - only for Hyperliquid wallets or aggregate view */}
      {((!chain && hasHyperliquid) || chain === 'hyperliquid' || (isAggregate && hasHyperliquid)) && (
      <SummaryCard 
          title="Perps" 
          value={formatDollar(summary.hyperliquid_value)} 
          description={
            summary.hyperliquid_staking_value > 0 || summary.hyperliquid_spot_value > 0
              ? (() => {
                  const tradingValue = summary.hyperliquid_value - summary.hyperliquid_staking_value - (summary.hyperliquid_spot_value || 0);
                  const parts = [];
                  if (tradingValue > 0) parts.push(`Trading: $${tradingValue.toLocaleString()}`);
                  if (summary.hyperliquid_spot_value > 0) parts.push(`Spot: $${summary.hyperliquid_spot_value.toLocaleString()}`);
                  if (summary.hyperliquid_staking_value > 0) parts.push(`Staked: $${summary.hyperliquid_staking_value.toLocaleString()}`);
                  return parts.join(' | ');
                })()
              : hyperliquidPnl >= 0
              ? `PnL: +$${hyperliquidPnl.toLocaleString()}`
              : `PnL: -$${Math.abs(hyperliquidPnl).toLocaleString()}`
          }
          trend={hyperliquidPnl > 0 ? 1 : hyperliquidPnl < 0 ? -1 : 0}
          icon={BoltIcon}
          gradientFrom="from-orange-400/20"
          gradientTo="to-red-500/20"
        />
      )}

      {/* EVM Value - only for EVM wallets or aggregate view */}
      {((!chain && hasEvm) || chain === 'evm' || (isAggregate && hasEvm)) && typeof summary.evm_value === 'number' && summary.evm_value > 0 && (
      <SummaryCard 
          title="EVM Value" 
          value={formatDollar(summary.evm_value)} 
          description="EVM Chain Assets"
          icon={CubeTransparentIcon}
          gradientFrom="from-blue-500/20"
          gradientTo="to-indigo-600/20"
      />
      )}

      {/* Sui Value - only for Sui wallets or aggregate view */}
      {((!chain && hasSui) || chain === 'sui' || (isAggregate && hasSui)) && (
      <SummaryCard 
          title="Sui Value" 
          value={formatDollar(totalSuiValue)} 
          description={
            chain === "sui" && summary.sui_bluefin_fees && summary.sui_bluefin_fees > 0
              ? `Fees: ${formatDollar(summary.sui_bluefin_fees)}`
              : "Sui Chain Assets"
          }
          icon={SparklesIcon}
          gradientFrom="from-cyan-400/20"
          gradientTo="to-teal-500/20"
      />
      )}

      {/* Lending Value - only for Solana wallets or aggregate view */}
      {(!chain || chain === 'solana' || isAggregate) && (summary.marginfi_value > 0 || summary.kamino_value > 0) && (
        <SummaryCard 
          title="Lending Value" 
          value={formatDollar(summary.marginfi_value + summary.kamino_value)} 
          description="Marginfi & Kamino"
          icon={ArrowPathIcon}
          gradientFrom="from-yellow-300/20"
          gradientTo="to-amber-400/20"
        />
      )}

      {/* Fees - only for chains that have fees and aggregate view */}
      {(!chain || chain === 'solana' || chain === 'sui' || isAggregate) && (summary.total_fees > 0 || (summary.sui_bluefin_fees && summary.sui_bluefin_fees > 0)) && (
        <SummaryCard 
          title="Uncollected Fees" 
          value={formatDollar(summary.total_fees + (summary.sui_bluefin_fees || 0))} 
          description={
            chain === "sui"
              ? "Bluefin Fees"
              : chain === "solana"
              ? "Whirlpool & Raydium"
              : "All Protocols"
          }
          icon={FireIcon}
          gradientFrom="from-rose-400/20"
          gradientTo="to-pink-500/20"
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
  icon: ElementType;
  gradientFrom: string;
  gradientTo: string;
  span?: number; // optional column span on large screens
}

function SummaryCard({
  title,
  value,
  description,
  trend,
  icon: Icon,
  gradientFrom,
  gradientTo,
  span,
}: SummaryCardProps) {
  const colSpanClass = span === 2 ? "lg:col-span-2" : span === 3 ? "lg:col-span-3" : "";
  return (
    <Card
      className={`relative overflow-hidden ${colSpanClass}`}
    >
      {/* subtle gradient backdrop */}
      <div
        className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${gradientFrom} ${gradientTo} opacity-10`}
      />
      <CardHeader className="relative pb-2 flex flex-row items-center justify-between">
        <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
          <Icon className="h-4 w-4" aria-hidden="true" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="relative">
        <div className="text-2xl font-bold mb-1">{value}</div>
        {description && (
          <p
            className={`text-xs ${
              trend === 1
                ? "text-green-600"
                : trend === -1
                ? "text-red-600"
                : "text-gray-500"
            }`}
          >
            {description}
            </p>
          )}
      </CardContent>
    </Card>
  );
} 