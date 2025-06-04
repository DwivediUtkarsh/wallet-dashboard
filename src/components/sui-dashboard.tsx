import { SuiPortfolioData, SuiTokenBalance, SuiBluefinPosition, SuiLendPosition } from "@/types/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatDollar, formatNumber } from "@/lib/utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "./ui/badge";
import { format } from "date-fns";

interface SuiDashboardProps {
  data: SuiPortfolioData;
}

export default function SuiDashboard({ data }: SuiDashboardProps) {
  if (!data) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <p className="text-gray-500">No Sui portfolio data available</p>
        </CardContent>
      </Card>
    );
  }

  const { token_balances, bluefin_positions, suilend_positions, summary } = data;

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Token Value</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatDollar(summary.total_token_value)}</div>
            <p className="text-xs text-gray-500">{token_balances.length} tokens</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Bluefin Value</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatDollar(summary.total_bluefin_value)}</div>
            <p className="text-xs text-gray-500">{bluefin_positions.length} positions</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Bluefin Fees</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatDollar(summary.total_bluefin_fees)}</div>
            <p className="text-xs text-gray-500">Uncollected fees</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">SuiLend Value</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatDollar(summary.total_suilend_value)}</div>
            <p className="text-xs text-gray-500">{suilend_positions.length} positions</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabbed Content */}
      <Tabs defaultValue="tokens" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="tokens">
            Tokens ({token_balances.length})
          </TabsTrigger>
          <TabsTrigger value="bluefin">
            Bluefin ({bluefin_positions.length})
          </TabsTrigger>
          <TabsTrigger value="suilend">
            SuiLend ({suilend_positions.length})
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="tokens" className="mt-4">
          <SuiTokensTable tokens={token_balances} />
        </TabsContent>
        
        <TabsContent value="bluefin" className="mt-4">
          <BluefinPositionsTable positions={bluefin_positions} />
        </TabsContent>
        
        <TabsContent value="suilend" className="mt-4">
          <SuiLendPositionsTable positions={suilend_positions} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

interface SuiTokensTableProps {
  tokens: SuiTokenBalance[];
}

