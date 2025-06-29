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
          <CardTitle className="text-base md:text-lg">Hyperliquid Account</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center p-4 md:p-6 text-gray-500 text-sm md:text-base">
            No Hyperliquid data found
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6 md:space-y-8">
      {account && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base md:text-lg">Hyperliquid Account Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-4 mb-4 md:mb-6">
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
            <CardTitle className="text-base md:text-lg">Spot Holdings</CardTitle>
          </CardHeader>
          <CardContent>
            {/* Mobile layout - cards */}
            <div className="block md:hidden space-y-3">
              {spotHoldings.map((holding, index) => (
                <div key={index} className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 space-y-3">
                  <div className="flex justify-between items-start">
                    <div className="flex flex-col">
                      <span className="font-semibold text-sm">{holding.coin}</span>
                      <Badge variant="outline" className="text-xs w-fit mt-1">
                        {holding.price_source}
                      </Badge>
                    </div>
                    <span className="text-sm font-bold">{formatDollar(holding.usd_value)}</span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-xs">
                    <div>
                      <span className="text-gray-500">Balance:</span>
                      <div className="font-mono">{formatNumber(holding.balance)}</div>
                    </div>
                    <div>
                      <span className="text-gray-500">Price:</span>
                      <div className="font-mono">{formatDollar(holding.current_price)}</div>
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
            </div>
          </CardContent>
        </Card>
      )}

      {staking && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base md:text-lg">HYPE Staking</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4 mb-4 md:mb-6">
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
                <h3 className="text-sm md:text-base font-semibold mb-3 md:mb-2">Delegations</h3>
                
                {/* Mobile layout - cards */}
                <div className="block md:hidden space-y-2">
                  {staking.delegations.map((delegation: HyperliquidStakingDelegation, index: number) => (
                    <div key={index} className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                      <div className="flex justify-between items-start mb-2">
                        <span className="font-medium text-sm">{delegation.validator.slice(0, 10)}...</span>
                        <span className="text-sm font-mono">{formatNumber(delegation.amount)} HYPE</span>
                      </div>
                      <div className="text-xs">
                        {delegation.locked_until ? (
                          <span className="text-yellow-600 dark:text-yellow-400">
                            Locked until {new Date(delegation.locked_until).toLocaleDateString()}
                          </span>
                        ) : (
                          <span className="text-green-600 dark:text-green-400">Liquid</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Desktop layout - table */}
                <div className="hidden md:block">
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
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {positions && positions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base md:text-lg">Positions</CardTitle>
          </CardHeader>
          <CardContent>
            {/* Mobile layout - cards */}
            <div className="block lg:hidden space-y-4">
              {positions.map((position, index) => (
                <div key={index} className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 space-y-3">
                  <div className="flex justify-between items-start">
                    <div className="flex flex-col">
                      <span className="font-semibold text-sm">{position.coin}</span>
                      <Badge variant={position.is_long ? "default" : "destructive"} className="w-fit mt-1 text-xs">
                        {position.is_long ? "LONG" : "SHORT"}
                      </Badge>
                    </div>
                    <div className="text-right">
                      <div className={`text-sm font-bold ${position.pnl >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>
                        {formatDollar(position.pnl)}
                      </div>
                      <div className={`text-xs ${position.pnl_percent >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>
                        {formatPercent(position.pnl_percent / 100)}
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <span className="text-gray-500">Size:</span>
                      <div className="font-mono">{formatNumber(Math.abs(position.size))}</div>
                    </div>
                    <div>
                      <span className="text-gray-500">Leverage:</span>
                      <div className="font-mono">{position.leverage}x</div>
                    </div>
                    <div>
                      <span className="text-gray-500">Entry:</span>
                      <div className="font-mono">{formatNumber(position.entry_price)}</div>
                    </div>
                    <div>
                      <span className="text-gray-500">Mark:</span>
                      <div className="font-mono">{formatNumber(position.mark_price)}</div>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center text-xs">
                    <div>
                      <span className="text-gray-500">Margin:</span>
                      <div className="font-semibold">{formatDollar(position.margin)}</div>
                    </div>
                    <div>
                      <span className="text-gray-500">Risk:</span>
                      <div><RiskBadge risk={position.risk_level} /></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop layout - table */}
            <div className="hidden lg:block">
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
            </div>
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
      <div className="text-gray-500 dark:text-gray-400 text-xs md:text-sm">{label}</div>
      <div className={`font-semibold text-gray-900 dark:text-gray-100 text-sm md:text-base ${valueClass}`}>{value}</div>
    </div>
  );
}

function RiskBadge({ risk }: { risk: string }) {
  switch (risk) {
    case 'low':
      return <Badge variant="outline" className="bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800 text-xs">LOW</Badge>;
    case 'medium':
      return <Badge variant="outline" className="bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800 text-xs">MEDIUM</Badge>;
    case 'high':
      return <Badge variant="outline" className="bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800 text-xs">HIGH</Badge>;
    default:
      return <Badge variant="outline" className="dark:text-gray-300 dark:border-gray-600 text-xs">{risk.toUpperCase()}</Badge>;
  }
}