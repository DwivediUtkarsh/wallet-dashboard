import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatDollar, formatNumber, formatTimeAgo } from "@/lib/utils";
import { TokenBalance } from "@/types/api";

interface TokensTableProps {
  tokens: TokenBalance[];
}

export default function TokensTable({ tokens }: TokensTableProps) {
  // Filter tokens with value greater than $1
  const filteredTokens = tokens?.filter(token => token.value_usd > 1) || [];

  if (!filteredTokens || filteredTokens.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base md:text-lg">Token Balances</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center p-4 md:p-6 text-gray-500 text-sm md:text-base">
            No token balances found with value greater than $1
          </div>
        </CardContent>
      </Card>
    );
  }

  // Sort tokens by value (highest first)
  const sortedTokens = [...filteredTokens].sort((a, b) => b.value_usd - a.value_usd);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base md:text-lg">Token Balances (Value {'>'} $1)</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Mobile layout - stacked cards */}
        <div className="block md:hidden space-y-3">
          {sortedTokens.map((token) => (
            <div key={token.symbol} className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 space-y-3">
              <div className="flex justify-between items-start">
                <div className="flex flex-col">
                  <span className="font-semibold text-sm">{token.symbol}</span>
                  <span className="text-xs text-gray-500">{token.name}</span>
                </div>
                <span className="text-sm font-bold">{formatDollar(token.value_usd)}</span>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-gray-500">Amount:</span>
                  <div className="font-mono">{formatNumber(token.amount)}</div>
                </div>
                <div>
                  <span className="text-gray-500">Price:</span>
                  <div>{formatDollar(token.price_usd)}</div>
                </div>
              </div>
              
              <div className="text-xs text-gray-500">
                Updated: {formatTimeAgo(token.updated_at)}
              </div>
            </div>
          ))}
        </div>

        {/* Desktop layout - table */}
        <div className="hidden md:block">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Token</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead className="text-right">Price</TableHead>
                <TableHead className="text-right">Value</TableHead>
                <TableHead className="text-right">Last Updated</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedTokens.map((token) => (
                <TableRow key={token.symbol}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <span>{token.symbol}</span>
                      <span className="text-xs text-gray-500">{token.name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right font-mono">
                    {formatNumber(token.amount)}
                  </TableCell>
                  <TableCell className="text-right">
                    {formatDollar(token.price_usd)}
                  </TableCell>
                  <TableCell className="text-right font-semibold">
                    {formatDollar(token.value_usd)}
                  </TableCell>
                  <TableCell className="text-right text-gray-500 text-sm">
                    {formatTimeAgo(token.updated_at)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
} 