import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatDollar, formatNumber, formatPercentage } from "@/lib/utils";
import { LendingSummaryData, LendingPosition } from "@/types/api";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Activity, Users, Target } from "lucide-react";

interface LendingTableProps {
  data: LendingSummaryData;
}

function getProtocolBadgeColor(protocol: string): string {
  switch (protocol.toLowerCase()) {
    case 'marginfi':
      return 'bg-purple-100 text-purple-800 border-purple-200';
    case 'suilend':
      return 'bg-blue-100 text-blue-800 border-blue-200';
    default:
      // EVM protocols
      return 'bg-green-100 text-green-800 border-green-200';
  }
}

function getChainBadgeColor(chain: string): string {
  switch (chain.toLowerCase()) {
    case 'solana':
      return 'bg-gradient-to-r from-purple-500 to-pink-500 text-white';
    case 'sui':
      return 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white';
    case 'base':
      return 'bg-gradient-to-r from-blue-600 to-blue-400 text-white';
    case 'arb':
      return 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
}

function PositionsList({ positions }: { positions: LendingPosition[] }) {
  const deposits = positions.filter(p => p.type === 'deposit' || p.type === 'supply');
  const borrows = positions.filter(p => p.type === 'borrow');

  return (
    <div className="space-y-3">
      {deposits.length > 0 && (
        <div>
          <div className="text-xs font-semibold text-green-700 dark:text-green-400 mb-2">
            💰 Supplied/Deposited:
          </div>
          <div className="space-y-2">
            {deposits.map((pos, idx) => (
              <div key={idx} className="text-xs bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 px-3 py-2 rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-green-800 dark:text-green-300 text-sm">{pos.token_symbol}</span>
                  {pos.apr > 0 && (
                    <span className="text-green-600 dark:text-green-400 font-medium text-xs">
                      +{formatPercentage(pos.apr)}% APR
                    </span>
                  )}
                </div>
                <div className="text-gray-600 dark:text-gray-300 mt-1">
                  <span className="font-medium">{formatNumber(pos.amount)}</span>
                  <span className="mx-1">•</span>
                  <span className="font-semibold">{formatDollar(pos.value_usd)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {borrows.length > 0 && (
        <div>
          <div className="text-xs font-semibold text-red-700 dark:text-red-400 mb-2">
            📉 Borrowed:
          </div>
          <div className="space-y-2">
            {borrows.map((pos, idx) => (
              <div key={idx} className="text-xs bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 px-3 py-2 rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-red-800 dark:text-red-300 text-sm">{pos.token_symbol}</span>
                  {pos.apr > 0 && (
                    <span className="text-red-600 dark:text-red-400 font-medium text-xs">
                      -{formatPercentage(pos.apr)}% APR
                    </span>
                  )}
                </div>
                <div className="text-gray-600 dark:text-gray-300 mt-1">
                  <span className="font-medium">{formatNumber(pos.amount)}</span>
                  <span className="mx-1">•</span>
                  <span className="font-semibold">{formatDollar(pos.value_usd)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function LendingTable({ data }: LendingTableProps) {
  if (!data || !data.positions || data.positions.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Lending & Borrowing Positions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center p-6 text-gray-500">
            No lending positions found
          </div>
        </CardContent>
      </Card>
    );
  }

  const { summary, positions } = data;

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-green-100">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-600 font-medium">Total Supplied</p>
                <p className="text-2xl font-bold text-green-700">
                  {formatDollar(summary.total_supplied_value_usd)}
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-red-50 to-red-100">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-red-600 font-medium">Total Borrowed</p>
                <p className="text-2xl font-bold text-red-700">
                  {formatDollar(summary.total_borrowed_value_usd)}
                </p>
              </div>
              <TrendingDown className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-blue-100">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-600 font-medium">Net Value</p>
                <p className="text-2xl font-bold text-blue-700">
                  {formatDollar(summary.net_value_usd)}
                </p>
              </div>
              <Target className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-purple-100">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-purple-600 font-medium">Positions</p>
                <p className="text-2xl font-bold text-purple-700">
                  {summary.position_count}
                </p>
                <p className="text-xs text-purple-500">
                  across {summary.wallet_count} wallets
                </p>
              </div>
              <Users className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Protocol Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Protocol Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
              <div className="flex items-center gap-2 mb-2">
                <Badge className={getProtocolBadgeColor('marginfi')}>Marginfi</Badge>
                <span className="text-sm text-gray-600 dark:text-gray-300">Solana</span>
              </div>
              <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                {formatDollar(summary.protocol_breakdown.marginfi.net_value)}
              </p>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                {summary.protocol_breakdown.marginfi.positions} positions
              </p>
            </div>
            
            <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
              <div className="flex items-center gap-2 mb-2">
                <Badge className={getProtocolBadgeColor('evm')}>EVM Protocols</Badge>
                <span className="text-sm text-gray-600 dark:text-gray-300">Multi-chain</span>
              </div>
              <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                {formatDollar(summary.protocol_breakdown.evm_protocols.net_value)}
              </p>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                {summary.protocol_breakdown.evm_protocols.positions} positions
              </p>
            </div>
            
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <div className="flex items-center gap-2 mb-2">
                <Badge className={getProtocolBadgeColor('suilend')}>Suilend</Badge>
                <span className="text-sm text-gray-600 dark:text-gray-300">Sui</span>
              </div>
              <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                {formatDollar(summary.protocol_breakdown.suilend.net_value)}
              </p>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                {summary.protocol_breakdown.suilend.positions} positions
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Positions Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            All Lending Positions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Wallet & Protocol</TableHead>
                <TableHead>Positions</TableHead>
                <TableHead className="text-right">Supplied</TableHead>
                <TableHead className="text-right">Borrowed</TableHead>
                <TableHead className="text-right">Net Value</TableHead>
                <TableHead className="text-right">Health Ratio/Health Factor</TableHead>
                <TableHead className="text-right">Updated</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {positions.map((account, idx) => (
                <TableRow key={idx}>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="font-medium text-sm">
                        {account.wallet_label || 'Unknown Wallet'}
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={getProtocolBadgeColor(account.protocol)}>
                          {account.protocol}
                        </Badge>
                        <Badge className={getChainBadgeColor(account.chain)}>
                          {account.chain.toUpperCase()}
                        </Badge>
                      </div>
                      <div className="text-xs text-gray-500 font-mono">
                        {account.wallet_address.substring(0, 6)}...{account.wallet_address.substring(account.wallet_address.length - 4)}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <PositionsList positions={account.positions} />
                  </TableCell>
                  <TableCell className="text-right">
                    <span className="text-green-600 font-semibold">
                      {formatDollar(account.total_supplied_value)}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <span className="text-red-600 font-semibold">
                      {formatDollar(account.total_borrowed_value)}
                    </span>
                  </TableCell>
                  <TableCell className="text-right font-semibold">
                    <span className={account.net_value_usd >= 0 ? 'text-green-600' : 'text-red-600'}>
                      {formatDollar(account.net_value_usd)}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    {account.health_ratio > 0 ? (
                      <span className="font-semibold text-foreground">
                        {account.chain.toLowerCase() === 'solana' 
                          ? formatPercentage(account.health_ratio)
                          : formatNumber(account.health_ratio)
                        }
                      </span>
                    ) : (
                      <span className="text-gray-400">N/A</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right text-xs text-gray-500">
                    {new Date(account.updated_at).toLocaleString()}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
} 