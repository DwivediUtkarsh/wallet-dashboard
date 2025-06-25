import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatDollar, formatNumber, formatPercent } from "@/lib/utils";
import { HyperliquidAccount, HyperliquidPosition, HyperliquidStaking, HyperliquidStakingDelegation, HyperliquidSpotHolding } from "@/types/api";
import { Badge } from "@/components/ui/badge";

interface HyperliquidTableProps {
  account: HyperliquidAccount | null;
  positions: HyperliquidPosition[];
  staking?: HyperliquidStaking | null;
  spotHoldings?: HyperliquidSpotHolding[];
}

export default function HyperliquidTable({ account, positions, staking, spotHoldings }: HyperliquidTableProps) {
  if (!account && (!positions || positions.length === 0) && !staking && (!spotHoldings || spotHoldings.length === 0)) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Hyperliquid Account</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center p-6 text-gray-500">
            No Hyperliquid data found
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-8">
      {account && (
        <Card>
          <CardHeader>
            <CardTitle>Hyperliquid Account Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
              <SummaryItem
                label="Total Equity"
                value={formatDollar(account.total_equity)}
              />
              <SummaryItem
                label="Perps Equity"
                value={formatDollar(account.perps_equity)}
              />
              <SummaryItem
                label="24h PnL"
                value={formatDollar(account.pnl_24h)}
                valueClass={account.pnl_24h >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}
              />
              <SummaryItem
                label="Unrealized PnL"
                value={formatDollar(account.unrealized_pnl)}
                valueClass={account.unrealized_pnl >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}
              />
              <SummaryItem
                label="Funding (24h)"
                value={formatDollar(account.funding_paid_24h)}
                valueClass={account.funding_paid_24h <= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}
              />
            </div>
          </CardContent>
        </Card>
      )}

      {spotHoldings && spotHoldings.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Spot Holdings</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Asset</TableHead>
                  <TableHead className="text-right">Balance</TableHead>
                  <TableHead className="text-right">Current Price</TableHead>
                  <TableHead className="text-right">USD Value</TableHead>
                  <TableHead>Price Source</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {spotHoldings.map((holding, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{holding.coin}</TableCell>
                    <TableCell className="text-right font-mono">
                      {formatNumber(holding.balance)}
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      {formatDollar(holding.current_price)}
                    </TableCell>
                    <TableCell className="text-right font-semibold">
                      {formatDollar(holding.usd_value)}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-xs">
                        {holding.price_source}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {staking && (
        <Card>
          <CardHeader>
            <CardTitle>HYPE Staking</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <SummaryItem
                label="Delegated HYPE"
                value={`${formatNumber(staking.delegated_amount)} HYPE`}
              />
              <SummaryItem
                label="Undelegated HYPE"
                value={`${formatNumber(staking.undelegated_amount)} HYPE`}
              />
              <SummaryItem
                label="Total Value"
                value={formatDollar(staking.usd_value)}
              />
            </div>
            
            {staking.delegations && staking.delegations.length > 0 && (
              <div className="mt-4">
                <h3 className="text-base font-semibold mb-2">Delegations</h3>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Validator</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                      <TableHead className="text-right">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {staking.delegations.map((delegation: HyperliquidStakingDelegation, index: number) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">{delegation.validator.slice(0, 10)}...</TableCell>
                        <TableCell className="text-right font-mono">
                          {formatNumber(delegation.amount)} HYPE
                        </TableCell>
                        <TableCell className="text-right">
                          {delegation.locked_until ? (
                            <span className="text-yellow-600 dark:text-yellow-400">
                              Locked until {new Date(delegation.locked_until).toLocaleDateString()}
                            </span>
                          ) : (
                            <span className="text-green-600 dark:text-green-400">Liquid</span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {positions && positions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Positions</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Asset</TableHead>
                  <TableHead>Side</TableHead>
                  <TableHead className="text-right">Size</TableHead>
                  <TableHead className="text-right">Entry</TableHead>
                  <TableHead className="text-right">Mark</TableHead>
                  <TableHead className="text-right">Margin</TableHead>
                  <TableHead className="text-right">Lev</TableHead>
                  <TableHead className="text-right">PnL</TableHead>
                  <TableHead className="text-right">ROE%</TableHead>
                  <TableHead className="text-right">Funding</TableHead>
                  <TableHead className="text-right">Liq Price</TableHead>
                  <TableHead>Risk</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {positions.map((position, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{position.coin}</TableCell>
                    <TableCell>
                      <Badge variant={position.is_long ? "default" : "destructive"}>
                        {position.is_long ? "LONG" : "SHORT"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      {formatNumber(Math.abs(position.size))}
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      {formatNumber(position.entry_price)}
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      {formatNumber(position.mark_price)}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatDollar(position.margin)}
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      {position.leverage}x
                    </TableCell>
                    <TableCell className={`text-right ${position.pnl >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>
                      {formatDollar(position.pnl)}
                    </TableCell>
                    <TableCell className={`text-right ${position.pnl_percent >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>
                      {formatPercent(position.pnl_percent / 100)}
                    </TableCell>
                    <TableCell className={`text-right ${position.funding_usd <= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>
                      {formatDollar(position.funding_usd)}
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      {formatNumber(position.liq_price)}
                    </TableCell>
                    <TableCell>
                      <RiskBadge risk={position.risk_level} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

interface SummaryItemProps {
  label: string;
  value: string;
  valueClass?: string;
}

function SummaryItem({ label, value, valueClass = "" }: SummaryItemProps) {
  return (
    <div className="bg-gray-50 dark:bg-gray-800/50 p-3 rounded-md border border-gray-200 dark:border-gray-700">
      <div className="text-gray-500 dark:text-gray-400 text-sm">{label}</div>
      <div className={`font-semibold text-gray-900 dark:text-gray-100 ${valueClass}`}>{value}</div>
    </div>
  );
}

function RiskBadge({ risk }: { risk: string }) {
  switch (risk) {
    case 'low':
      return <Badge variant="outline" className="bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800">LOW</Badge>;
    case 'medium':
      return <Badge variant="outline" className="bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800">MEDIUM</Badge>;
    case 'high':
      return <Badge variant="outline" className="bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800">HIGH</Badge>;
    default:
      return <Badge variant="outline" className="dark:text-gray-300 dark:border-gray-600">{risk.toUpperCase()}</Badge>;
  }
}