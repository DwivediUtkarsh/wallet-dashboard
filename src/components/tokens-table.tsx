import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatDollar, formatNumber, formatTimeAgo } from "@/lib/utils";
import { TokenBalance } from "@/types/api";

interface TokensTableProps {
  tokens: TokenBalance[];
}

export default function TokensTable({ tokens }: TokensTableProps) {
  if (!tokens || tokens.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Token Balances</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center p-6 text-gray-500">
            No token balances found
          </div>
        </CardContent>
      </Card>
    );
  }

  // Sort tokens by value (highest first)
  const sortedTokens = [...tokens].sort((a, b) => b.value_usd - a.value_usd);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Token Balances</CardTitle>
      </CardHeader>
      <CardContent>
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
      </CardContent>
    </Card>
  );
} 