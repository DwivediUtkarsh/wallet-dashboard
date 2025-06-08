import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatDollar, formatNumber, formatPercentage } from "@/lib/utils";
import { TopTokenData } from "@/types/api";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface TopTokensTableProps {
  tokens: TopTokenData[];
  totalPortfolioValue: number;
}

export default function TopTokensTable({ tokens, totalPortfolioValue }: TopTokensTableProps) {
  if (!tokens || tokens.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Top Tokens (All Wallets)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center p-6 text-gray-500">
            No token data available
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Top Tokens (All Wallets)</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Token</TableHead>
              <TableHead className="text-right">Total Amount</TableHead>
              <TableHead className="text-right">Price</TableHead>
              <TableHead className="text-right">Total Value</TableHead>
              <TableHead className="text-right">% of Portfolio</TableHead>
              <TableHead>Wallets</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tokens.map((token) => (
              <TableRow key={token.symbol}>
                <TableCell className="font-medium">
                  <div className="flex items-center gap-2">
                    <span>{token.symbol}</span>
                    <span className="text-xs text-gray-500">{token.name}</span>
                  </div>
                </TableCell>
                <TableCell className="text-right font-mono">
                  {formatNumber(token.total_amount)}
                </TableCell>
                <TableCell className="text-right">
                  {formatDollar(token.price_usd)}
                </TableCell>
                <TableCell className="text-right font-semibold">
                  {formatDollar(token.total_value_usd)}
                </TableCell>
                <TableCell className="text-right">
                  {formatPercentage(token.total_value_usd / totalPortfolioValue * 100)}
                </TableCell>
                <TableCell>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <div className="flex flex-wrap gap-1">
                          {token.wallets.slice(0, 3).map((wallet, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs">
                              {wallet.label || wallet.address.substring(0, 6)}
                            </Badge>
                          ))}
                          {token.wallets.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{token.wallets.length - 3} more
                            </Badge>
                          )}
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <div className="space-y-1 p-1">
                          {token.wallets.map((wallet, idx) => (
                            <div key={idx} className="text-xs">
                              {wallet.label || wallet.address.substring(0, 12)}...{wallet.address.substring(wallet.address.length - 6)}: {formatDollar(wallet.value_usd)}
                            </div>
                          ))}
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
} 