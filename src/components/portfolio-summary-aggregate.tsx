import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatPercent, formatDollarFixed } from "@/lib/utils";
import { PortfolioSummaryData } from "@/types/api";
import { 
  ChartBarIcon, 
  WalletIcon, 
  CurrencyDollarIcon, 
  BanknotesIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  ShareIcon,
  BuildingLibraryIcon,
  LinkIcon
} from "@heroicons/react/24/outline";

interface PortfolioSummaryAggregateProps {
  data: PortfolioSummaryData;
}

interface SummaryCardProps {
  title: string;
  value: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  gradient: string;
  bgGradient: string;
  trend?: number;
  isClickable?: boolean;
  onClick?: () => void;
}

export default function PortfolioSummaryAggregate({ data }: PortfolioSummaryAggregateProps) {
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
  const numberOfShares = 57888.67;
  const valuePerShare = data.summary.total_value / numberOfShares;

  // Function to handle Hyperevm card click
  const handleHyperevmClick = () => {
    window.open('https://app.hyperbeat.org/hyperfolio/0xaA2A9901eC394dd8F69D8BF6ef4aE085246Dfe78', '_blank');
  };

  // First line cards: Total Value, Shares Info, Uncollected Fees
  const firstLineCards: SummaryCardProps[] = [
    {
      title: "Total Value",
      value: formatDollarFixed(data.summary.total_value),
      description: `${data.wallet_count} Wallets`,
      icon: WalletIcon,
      gradient: "from-blue-500 to-cyan-500",
      bgGradient: "from-blue-500/10 to-cyan-500/10"
    },
    {
      title: "Shares Info",
      value: numberOfShares.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
      description: `$${valuePerShare.toFixed(4)} per share`,
      icon: ShareIcon,
      gradient: "from-amber-500 to-orange-500",
      bgGradient: "from-amber-500/10 to-orange-500/10"
    },
    {
      title: "Uncollected Fees",
      value: formatDollarFixed(totalFees),
      description: hasSui ? "All protocols" : "LP positions",
      icon: BanknotesIcon,
      gradient: "from-green-500 to-emerald-500",
      bgGradient: "from-green-500/10 to-emerald-500/10"
    }
  ];

  // Second line cards: Solana Value and conditional cards
  const secondLineCards: SummaryCardProps[] = [
    {
      title: "Solana Value",
      value: formatDollarFixed(solanaValue),
      description: `${data.token_balances.length} Tokens`,
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
      description: `${data.hyperliquid_summary.account_count} Accounts${data.summary.hyperliquid_staking_value > 0 ? ` • $${data.summary.hyperliquid_staking_value.toLocaleString()} Staked` : ''}`,
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
      description: `${data.evm_summary.chain_count} Chains`,
      icon: CurrencyDollarIcon,
      gradient: "from-indigo-500 to-blue-500",
      bgGradient: "from-indigo-500/10 to-blue-500/10"
    });
  }

  if (hasSui && data.sui_summary) {
    secondLineCards.push({
      title: "Sui Value",
      value: formatDollarFixed(data.sui_summary.total_value),
      description: `${data.sui_summary.wallet_count} Wallets`,
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
    title: "Hyperevm",
    value: formatDollarFixed(51719.40),
    description: "Tap card to access portfolio",
    icon: LinkIcon,
    gradient: "from-violet-500 to-purple-500",
    bgGradient: "from-violet-500/10 to-purple-500/10",
    isClickable: true,
    onClick: handleHyperevmClick
  });
  
  return (
    <div className="space-y-6">
      {/* First line: Total Value, Shares Info, Uncollected Fees */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {firstLineCards.map((card, index) => (
          <div
            key={card.title}
            className="animate-in fade-in zoom-in duration-500"
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
            style={{ animationDelay: `${(index + 3) * 100}ms` }}
          >
            <SummaryCard {...card} />
          </div>
        ))}
      </div>
    </div>
  );
}

function SummaryCard({ title, value, description, icon: Icon, gradient, bgGradient, trend, isClickable, onClick }: SummaryCardProps) {
  const trendColor = trend ? (trend > 0 ? 'text-green-500' : 'text-red-500') : '';
  const trendPrefix = trend && trend > 0 ? '+' : '';
  const TrendIcon = trend ? (trend > 0 ? ArrowTrendingUpIcon : ArrowTrendingDownIcon) : null;
  
  const cardClasses = `group relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 ${
    isClickable ? 'cursor-pointer hover:scale-105' : ''
  }`;
  
  const cardContent = (
    <>
      {/* Background gradient */}
      <div className={`absolute inset-0 bg-gradient-to-br ${bgGradient} opacity-50 group-hover:opacity-70 transition-opacity duration-300`} />
      
      {/* Content */}
      <div className="relative">
      <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
            <div className={`p-2 rounded-lg bg-gradient-to-r ${gradient} text-white shadow-lg`}>
              <Icon className="h-4 w-4" />
            </div>
          </div>
      </CardHeader>
        <CardContent className="space-y-2">
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