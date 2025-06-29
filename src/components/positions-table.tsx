import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatDollar, formatNumber, formatTimeAgo } from "@/lib/utils";
import { LPPosition } from "@/types/api";

interface PositionsTableProps {
  positions: LPPosition[];
  title: string;
  emptyMessage: string;
}

export default function PositionsTable({ positions, title, emptyMessage }: PositionsTableProps) {
  if (!positions || positions.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base md:text-lg">{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center p-4 md:p-6 text-gray-500 text-sm md:text-base">
            {emptyMessage}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Sort positions by value (highest first)
  const sortedPositions = [...positions].sort((a, b) => b.total_value_usd - a.total_value_usd);
  
  // Calculate total uncollected fees for percentage calculation
  const totalUncollectedFees = sortedPositions.reduce((sum, position) => sum + position.uncollected_fees_usd, 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base md:text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Mobile layout - stacked cards */}
        <div className="block md:hidden space-y-4">
          {sortedPositions.map((position, index) => (
            <div key={index} className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 space-y-3">
              <div className="flex justify-between items-start">
                <div className="flex flex-col">
                  <span className="font-semibold text-sm">{position.pool}</span>
                  <span className={`inline-block px-2 py-1 rounded-full text-xs mt-1 ${position.in_range ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' : 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300'}`}>
                    {position.in_range ? 'In Range' : 'Out of Range'}
                  </span>
                </div>
                <span className="text-sm font-bold">{formatDollar(position.total_value_usd)}</span>
              </div>
              
              <div className="space-y-2">
                <div className="text-xs text-gray-500">Token Amounts:</div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-white dark:bg-gray-700 rounded p-2">
                    <div className="text-xs text-gray-500">{position.token_a_symbol}</div>
                    <div className="font-mono text-xs">{formatNumber(position.token_a_qty)}</div>
                  </div>
                  <div className="bg-white dark:bg-gray-700 rounded p-2">
                    <div className="text-xs text-gray-500">{position.token_b_symbol}</div>
                    <div className="font-mono text-xs">{formatNumber(position.token_b_qty)}</div>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-between items-center text-xs">
                <div>
                  <span className="text-gray-500">Uncollected Fees:</span>
                  <div className="font-semibold">{formatDollar(position.uncollected_fees_usd)}</div>
                  <div className="text-xs text-gray-400">
                    {totalUncollectedFees > 0 ? `${((position.uncollected_fees_usd / totalUncollectedFees) * 100).toFixed(1)}% of total` : '0% of total'}
                  </div>
                </div>
                <div>
                  <div className="text-gray-500">Fee/Value Ratio:</div>
                  <div className="font-semibold">
                    {position.total_value_usd > 0 ? `${((position.uncollected_fees_usd / position.total_value_usd) * 100).toFixed(2)}%` : '0%'}
                  </div>
                </div>
                <div className="text-gray-500">
                  {formatTimeAgo(position.updated_at)}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Desktop layout - table */}
        <div className="hidden md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Pool</TableHead>
              <TableHead>Tokens</TableHead>
              <TableHead className="text-right">Status</TableHead>
              <TableHead className="text-right">Value</TableHead>
              <TableHead className="text-right">Uncollected Fees</TableHead>
              <TableHead className="text-right">Fee %</TableHead>
              <TableHead className="text-right">Fee/Value Ratio</TableHead>
              <TableHead className="text-right">Last Updated</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedPositions.map((position, index) => (
              <TableRow key={index}>
                <TableCell className="font-medium">
                  {position.pool}
                </TableCell>
                <TableCell>
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span>{position.token_a_symbol}</span>
                      <span className="font-mono text-xs">
                        {formatNumber(position.token_a_qty)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>{position.token_b_symbol}</span>
                      <span className="font-mono text-xs">
                        {formatNumber(position.token_b_qty)}
                      </span>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <span className={`px-2 py-1 rounded-full text-xs ${position.in_range ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'}`}>
                    {position.in_range ? 'In Range' : 'Out of Range'}
                  </span>
                </TableCell>
                <TableCell className="text-right font-semibold">
                  {formatDollar(position.total_value_usd)}
                </TableCell>
                <TableCell className="text-right">
                  {formatDollar(position.uncollected_fees_usd)}
                </TableCell>
                <TableCell className="text-right">
                  <span className="text-sm font-medium">
                    {totalUncollectedFees > 0 ? `${((position.uncollected_fees_usd / totalUncollectedFees) * 100).toFixed(1)}%` : '0%'}
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  <span className="text-sm font-medium">
                    {position.total_value_usd > 0 ? `${((position.uncollected_fees_usd / position.total_value_usd) * 100).toFixed(2)}%` : '0%'}
                  </span>
                </TableCell>
                <TableCell className="text-right text-gray-500 text-sm">
                  {formatTimeAgo(position.updated_at)}
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