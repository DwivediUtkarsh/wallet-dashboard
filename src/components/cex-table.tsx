'use client';

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDollarFixed } from "@/lib/utils";
import { CexSummary } from "@/types/api";
import { BuildingLibraryIcon } from "@heroicons/react/24/outline";

interface CexTableProps {
  data: CexSummary;
}

export default function CexTable({ data }: CexTableProps) {
  return (
    <Card className="border-0 shadow-lg bg-gradient-to-r from-card/50 to-card/30 backdrop-blur-sm">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-3 text-xl font-bold">
          <div className="p-2 rounded-lg bg-gradient-to-r from-emerald-500 to-green-500 text-white shadow-lg">
            <BuildingLibraryIcon className="h-5 w-5" />
          </div>
          <span className="bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent">
            CEX Wallets
          </span>
          <Badge variant="secondary" className="ml-auto">
            {data.wallet_count} Wallets
          </Badge>
        </CardTitle>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span>Total Value: {formatDollarFixed(data.total_value)}</span>
          <span>•</span>
          <span>Updated within last 30 minutes</span>
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-lg border bg-background/50 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-muted/30">
                <TableHead className="font-semibold">Wallet Name</TableHead>
                <TableHead className="text-right font-semibold">Net Total Value</TableHead>
                <TableHead className="text-right font-semibold">Last Updated</TableHead>
                <TableHead className="text-right font-semibold">Portfolio %</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.wallets.map((wallet) => {
                const portfolioPercentage = data.total_value > 0 ? (wallet.net_total_value / data.total_value * 100) : 0;
                const lastUpdated = new Date(wallet.last_updated);
                const isRecent = (Date.now() - lastUpdated.getTime()) < 30 * 60 * 1000; // 30 minutes
                
                return (
                  <TableRow
                    key={wallet.wallet_name}
                    className="hover:bg-muted/30 transition-colors"
                  >
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-gradient-to-r from-emerald-500 to-green-500"></div>
                          <span className="font-semibold">{wallet.wallet_name}</span>
                        </div>
                        {isRecent && (
                          <Badge variant="outline" className="text-xs border-green-500/30 text-green-600">
                            Fresh
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      <span className="font-bold text-lg bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent">
                        {formatDollarFixed(wallet.net_total_value)}
                      </span>
                    </TableCell>
                    <TableCell className="text-right text-sm text-muted-foreground">
                      {lastUpdated.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <div className="w-20 h-2 bg-muted rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-emerald-500 to-green-500 transition-all duration-300"
                            style={{ width: `${Math.min(portfolioPercentage, 100)}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium min-w-[3rem]">
                          {portfolioPercentage.toFixed(1)}%
                        </span>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
        
        {data.wallets.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <BuildingLibraryIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium">No CEX data available</p>
            <p className="text-sm">CEX wallet balances will appear here when updated</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
} 