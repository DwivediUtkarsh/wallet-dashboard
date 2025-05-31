'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { HyperliquidAccount, HyperliquidPosition } from "@/types/api";
import { formatDollar, formatPercent } from "@/lib/utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "./ui/badge";

interface HyperliquidTableProps {
  account: HyperliquidAccount | null;
  positions: HyperliquidPosition[];
}

export default function HyperliquidTable({ account, positions }: HyperliquidTableProps) {
  // If no account data or positions, show empty state
  if (!account && positions.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Hyperliquid Account</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500">No Hyperliquid data available for this wallet</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {account && (
        <Card>
          <CardHeader>
            <CardTitle>Hyperliquid Account Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-gray-500">Account Value</h3>
                <div className="flex justify-between">
                  <span className="text-sm">Total Equity</span>
                  <span className="font-medium">{formatDollar(account.total_equity)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Perps Equity</span>
                  <span className="font-medium">{formatDollar(account.perps_equity)}</span>
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="text-sm font-medium text-gray-500">PnL</h3>
                <div className="flex justify-between">
                  <span className="text-sm">Unrealized PnL</span>
                  <span className={`font-medium ${account.unrealized_pnl >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatDollar(account.unrealized_pnl)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">24h PnL</span>
                  <span className={`font-medium ${account.pnl_24h >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatDollar(account.pnl_24h)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Total PnL</span>
                  <span className={`font-medium ${account.total_pnl >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatDollar(account.total_pnl)}
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="text-sm font-medium text-gray-500">Metrics</h3>
                <div className="flex justify-between">
                  <span className="text-sm">Funding Paid (24h)</span>
                  <span className="font-medium">{formatDollar(account.funding_paid_24h)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Volume (24h)</span>
                  <span className="font-medium">{formatDollar(account.volume_24h)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">ROI (30d)</span>
                  <span className={`font-medium ${account.roi_30d >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatPercent(account.roi_30d)}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {positions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Hyperliquid Positions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Coin</TableHead>
                    <TableHead>Side</TableHead>
                    <TableHead>Size</TableHead>
                    <TableHead>Value</TableHead>
                    <TableHead>Entry Price</TableHead>
                    <TableHead>Mark Price</TableHead>
                    <TableHead>Liq. Price</TableHead>
                    <TableHead>Leverage</TableHead>
                    <TableHead>PnL</TableHead>
                    <TableHead>PnL %</TableHead>
                    <TableHead>Funding</TableHead>
                    <TableHead>Risk</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {positions.map((position) => (
                    <TableRow key={position.coin}>
                      <TableCell className="font-medium">{position.coin}</TableCell>
                      <TableCell>
                        <Badge variant={position.is_long ? "secondary" : "destructive"}>
                          {position.is_long ? "LONG" : "SHORT"}
                        </Badge>
                      </TableCell>
                      <TableCell>{position.size.toFixed(4)}</TableCell>
                      <TableCell>{formatDollar(position.position_value)}</TableCell>
                      <TableCell>{formatDollar(position.entry_price)}</TableCell>
                      <TableCell>{formatDollar(position.mark_price)}</TableCell>
                      <TableCell>{formatDollar(position.liq_price)}</TableCell>
                      <TableCell>{position.leverage.toFixed(2)}x</TableCell>
                      <TableCell className={position.pnl >= 0 ? "text-green-600" : "text-red-600"}>
                        {formatDollar(position.pnl)}
                      </TableCell>
                      <TableCell className={position.pnl_percent >= 0 ? "text-green-600" : "text-red-600"}>
                        {formatPercent(position.pnl_percent)}
                      </TableCell>
                      <TableCell>{formatDollar(position.funding_usd)}</TableCell>
                      <TableCell>
                        <Badge 
                          variant={
                            position.risk_level === "high" 
                              ? "destructive" 
                              : position.risk_level === "medium" 
                                ? "outline" 
                                : "outline"
                          }
                        >
                          {position.risk_level.toUpperCase()}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}