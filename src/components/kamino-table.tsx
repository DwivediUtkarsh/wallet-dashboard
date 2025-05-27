import { KaminoAccount } from '@/types/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { formatDollar, formatNumber } from '@/lib/utils';

interface KaminoTableProps {
  accounts: KaminoAccount[];
}

export default function KaminoTable({ accounts = [] }: KaminoTableProps) {
  if (!accounts || accounts.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Kamino Lend Accounts</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-500">No Kamino Lend accounts found.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {accounts.map((account, i) => (
        <Card key={i}>
          <CardHeader className="pb-3">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <CardTitle className="text-lg">Kamino Account</CardTitle>
              <div className="flex items-center gap-2 mt-2 md:mt-0">
                <span className="font-mono text-xs py-0.5 px-2 rounded-full bg-orange-100 text-orange-800">
                  {getShortAddress(account.market_address)}
                </span>
                <span className={`text-xs py-0.5 px-2 rounded-full ${getHealthBadgeColor(account.health_ratio)}`}>
                  Health: {formatNumber(account.health_ratio, { maximumFractionDigits: 2 })}%
                </span>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="mb-3 flex flex-col sm:flex-row sm:items-center justify-between text-sm">
              <div className="mb-2 sm:mb-0">
                <span className="text-gray-500">Supplied: </span>
                <span className="font-medium">{formatDollar(account.total_supplied_value_usd)}</span>
              </div>
              <div className="mb-2 sm:mb-0">
                <span className="text-gray-500">Borrowed: </span>
                <span className="font-medium">{formatDollar(account.total_borrowed_value_usd)}</span>
              </div>
              <div>
                <span className="text-gray-500">Net Value: </span>
                <span className="font-medium">{formatDollar(account.net_value_usd)}</span>
              </div>
            </div>
            
            <div className="rounded-md border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Position</TableHead>
                    <TableHead>Token</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead className="text-right">Value</TableHead>
                    <TableHead className="text-right">APR</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {account.supplies.map((supply, j) => (
                    <TableRow key={`supply-${j}`}>
                      <TableCell className="font-medium">Supply</TableCell>
                      <TableCell>{supply.token}</TableCell>
                      <TableCell className="text-right">{formatNumber(supply.amount, { maximumFractionDigits: 6 })}</TableCell>
                      <TableCell className="text-right">{formatDollar(supply.value_usd)}</TableCell>
                      <TableCell className="text-right text-green-600">{formatNumber(supply.apr / 100, { maximumFractionDigits: 2 })}%</TableCell>
                    </TableRow>
                  ))}
                  {account.borrows.map((borrow, j) => (
                    <TableRow key={`borrow-${j}`}>
                      <TableCell className="font-medium">Borrow</TableCell>
                      <TableCell>{borrow.token}</TableCell>
                      <TableCell className="text-right">{formatNumber(borrow.amount, { maximumFractionDigits: 6 })}</TableCell>
                      <TableCell className="text-right">{formatDollar(borrow.value_usd)}</TableCell>
                      <TableCell className="text-right text-red-600">{formatNumber(borrow.apr / 100, { maximumFractionDigits: 2 })}%</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function getShortAddress(address: string): string {
  if (!address) return '-';
  return `${address.slice(0, 4)}...${address.slice(-4)}`;
}

function getHealthBadgeColor(health: number): string {
  if (health >= 200) return 'bg-green-100 text-green-800';
  if (health >= 150) return 'bg-lime-100 text-lime-800';
  if (health >= 120) return 'bg-yellow-100 text-yellow-800';
  if (health >= 110) return 'bg-amber-100 text-amber-800';
  return 'bg-red-100 text-red-800';
} 