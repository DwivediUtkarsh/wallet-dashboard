import { KaminoAccount } from '@/types/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { formatDollar, formatNumber, formatPercent, shortenAddress } from '@/lib/utils';

interface KaminoTableProps {
  accounts: KaminoAccount[];
}

export default function KaminoTable({ accounts }: KaminoTableProps) {
  if (!accounts || accounts.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base md:text-lg">Kamino Lend Accounts</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center p-4 md:p-6 text-muted-foreground text-sm md:text-base">
            No Kamino Lend accounts found
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6 md:space-y-8">
      {accounts.map((account) => (
        <Card key={account.obligation_address}>
          <CardHeader className="pb-3 md:pb-2">
            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-3 md:gap-0">
              <CardTitle className="text-base md:text-lg">
                Kamino Lend Account
                <span className="ml-2 text-sm font-normal text-muted-foreground block md:inline">
                  {shortenAddress(account.obligation_address)}
                </span>
              </CardTitle>
              <div className="flex items-center gap-1">
                <span className="text-sm text-muted-foreground">Health:</span>
                <span className="text-sm font-semibold text-green-600 dark:text-green-400">
                  {account.health_ratio.toFixed(2)}
                </span>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4 mb-4 md:mb-6">
              <SummaryItem
                label="Total Supplied"
                value={formatDollar(account.total_supplied_value_usd)}
              />
              <SummaryItem
                label="Total Borrowed"
                value={formatDollar(account.total_borrowed_value_usd)}
              />
              <SummaryItem
                label="Net Value"
                value={formatDollar(account.net_value_usd)}
              />
            </div>

            <div className="space-y-6 md:space-y-0 md:grid md:grid-cols-2 md:gap-6">
              <div>
                <h3 className="text-sm md:text-base font-semibold mb-3 md:mb-2 text-foreground">Supplies</h3>
                {account.supplies.length > 0 ? (
                  <>
                    {/* Mobile layout - cards */}
                    <div className="block md:hidden space-y-2">
                      {account.supplies.map((supply, index) => (
                        <div key={index} className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                          <div className="flex justify-between items-start mb-2">
                            <span className="font-medium text-sm text-foreground">{supply.token}</span>
                            <span className="text-sm font-semibold text-foreground">{formatDollar(supply.value_usd)}</span>
                          </div>
                          <div className="grid grid-cols-2 gap-3 text-xs">
                            <div>
                              <span className="text-muted-foreground">Amount:</span>
                              <div className="font-mono text-foreground">{formatNumber(supply.amount)}</div>
                            </div>
                            <div>
                              <span className="text-muted-foreground">APR:</span>
                              <div className="text-green-600 dark:text-green-400">{formatPercent(supply.apr)}</div>
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
                            <TableHead>Token</TableHead>
                            <TableHead className="text-right">Amount</TableHead>
                            <TableHead className="text-right">Value</TableHead>
                            <TableHead className="text-right">APR</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {account.supplies.map((supply, index) => (
                            <TableRow key={index}>
                              <TableCell className="text-foreground">{supply.token}</TableCell>
                              <TableCell className="text-right font-mono text-foreground">
                                {formatNumber(supply.amount)}
                              </TableCell>
                              <TableCell className="text-right text-foreground">
                                {formatDollar(supply.value_usd)}
                              </TableCell>
                              <TableCell className="text-right text-green-600 dark:text-green-400">
                                {formatPercent(supply.apr)}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </>
                ) : (
                  <div className="flex justify-center p-3 md:p-4 text-muted-foreground text-sm">
                    No supplies
                  </div>
                )}
              </div>

              <div>
                <h3 className="text-sm md:text-base font-semibold mb-3 md:mb-2 text-foreground">Borrows</h3>
                {account.borrows.length > 0 ? (
                  <>
                    {/* Mobile layout - cards */}
                    <div className="block md:hidden space-y-2">
                      {account.borrows.map((borrow, index) => (
                        <div key={index} className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                          <div className="flex justify-between items-start mb-2">
                            <span className="font-medium text-sm text-foreground">{borrow.token}</span>
                            <span className="text-sm font-semibold text-foreground">{formatDollar(borrow.value_usd)}</span>
                          </div>
                          <div className="grid grid-cols-2 gap-3 text-xs">
                            <div>
                              <span className="text-muted-foreground">Amount:</span>
                              <div className="font-mono text-foreground">{formatNumber(borrow.amount)}</div>
                            </div>
                            <div>
                              <span className="text-muted-foreground">APR:</span>
                              <div className="text-red-600 dark:text-red-400">{formatPercent(borrow.apr)}</div>
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
                            <TableHead>Token</TableHead>
                            <TableHead className="text-right">Amount</TableHead>
                            <TableHead className="text-right">Value</TableHead>
                            <TableHead className="text-right">APR</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {account.borrows.map((borrow, index) => (
                            <TableRow key={index}>
                              <TableCell className="text-foreground">{borrow.token}</TableCell>
                              <TableCell className="text-right font-mono text-foreground">
                                {formatNumber(borrow.amount)}
                              </TableCell>
                              <TableCell className="text-right text-foreground">
                                {formatDollar(borrow.value_usd)}
                              </TableCell>
                              <TableCell className="text-right text-red-600 dark:text-red-400">
                                {formatPercent(borrow.apr)}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </>
                ) : (
                  <div className="flex justify-center p-3 md:p-4 text-muted-foreground text-sm">
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
    <div className="bg-muted/50 p-3 rounded-md border">
      <div className="text-muted-foreground text-xs md:text-sm">{label}</div>
      <div className="font-semibold text-foreground text-sm md:text-base">{value}</div>
    </div>
  );
} 