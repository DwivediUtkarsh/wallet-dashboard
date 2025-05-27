import { AggregatedLPPosition } from "@/types/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDollar } from "@/lib/utils";

interface SummaryPositionsTableProps {
  positions: AggregatedLPPosition[];
  title: string;
  emptyMessage?: string;
  protocol: 'whirlpool' | 'raydium';
}

export default function SummaryPositionsTable({
  positions,
  title,
  emptyMessage = "No positions found",
  protocol
}: SummaryPositionsTableProps) {
  if (!positions || positions.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500">{emptyMessage}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-xs text-gray-500 border-b">
                <th className="pb-2 font-medium">Pool</th>
                <th className="pb-2 font-medium">Positions</th>
                <th className="pb-2 font-medium">In Range</th>
                <th className="pb-2 font-medium text-right">Token A</th>
                <th className="pb-2 font-medium text-right">Token B</th>
                <th className="pb-2 font-medium text-right">Value</th>
                <th className="pb-2 font-medium text-right">Fees</th>
              </tr>
            </thead>
            <tbody>
              {positions.map((position) => (
                <tr key={position.pool} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3">
                    <div className="font-medium">{position.pool}</div>
                    <div className="text-xs text-gray-500">
                      {protocol === 'whirlpool' ? 'Orca' : 'Raydium'}
                    </div>
                  </td>
                  <td className="py-3">{position.position_count}</td>
                  <td className="py-3">
                    <span className={position.in_range_count === 0 ? 'text-red-500' : 'text-green-500'}>
                      {position.in_range_count} / {position.position_count}
                    </span>
                  </td>
                  <td className="py-3 text-right">
                    <div>{position.token_a_qty.toFixed(4)}</div>
                    <div className="text-xs text-gray-500">{position.token_a_symbol}</div>
                  </td>
                  <td className="py-3 text-right">
                    <div>{position.token_b_qty.toFixed(4)}</div>
                    <div className="text-xs text-gray-500">{position.token_b_symbol}</div>
                  </td>
                  <td className="py-3 text-right font-medium">
                    {formatDollar(position.total_value_usd)}
                  </td>
                  <td className="py-3 text-right">
                    <div className="font-medium text-green-600">
                      {formatDollar(position.uncollected_fees_usd)}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
} 