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
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center p-6 text-gray-500">
            {emptyMessage}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Sort positions by value (highest first)
  const sortedPositions = [...positions].sort((a, b) => b.total_value_usd - a.total_value_usd);

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Pool</TableHead>
              <TableHead>Tokens</TableHead>
              <TableHead className="text-right">Status</TableHead>
              <TableHead className="text-right">Value</TableHead>
              <TableHead className="text-right">Uncollected Fees</TableHead>
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
                <TableCell className="text-right text-gray-500 text-sm">
                  {formatTimeAgo(position.updated_at)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
} 