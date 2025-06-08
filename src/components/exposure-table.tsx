import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatDollar, formatNumber, formatPercentage } from "@/lib/utils";
import { TokenExposureData } from "@/types/api";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Info } from "lucide-react";

interface ExposureTableProps {
  exposures: TokenExposureData[];
}

// Map source types to readable labels
const sourceTypeLabels: Record<string, string> = {
  'direct_solana': 'Solana SPL',
  'direct_evm': 'EVM Token',
  'direct_sui': 'Sui Token',
  'lp_position_a': 'LP Token A',
  'lp_position_b': 'LP Token B',
  'marginfi_deposit': 'Marginfi Deposit',
  'marginfi_borrow': 'Marginfi Borrow',
  'kamino_supply': 'Kamino Supply',
  'kamino_borrow': 'Kamino Borrow',
  'evm_liquidity': 'EVM Liquidity',
  'evm_lending_supply': 'EVM Lending Supply',
  'evm_lending_borrow': 'EVM Lending Borrow',
  'evm_staking': 'EVM Staking',
  'sui_bluefin_a': 'Bluefin Token A',
  'sui_bluefin_b': 'Bluefin Token B',
  'sui_lend_deposit': 'SuiLend Deposit',
  'sui_lend_borrow': 'SuiLend Borrow',
  'hyperliquid_staking': 'Hyperliquid Staking'
};

// Get color for different source types
const getSourceTypeColor = (sourceType: string): string => {
  const colorMap: Record<string, string> = {
    'direct_solana': 'bg-purple-100 text-purple-800',
    'direct_evm': 'bg-blue-100 text-blue-800',
    'direct_sui': 'bg-cyan-100 text-cyan-800',
    'lp_position_a': 'bg-green-100 text-green-800',
    'lp_position_b': 'bg-green-100 text-green-800',
    'marginfi_deposit': 'bg-orange-100 text-orange-800',
    'marginfi_borrow': 'bg-red-100 text-red-800',
    'kamino_supply': 'bg-indigo-100 text-indigo-800',
    'kamino_borrow': 'bg-pink-100 text-pink-800',
    'evm_liquidity': 'bg-emerald-100 text-emerald-800',
    'evm_lending_supply': 'bg-amber-100 text-amber-800',
    'evm_lending_borrow': 'bg-rose-100 text-rose-800',
    'evm_staking': 'bg-violet-100 text-violet-800',
    'sui_bluefin_a': 'bg-teal-100 text-teal-800',
    'sui_bluefin_b': 'bg-teal-100 text-teal-800',
    'sui_lend_deposit': 'bg-lime-100 text-lime-800',
    'sui_lend_borrow': 'bg-fuchsia-100 text-fuchsia-800'
  };
  return colorMap[sourceType] || 'bg-gray-100 text-gray-800';
};

export default function ExposureTable({ exposures }: ExposureTableProps) {
  if (!exposures || exposures.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Total Exposure (All Protocols)
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <Info className="h-4 w-4 text-gray-400" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>Shows total token exposure across all wallets, protocols, and positions</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center p-6 text-gray-500">
            No exposure data available
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Total Exposure (All Protocols)
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <Info className="h-4 w-4 text-gray-400" />
              </TooltipTrigger>
              <TooltipContent>
                <p>Shows total token exposure across all wallets, protocols, and positions</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </CardTitle>
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
              <TableHead>Sources</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {exposures.map((exposure) => (
              <TableRow key={exposure.symbol}>
                <TableCell className="font-medium">
                  <div className="flex items-center gap-2">
                    <span>{exposure.symbol}</span>
                    <span className="text-xs text-gray-500">{exposure.name}</span>
                  </div>
                </TableCell>
                <TableCell className="text-right font-mono">
                  {formatNumber(exposure.total_amount)}
                </TableCell>
                <TableCell className="text-right">
                  {formatDollar(exposure.price_usd)}
                </TableCell>
                <TableCell className="text-right font-semibold">
                  {formatDollar(exposure.total_value_usd)}
                </TableCell>
                <TableCell className="text-right">
                  {formatPercentage(exposure.portfolio_percentage)}
                </TableCell>
                <TableCell>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <div className="flex flex-wrap gap-1">
                          {exposure.sources.slice(0, 3).map((source, idx) => (
                            <Badge 
                              key={idx} 
                              variant="outline" 
                              className={`text-xs ${getSourceTypeColor(source.source_type)}`}
                            >
                              {sourceTypeLabels[source.source_type] || source.source_type}
                            </Badge>
                          ))}
                          {exposure.sources.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{exposure.sources.length - 3} more
                            </Badge>
                          )}
                        </div>
                      </TooltipTrigger>
                      <TooltipContent className="max-w-sm">
                        <div className="space-y-2 p-1">
                          <div className="font-semibold text-sm border-b pb-1">
                            {exposure.symbol} Exposure Sources
                          </div>
                          {exposure.sources.map((source, idx) => (
                            <div key={idx} className="text-xs space-y-0.5">
                              <div className="flex justify-between items-center">
                                <span className="font-medium">
                                  {sourceTypeLabels[source.source_type] || source.source_type}
                                </span>
                                <span className="text-gray-500">
                                  {source.wallet_count} wallet{source.wallet_count !== 1 ? 's' : ''}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span>Amount: {formatNumber(source.amount)}</span>
                                <span>Value: {formatDollar(source.value_usd)}</span>
                              </div>
                            </div>
                          ))}
                          <div className="border-t pt-1 mt-2 text-xs text-gray-600">
                            Total: {formatNumber(exposure.total_amount)} tokens = {formatDollar(exposure.total_value_usd)}
                          </div>
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