function SuiTokensTable({ tokens }: SuiTokensTableProps) {
  if (tokens.length === 0) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <p className="text-gray-500">No token balances found</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Sui Token Balances</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Token</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead className="text-right">Price</TableHead>
              <TableHead className="text-right">Value</TableHead>
              <TableHead className="text-right">Updated</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tokens.map((token, index) => (
              <TableRow key={`${token.coin_type}-${index}`}>
                <TableCell>
                  <div>
                    <div className="font-medium">{token.symbol}</div>
                    <div className="text-sm text-gray-500">{token.name}</div>
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  {formatNumber(token.amount)}
                </TableCell>
                <TableCell className="text-right">
                  {formatDollar(token.price_usd)}
                </TableCell>
                <TableCell className="text-right font-medium">
                  {formatDollar(token.value_usd)}
                </TableCell>
                <TableCell className="text-right text-sm text-gray-500">
                  {format(new Date(token.updated_at), 'MMM dd, HH:mm')}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

interface BluefinPositionsTableProps {
  positions: SuiBluefinPosition[];
}

function BluefinPositionsTable({ positions }: BluefinPositionsTableProps) {
  if (positions.length === 0) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <p className="text-gray-500">No Bluefin positions found</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Bluefin Liquidity Positions</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Pool</TableHead>
              <TableHead className="text-right">Token A Amount</TableHead>
              <TableHead className="text-right">Token B Amount</TableHead>
              <TableHead className="text-right">Position Value</TableHead>
              <TableHead className="text-right">Uncollected Fees</TableHead>
              <TableHead className="text-center">In Range</TableHead>
              <TableHead className="text-right">Updated</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {positions.map((position, index) => (
              <TableRow key={`${position.position_id}-${index}`}>
                <TableCell>
                  <div>
                    <div className="font-medium">{position.pool}</div>
                    <div className="text-sm text-gray-500">
                      {position.token_a} / {position.token_b}
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  {formatNumber(position.amount_a)}
                  <div className="text-sm text-gray-500">{position.token_a}</div>
                </TableCell>
                <TableCell className="text-right">
                  {formatNumber(position.amount_b)}
                  <div className="text-sm text-gray-500">{position.token_b}</div>
                </TableCell>
                <TableCell className="text-right font-medium">
                  {formatDollar(position.usd_value)}
                </TableCell>
                <TableCell className="text-right font-medium">
                  {formatDollar(position.uncollected_fees_usd)}
                </TableCell>
                <TableCell className="text-center">
                  <Badge variant={position.in_range ? "default" : "secondary"}>
                    {position.in_range ? "In Range" : "Out of Range"}
                  </Badge>
                </TableCell>
                <TableCell className="text-right text-sm text-gray-500">
                  {format(new Date(position.updated_at), 'MMM dd, HH:mm')}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

interface SuiLendPositionsTableProps {
  positions: SuiLendPosition[];
}

function SuiLendPositionsTable({ positions }: SuiLendPositionsTableProps) {
  if (positions.length === 0) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <p className="text-gray-500">No SuiLend positions found</p>
        </CardContent>
      </Card>
    );
  }

  // Group positions by type
  const supplies = positions.filter(p => p.type === 'deposit');
  const borrows = positions.filter(p => p.type === 'borrow');

  return (
    <div className="space-y-6">
      {/* Supply Positions */}
      {supplies.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-green-700">Supply Positions ({supplies.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Token</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead className="text-right">USD Value</TableHead>
                  <TableHead className="text-right">APR</TableHead>
                  <TableHead className="text-right">Updated</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {supplies.map((position, index) => (
                  <TableRow key={`supply-${position.symbol}-${index}`}>
                    <TableCell>
                      <div className="font-medium">{position.symbol}</div>
                    </TableCell>
                    <TableCell className="text-right">
                      {formatNumber(position.amount)}
                    </TableCell>
                    <TableCell className="text-right font-medium text-green-700">
                      {formatDollar(position.usd_value)}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatNumber(position.apr, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}%
                    </TableCell>
                    <TableCell className="text-right text-sm text-gray-500">
                      {format(new Date(position.updated_at), 'MMM dd, HH:mm')}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Borrow Positions */}
      {borrows.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-red-700">Borrow Positions ({borrows.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Token</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead className="text-right">USD Value</TableHead>
                  <TableHead className="text-right">APR</TableHead>
                  <TableHead className="text-right">Updated</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {borrows.map((position, index) => (
                  <TableRow key={`borrow-${position.symbol}-${index}`}>
                    <TableCell>
                      <div className="font-medium">{position.symbol}</div>
                    </TableCell>
                    <TableCell className="text-right">
                      {formatNumber(position.amount)}
                    </TableCell>
                    <TableCell className="text-right font-medium text-red-700">
                      {formatDollar(Math.abs(position.usd_value))}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatNumber(position.apr, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}%
                    </TableCell>
                    <TableCell className="text-right text-sm text-gray-500">
                      {format(new Date(position.updated_at), 'MMM dd, HH:mm')}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Net Summary */}
      {(supplies.length > 0 || borrows.length > 0) && (
        <Card>
          <CardHeader>
            <CardTitle>SuiLend Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-sm text-gray-500">Total Supplied</div>
                <div className="text-lg font-medium text-green-700">
                  {formatDollar(supplies.reduce((sum, p) => sum + p.usd_value, 0))}
                </div>
              </div>
              <div className="text-center">
                <div className="text-sm text-gray-500">Total Borrowed</div>
                <div className="text-lg font-medium text-red-700">
                  {formatDollar(Math.abs(borrows.reduce((sum, p) => sum + p.usd_value, 0)))}
                </div>
              </div>
              <div className="text-center">
                <div className="text-sm text-gray-500">Net Value</div>
                <div className="text-lg font-medium">
                  {formatDollar(positions.reduce((sum, p) => sum + p.net_usd, 0))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
} 