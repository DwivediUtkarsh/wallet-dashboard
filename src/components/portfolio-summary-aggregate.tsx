import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatPercent, formatDollarFixed } from "@/lib/utils";
import { PortfolioSummaryData, LastFeeCollection } from "@/types/api";
import { useTargetTokenHoldings, useLastFeeCollection } from "@/hooks/use-portfolio";
import { usePPA24h } from "@/hooks/usePPA24h";
import { useJitoSolQuote } from "@/hooks/useJitoSolQuote";
import { 
  ChartBarIcon, 
  WalletIcon, 
  CurrencyDollarIcon, 
  BanknotesIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  ShareIcon,
  BuildingLibraryIcon,
  LinkIcon,
  PresentationChartLineIcon,
  CubeIcon
} from "@heroicons/react/24/outline";
import type { ElementType } from "react";
import Link from "next/link";

interface PortfolioSummaryAggregateProps {
  data: PortfolioSummaryData;
}

interface SummaryCardProps {
  title: string;
  value: string;
  description: string;
  icon: ElementType;
  gradient: string;
  bgGradient: string;
  trend?: number;
  isClickable?: boolean;
  onClick?: () => void;
  span?: number;
  customContent?: React.ReactNode;
}

export default function PortfolioSummaryAggregate({ data }: PortfolioSummaryAggregateProps) {
  // Use the new hook to get target token holdings
  const { data: targetTokens, isLoading: isLoadingTargetTokens } = useTargetTokenHoldings();
  
  // Use the new hook to get last fee collection data
  const { data: lastFeeCollection, isLoading: isLoadingLastFeeCollection } = useLastFeeCollection() as {
    data: LastFeeCollection | undefined;
    isLoading: boolean;
  };

  // Use the new hook to get PPA data
  const { data: ppaData, isLoading: isLoadingPPA } = usePPA24h();

  // Fetch a unit quote (1 JitoSOL) to derive SOL per Jito ratio, then scale by held amount
  const jitoAmount = targetTokens?.jitosol_on_marginfi ?? 0;
  const { data: jitoQuoteUnit } = useJitoSolQuote(1); // always quote for 1 JitoSOL
  const jitoPerSolRatio = jitoQuoteUnit ? Number(jitoQuoteUnit.outAmount) / 1e9 : 0;
  const jitoSolEquivalent = jitoPerSolRatio * jitoAmount;

  // Debug logs – remove or comment out in production
  if (typeof window !== 'undefined') {
    console.debug('[JitoQuote] unit quote', jitoQuoteUnit);
    console.debug('[JitoQuote] ratio', jitoPerSolRatio, 'held', jitoAmount, 'equiv', jitoSolEquivalent);
  }

  // Check if we have any value for different chains
  const hasHyperliquid = data.hyperliquid_summary && (data.summary.hyperliquid_value > 0);
  const hasEvm = data.evm_summary && data.evm_summary.total_value > 0;
  const hasSui = data.sui_summary && data.sui_summary.total_value > 0;
  const hasCex = data.cex_summary && data.cex_summary.total_value > 0;
  
  // Calculate Solana value (excluding other chains)
  const solanaValue = data.summary.token_value + 
                     data.summary.whirlpool_value + 
                     data.summary.raydium_value + 
                     data.summary.marginfi_value + 
                     data.summary.kamino_value;

  // Calculate total fees including Sui if available
  const totalFees = data.summary.total_fees + (data.sui_summary?.total_bluefin_fees || 0);

  // Hardcoded number of shares and calculate value per share
  const numberOfShares = 59755.46;
  const hyperevmValue = 29570.45;
  const totalValueIncludingHyperevm = data.summary.total_value + hyperevmValue;
  const valuePerShare = totalValueIncludingHyperevm / numberOfShares;

  // Function to handle Hyperevm card click
  const handleHyperevmClick = () => {
    window.open('https://app.hyperbeat.org/hyperfolio/0xaA2A9901eC394dd8F69D8BF6ef4aE085246Dfe78', '_blank');
  };

  // Function to open the Google Sheet in a new tab
  const handleSheetClick = () => {
    window.open('https://docs.google.com/spreadsheets/d/1apfrsTan5mZqkuup9Sri6bNOwj_wXkbvtj8B-HV3KJU/edit?gid=564168042#gid=564168042', '_blank');
  };

  // Custom content for Shares Info widget (inverted font sizes)
  const sharesInfoContent = (
    <div className="space-y-2">
      <div className="text-3xl font-bold bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent">
        ${valuePerShare.toFixed(4)}
      </div>
      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground leading-tight">
          {numberOfShares.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} shares
        </p>
      </div>
    </div>
  );

  // Custom content for Token Holdings widget
  const tokenHoldingsContent = isLoadingTargetTokens ? (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        {[1, 2, 3, 4].slice(0, 3).map(i => (
          <div key={i} className="animate-pulse text-center">
            <div className="h-6 bg-muted rounded mb-1"></div>
            <div className="h-3 bg-muted rounded"></div>
          </div>
        ))}
      </div>
      <div className="text-xs text-muted-foreground text-center">Loading...</div>
    </div>
  ) : (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        {/* BTC Row */} 
        <div className="col-span-2 text-center">
          <div className="text-lg font-bold bg-gradient-to-r from-orange-500 to-yellow-500 bg-clip-text text-transparent">
            {targetTokens?.btc_on_base_aave3 ? 
              `${targetTokens.btc_on_base_aave3.toLocaleString('en-US', { 
                minimumFractionDigits: 4, 
                maximumFractionDigits: 4 
              })} BTC` : '0 BTC'}
          </div>
          <div className="text-xs text-muted-foreground">
            ${targetTokens?.btc_value_usd?.toLocaleString('en-US', { 
              minimumFractionDigits: 0, 
              maximumFractionDigits: 0 
            }) || '$0'}
          </div>
          <div className="text-xs text-muted-foreground opacity-75">BASE AAVE3</div>
        </div>
        
        {/* JitoSOL and HYPE Row */}
        <div className="text-center">
          <div className="text-lg font-bold bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">
            ≈ {jitoSolEquivalent.toLocaleString('en-US', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })} SOL
          </div>
          <div className="text-xs text-muted-foreground">
            {targetTokens?.jitosol_on_marginfi ? 
              `${targetTokens.jitosol_on_marginfi.toLocaleString('en-US', { 
                minimumFractionDigits: 2, 
                maximumFractionDigits: 2 
              })} JitoSOL` : '0 JitoSOL'}
          </div>
          <div className="text-xs text-muted-foreground">
            ${targetTokens?.jitosol_value_usd?.toLocaleString('en-US', { 
              minimumFractionDigits: 0, 
              maximumFractionDigits: 0 
            }) || '$0'}
          </div>
          <div className="text-xs text-muted-foreground opacity-75">Marginfi</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-bold bg-gradient-to-r from-blue-500 to-cyan-500 bg-clip-text text-transparent">
            {(targetTokens?.hype_total || 0) > 0 ? 
              `${(targetTokens?.hype_total || 0).toLocaleString('en-US', { 
                minimumFractionDigits: 0, 
                maximumFractionDigits: 0 
              })} HYPE` : '0 HYPE'}
          </div>
          <div className="text-xs text-muted-foreground">
            ${targetTokens?.hype_value_usd?.toLocaleString('en-US', { 
              minimumFractionDigits: 0, 
              maximumFractionDigits: 0 
            }) || '$0'}
          </div>
          <div className="text-xs text-muted-foreground opacity-75">Staked + Spot</div>
        </div>
      </div>
      <div className="text-xs text-muted-foreground text-center">
        Target holdings tracked
      </div>
    </div>
  );

  // Custom content for Uncollected Fees widget
  const uncollectedFeesContent = isLoadingLastFeeCollection ? (
    <div className="space-y-2">
      <div className="animate-pulse">
        <div className="h-8 bg-muted rounded mb-2"></div>
        <div className="h-4 bg-muted rounded mb-1"></div>
        <div className="h-3 bg-muted rounded"></div>
      </div>
    </div>
  ) : (
    <div className="space-y-2">
      <div className="text-2xl font-bold bg-gradient-to-r from-green-500 to-emerald-500 bg-clip-text text-transparent">
        {formatDollarFixed(totalFees)}
      </div>
      <div className="space-y-1">
        <p className="text-sm text-muted-foreground leading-tight">Pending fee rewards</p>
        {lastFeeCollection?.last_collection_time && (
          <div className="text-xs text-muted-foreground">
            <span className="opacity-75">Last collected: </span>
            <span className="font-medium">
              {new Date(lastFeeCollection.last_collection_time).toLocaleString('en-US', {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                hour12: true,
                timeZoneName: 'short'
              })}
            </span>
          </div>
        )}
      </div>
    </div>
  );

  // Custom content for PPA widget
  const ppaContent = isLoadingPPA || !ppaData ? (
    <div className="space-y-3 animate-pulse">
      <div className="h-6 bg-muted rounded" />
      <div className="h-6 bg-muted rounded" />
      <div className="h-6 bg-muted rounded" />
    </div>
  ) : (
    <div className="grid grid-cols-2 gap-3 text-sm">
      <div>
        <p className="text-muted-foreground text-xs">APR</p>
        <p className="font-medium">{ppaData.apr}</p>
      </div>
      <div>
        <p className="text-muted-foreground text-xs">Total PnL</p>
        <p className={`font-medium ${ppaData.totalPnl.startsWith('-') ? 'text-red-500' : 'text-green-500'}`}>{ppaData.totalPnl}</p>
      </div>
      <div>
        <p className="text-muted-foreground text-xs">Funds Deployed</p>
        <p className="font-medium">{ppaData.fundsDeployed}</p>
      </div>
      <div>
        <p className="text-muted-foreground text-xs">24h PnL</p>
        <p className={`font-medium ${ppaData.pnl24h.startsWith('-') ? 'text-red-500' : 'text-green-500'}`}>{ppaData.pnl24h}</p>
      </div>
      <div className="col-span-2 text-center text-xs text-muted-foreground">Tap to access detailed sheet</div>
    </div>
  );

  // First line cards: Total Value, Token Holdings, PPA, Uncollected Fees
  const firstLineCards: SummaryCardProps[] = [
    {
      title: "Total Value",
      value: formatDollarFixed(totalValueIncludingHyperevm),
      description: "Complete portfolio value",
      icon: WalletIcon,
      gradient: "from-blue-500 to-cyan-500",
      bgGradient: "from-blue-500/10 to-cyan-500/10",
    },
    {
      title: "Token Holdings",
      value: "", // Will use custom content
      description: "",
      icon: CubeIcon,
      gradient: "from-indigo-500 to-purple-500",
      bgGradient: "from-indigo-500/10 to-purple-500/10",
      customContent: tokenHoldingsContent
    },
    {
      title: "24 hrs PPA",
      value: "", // custom
      description: "Tap to access detailed sheet",
      icon: ChartBarIcon,
      gradient: "from-sky-500 to-blue-500",
      bgGradient: "from-sky-500/10 to-blue-500/10",
      customContent: ppaContent,
      isClickable: true,
      onClick: handleSheetClick,
    },
    {
      title: "Uncollected Fees",
      value: "", // Will use custom content
      description: "",
      icon: BanknotesIcon,
      gradient: "from-green-500 to-emerald-500",
      bgGradient: "from-green-500/10 to-emerald-500/10",
      customContent: uncollectedFeesContent
    }
  ];

  // Second line cards: Solana Value and conditional cards
  const secondLineCards: SummaryCardProps[] = [
    {
      title: "Solana Value",
      value: formatDollarFixed(solanaValue),
      description: "Solana ecosystem value",
      icon: ChartBarIcon,
      gradient: "from-purple-500 to-pink-500",
      bgGradient: "from-purple-500/10 to-pink-500/10"
    }
  ];

  // Add conditional cards to second line
  if (hasHyperliquid) {
    secondLineCards.push({
      title: "Hyperliquid Value",
      value: formatDollarFixed(data.summary.hyperliquid_value),
      description: (() => {
        const parts = [`${data.hyperliquid_summary.account_count} Accounts`];
        if (data.summary.hyperliquid_spot_value > 0) {
          parts.push(`$${data.summary.hyperliquid_spot_value.toLocaleString()} Spot`);
        }
        if (data.summary.hyperliquid_staking_value > 0) {
          parts.push(`$${data.summary.hyperliquid_staking_value.toLocaleString()} Staked`);
        }
        return parts.join(' • ');
      })(),
      icon: ArrowTrendingUpIcon,
      gradient: "from-orange-500 to-red-500",
      bgGradient: "from-orange-500/10 to-red-500/10",
      trend: data.hyperliquid_summary.total_pnl && data.summary.hyperliquid_value > 0 ? data.hyperliquid_summary.total_pnl / data.summary.hyperliquid_value * 100 : 0
    });
  }

  if (hasEvm && data.evm_summary) {
    secondLineCards.push({
      title: "EVM Value",
      value: formatDollarFixed(data.evm_summary.total_value),
      description: "Multi-chain EVM assets",
      icon: CurrencyDollarIcon,
      gradient: "from-indigo-500 to-blue-500",
      bgGradient: "from-indigo-500/10 to-blue-500/10"
    });
  }

  if (hasSui && data.sui_summary) {
    secondLineCards.push({
      title: "Sui Value",
      value: formatDollarFixed(data.sui_summary.total_value),
      description: "Sui ecosystem positions",
      icon: ArrowTrendingUpIcon,
      gradient: "from-teal-500 to-cyan-500",
      bgGradient: "from-teal-500/10 to-cyan-500/10"
    });
  }

  if (hasCex) {
    secondLineCards.push({
      title: "CEX Value",
      value: formatDollarFixed(data.summary.cex_value),
      description: `${data.cex_summary.wallet_count} Wallets`,
      icon: BuildingLibraryIcon,
      gradient: "from-emerald-500 to-green-500",
      bgGradient: "from-emerald-500/10 to-green-500/10"
    });
  }

  // Always add Hyperevm card
  secondLineCards.push({
    title: "Hyperevm Defi",
    value: formatDollarFixed(hyperevmValue),
    description: "Tap card to access portfolio",
    icon: LinkIcon,
    gradient: "from-violet-500 to-purple-500",
    bgGradient: "from-violet-500/10 to-purple-500/10",
    isClickable: true,
    onClick: handleHyperevmClick
  });

  // After Hyperevm card push, add Shares Info card moved
  secondLineCards.push({
    title: "Shares Info",
    value: "", // use existing custom sharesInfoContent
    description: "",
    icon: ShareIcon,
    gradient: "from-amber-500 to-orange-500",
    bgGradient: "from-amber-500/10 to-orange-500/10",
    customContent: sharesInfoContent
  });
  
  return (
    <div className="space-y-6">
      {/* Analytics Button */}
      <div className="flex justify-center">
        <Link href="/analytics">
          <Button 
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 px-8 py-3"
            size="lg"
          >
            <PresentationChartLineIcon className="h-5 w-5 mr-2" />
            Open Analytics Dashboard
          </Button>
        </Link>
      </div>

      {/* First line: Total Value, Token Holdings, PPA, Uncollected Fees */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {firstLineCards.map((card, index) => (
          <div
            key={card.title}
            className={`animate-in fade-in zoom-in duration-500 ${card.span === 2 ? 'md:col-span-2' : ''}`}
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <SummaryCard {...card} />
          </div>
        ))}
      </div>

      {/* Second line: Solana Value and conditional cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {secondLineCards.map((card, index) => (
          <div
            key={card.title}
            className="animate-in fade-in zoom-in duration-500"
            style={{ animationDelay: `${(index + 4) * 100}ms` }}
          >
            <SummaryCard {...card} />
          </div>
        ))}
      </div>
    </div>
  );
}

function SummaryCard({ title, value, description, icon: Icon, gradient, bgGradient, trend, isClickable, onClick, span, customContent }: SummaryCardProps) {
  const colSpanClass = span === 2 ? "lg:col-span-2" : span === 3 ? "lg:col-span-3" : "";
  const trendColor = trend ? (trend > 0 ? 'text-green-500' : 'text-red-500') : '';
  const trendPrefix = trend && trend > 0 ? '+' : '';
  const TrendIcon = trend ? (trend > 0 ? ArrowTrendingUpIcon : ArrowTrendingDownIcon) : null;
  
  const cardClasses = `group relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 h-full min-h-[140px] flex flex-col ${
    isClickable ? 'cursor-pointer hover:scale-105' : ''
  } ${colSpanClass}`;
  
  const cardContent = (
    <>
      {/* Background gradient */}
      <div className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${bgGradient} opacity-10 group-hover:opacity-20 transition-opacity duration-300`} />
      
      {/* Content */}
      <div className="relative flex flex-col h-full">
      <CardHeader className="pb-2 flex-shrink-0">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
            <div className={`p-2 rounded-lg bg-gradient-to-r ${gradient} text-white shadow-lg flex-shrink-0`}>
              <Icon className="h-4 w-4" />
            </div>
          </div>
      </CardHeader>
        <CardContent className="space-y-2 flex-grow flex flex-col justify-center">
          {customContent ? (
            customContent
          ) : (
            <>
              <div className={`text-2xl font-bold bg-gradient-to-r ${gradient} bg-clip-text text-transparent`}>
                {value}
              </div>
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground leading-tight">{description}</p>
                {trend !== undefined && TrendIcon && (
                  <div className={`flex items-center gap-1 ${trendColor}`}>
                    <TrendIcon className="h-3 w-3" />
                    <span className="text-xs font-medium">
                      {trendPrefix}{formatPercent(Math.abs(trend))}
                    </span>
                  </div>
                )}
              </div>
            </>
          )}
        </CardContent>
      </div>
    </>
  );
  
  if (isClickable) {
    return (
      <Card className={cardClasses} onClick={onClick}>
        {cardContent}
      </Card>
    );
  }
  
  return (
    <Card className={cardClasses}>
      {cardContent}
    </Card>
  );
} 