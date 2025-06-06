import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatDollar, formatNumber, formatPercentage } from "@/lib/utils";
import { TopTokenData } from "@/types/api";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { 
  CurrencyDollarIcon, 
  ChartBarIcon,
  WalletIcon,
  PlusCircleIcon
} from "@heroicons/react/24/outline";

interface TopTokensTableProps {
  tokens: TopTokenData[];
  totalPortfolioValue: number;
}

export default function TopTokensTable({ tokens, totalPortfolioValue }: TopTokensTableProps) {
  if (!tokens || tokens.length === 0) {
    return (
      <Card className="border-0 shadow-lg bg-card/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl">
            <div className="p-2 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg text-white">
              <ChartBarIcon className="h-5 w-5" />
            </div>
            Top Tokens (All Wallets)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12">
            <ChartBarIcon className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-lg font-medium text-muted-foreground">No token data available</p>
            <p className="text-sm text-muted-foreground">Token data will appear here once available</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-0 shadow-lg bg-card/50 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-2xl">
          <div className="p-2 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg text-white">
            <ChartBarIcon className="h-5 w-5" />
          </div>
          Top Tokens (All Wallets)
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-hidden rounded-lg border border-border/50 bg-background/30 backdrop-blur-sm">
          <Table>
            <TableHeader>
              <TableRow className="border-border/50 bg-muted/30">
                <TableHead className="font-semibold">Token</TableHead>
                <TableHead className="text-right font-semibold">Total Amount</TableHead>
                <TableHead className="text-right font-semibold">Price</TableHead>
                <TableHead className="text-right font-semibold">Total Value</TableHead>
                <TableHead className="text-right font-semibold">% of Portfolio</TableHead>
                <TableHead className="font-semibold">Wallets</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tokens.map((token, index) => {
                const percentage = (token.total_value_usd / totalPortfolioValue * 100);
                const getPercentageColor = (pct: number) => {
                  if (pct >= 20) return 'from-red-500 to-orange-500';
                  if (pct >= 10) return 'from-orange-500 to-yellow-500';
                  if (pct >= 5) return 'from-yellow-500 to-green-500';
                  return 'from-green-500 to-blue-500';
                };
                
                return (
                  <TableRow
                    key={token.symbol}
                    className="border-border/50 hover:bg-muted/30 transition-colors animate-in fade-in slide-in-from-left-2 duration-500"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-md text-white text-xs font-bold">
                          {token.symbol.charAt(0)}
                        </div>
                        <div>
                          <div className="font-semibold">{token.symbol}</div>
                          <div className="text-xs text-muted-foreground">{token.name}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-mono text-sm">
                      {formatNumber(token.total_amount)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <CurrencyDollarIcon className="h-3 w-3 text-muted-foreground" />
                        <span className="font-medium">{formatDollar(token.price_usd)}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className={`font-bold text-lg bg-gradient-to-r ${getPercentageColor(percentage)} bg-clip-text text-transparent`}>
                        {formatDollar(token.total_value_usd)}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="space-y-1">
                        <div className={`font-semibold bg-gradient-to-r ${getPercentageColor(percentage)} bg-clip-text text-transparent`}>
                          {formatPercentage(percentage)}
                        </div>
                        <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden ml-auto">
                          <div 
                            className={`h-full bg-gradient-to-r ${getPercentageColor(percentage)} transition-all duration-500`}
                            style={{ width: `${Math.min(percentage * 2, 100)}%` }}
                          />
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger>
                            <div className="flex flex-wrap gap-1.5">
                              {token.wallets.slice(0, 3).map((wallet, idx) => (
                                <Badge 
                                  key={idx} 
                                  variant="outline" 
                                  className="text-xs bg-background/50 backdrop-blur-sm hover:bg-background/80 transition-colors"
                                >
                                  <WalletIcon className="h-3 w-3 mr-1" />
                                  {wallet.label || wallet.address.substring(0, 6)}
                                </Badge>
                              ))}
                              {token.wallets.length > 3 && (
                                <Badge 
                                  variant="outline" 
                                  className="text-xs bg-gradient-to-r from-blue-500/10 to-purple-500/10 border-blue-500/20"
                                >
                                  <PlusCircleIcon className="h-3 w-3 mr-1" />
                                  +{token.wallets.length - 3}
                                </Badge>
                              )}
                            </div>
                          </TooltipTrigger>
                          <TooltipContent className="max-w-xs">
                            <div className="space-y-2 p-1">
                              <div className="font-semibold text-xs border-b border-border pb-1">
                                {token.symbol} Holdings
                              </div>
                              {token.wallets.map((wallet, idx) => (
                                <div key={idx} className="flex items-center justify-between gap-2 text-xs">
                                  <div className="flex items-center gap-1">
                                    <WalletIcon className="h-3 w-3" />
                                    <span className="font-mono">
                                      {wallet.label || `${wallet.address.substring(0, 8)}...${wallet.address.substring(wallet.address.length - 4)}`}
                                    </span>
                                  </div>
                                  <span className="font-semibold text-green-500">
                                    {formatDollar(wallet.value_usd)}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
} 