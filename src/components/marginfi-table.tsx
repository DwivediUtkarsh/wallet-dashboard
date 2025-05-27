import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatDollar, formatNumber, formatPercent, shortenAddress } from "@/lib/utils";
import { MarginfiAccount } from "@/types/api";

interface MarginfiTableProps {
  accounts: MarginfiAccount[];
}

export default function MarginfiTable({ accounts }: MarginfiTableProps) {
  if (!accounts || accounts.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Marginfi Accounts</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center p-6 text-gray-500">
            No Marginfi accounts found
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-8">
      {accounts.map((account) => (
        <Card key={account.account_address}>
          <CardHeader className="pb-2">
            <div className="flex justify-between items-center">
              <CardTitle className="text-lg">
                Marginfi Account
                <span className="ml-2 text-sm font-normal text-gray-500">
                  {shortenAddress(account.account_address)}
                </span>
              </CardTitle>
              <div className="flex items-center gap-1">
                <span className="text-sm text-gray-500">Health:</span>
                <span className={`text-sm font-semibold ${getHealthColor(account.health_status)}`}>
                  {account.health_ratio.toFixed(2)}
                </span>
                <span className={`ml-1 px-2 py-0.5 rounded-full text-xs ${getHealthBadgeColor(account.health_status)}`}>
                  {account.health_status}
                </span>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <SummaryItem
                label="Total Collateral"
                value={formatDollar(account.total_collateral_value)}
              />
              <SummaryItem
                label="Total Borrows"
                value={formatDollar(account.total_borrow_value)}
              />
              <SummaryItem
                label="Net Value"
                value={formatDollar(account.net_value)}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-base font-semibold mb-2">Deposits</h3>
                {account.deposits.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Token</TableHead>
                        <TableHead className="text-right">Amount</TableHead>
                        <TableHead className="text-right">Value</TableHead>
                        <TableHead className="text-right">APR</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {account.deposits.map((deposit, index) => (
                        <TableRow key={index}>
                          <TableCell>{deposit.token}</TableCell>
                          <TableCell className="text-right font-mono">
                            {formatNumber(deposit.amount)}
                          </TableCell>
                          <TableCell className="text-right">
                            {formatDollar(deposit.value_usd)}
                          </TableCell>
                          <TableCell className="text-right text-green-600">
                            {formatPercent(deposit.apr)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="flex justify-center p-4 text-gray-500 text-sm">
                    No deposits
                  </div>
                )}
              </div>

              <div>
                <h3 className="text-base font-semibold mb-2">Borrows</h3>
                {account.borrows.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Token</TableHead>
                        <TableHead className="text-right">Amount</TableHead>
                        <TableHead className="text-right">Value</TableHead>
                        <TableHead className="text-right">APR</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {account.borrows.map((borrow, index) => (
                        <TableRow key={index}>
                          <TableCell>{borrow.token}</TableCell>
                          <TableCell className="text-right font-mono">
                            {formatNumber(borrow.amount)}
                          </TableCell>
                          <TableCell className="text-right">
                            {formatDollar(borrow.value_usd)}
                          </TableCell>
                          <TableCell className="text-right text-red-600">
                            {formatPercent(borrow.apr)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="flex justify-center p-4 text-gray-500 text-sm">
                    No borrows
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

interface SummaryItemProps {
  label: string;
  value: string;
}

function SummaryItem({ label, value }: SummaryItemProps) {
  return (
    <div className="bg-gray-50 p-3 rounded-md">
      <div className="text-gray-500 text-sm">{label}</div>
      <div className="font-semibold">{value}</div>
    </div>
  );
}

function getHealthColor(status: string): string {
  switch (status) {
    case 'Healthy':
      return 'text-green-600';
    case 'Warning':
      return 'text-yellow-600';
    case 'Danger':
      return 'text-red-600';
    default:
      return 'text-gray-600';
  }
}

function getHealthBadgeColor(status: string): string {
  switch (status) {
    case 'Healthy':
      return 'bg-green-100 text-green-800';
    case 'Warning':
      return 'bg-yellow-100 text-yellow-800';
    case 'Danger':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
} 