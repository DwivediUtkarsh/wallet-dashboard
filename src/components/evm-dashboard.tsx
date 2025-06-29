import { EvmPortfolioData, EvmChainData, EvmLendingPosition, EvmLiquidityPosition, EvmStakingPosition, EvmTokenAmount } from "@/types/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDollar, formatNumber } from "@/lib/utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "./ui/badge";
import { useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";

interface EvmDashboardProps {
  data: EvmPortfolioData;
}

export default function EvmDashboard({ data }: EvmDashboardProps) {
  // Filter chains with non-zero values
  const filteredChains = (data.chains || []).filter(chain => (chain.total_value_usd || 0) > 0);
  const [expandedChains, setExpandedChains] = useState<Set<string>>(new Set([filteredChains[0]?.chain_id?.toString()]));

  const toggleChain = (chainId: string) => {
    const newExpanded = new Set(expandedChains);
    if (newExpanded.has(chainId)) {
      newExpanded.delete(chainId);
    } else {
      newExpanded.add(chainId);
    }
    setExpandedChains(newExpanded);
  };
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg md:text-xl">EVM Portfolio Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
            <div className="p-3 md:p-4 border rounded-lg">
              <h3 className="text-xs md:text-sm font-medium text-gray-500">Total Value</h3>
              <p className="text-xl md:text-2xl font-bold">{formatDollar(data.total_value_usd || 0)}</p>
            </div>
            <div className="p-3 md:p-4 border rounded-lg">
              <h3 className="text-xs md:text-sm font-medium text-gray-500">Active Chains</h3>
              <p className="text-xl md:text-2xl font-bold">{filteredChains.length}</p>
            </div>
            <div className="p-3 md:p-4 border rounded-lg sm:col-span-2 md:col-span-1">
              <h3 className="text-xs md:text-sm font-medium text-gray-500">Total Positions</h3>
              <p className="text-xl md:text-2xl font-bold">
                {filteredChains.reduce((sum, chain) => 
                  sum + (chain.lending_positions || []).length + 
                        (chain.liquidity_positions || []).length + 
                        (chain.staking_positions || []).length, 0)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {data.summary && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg md:text-xl">Portfolio Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
              <div className="p-3 md:p-4 border rounded-lg">
                <h3 className="text-xs md:text-sm font-medium text-gray-500">Token Holdings</h3>
                <p className="text-sm md:text-lg font-bold">{formatDollar(data.summary.total_token_value || 0)}</p>
              </div>
              <div className="p-3 md:p-4 border rounded-lg">
                <h3 className="text-xs md:text-sm font-medium text-gray-500">Lending Positions</h3>
                <p className="text-sm md:text-lg font-bold">{formatDollar(data.summary.total_lending_value || 0)}</p>
              </div>
              <div className="p-3 md:p-4 border rounded-lg">
                <h3 className="text-xs md:text-sm font-medium text-gray-500">Liquidity Positions</h3>
                <p className="text-sm md:text-lg font-bold">{formatDollar(data.summary.total_liquidity_value || 0)}</p>
              </div>
              <div className="p-3 md:p-4 border rounded-lg">
                <h3 className="text-xs md:text-sm font-medium text-gray-500">Staking Positions</h3>
                <p className="text-sm md:text-lg font-bold">{formatDollar(data.summary.total_staking_value || 0)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Display chains in collapsible sections */}
      {filteredChains.length > 0 ? (
        <div className="space-y-4">
          {filteredChains.map(chain => (
            <Card key={chain.chain_id} className="overflow-hidden">
              <CardHeader 
                className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                onClick={() => toggleChain(chain.chain_id?.toString())}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {expandedChains.has(chain.chain_id?.toString()) ? (
                      <ChevronDown className="h-5 w-5" />
                    ) : (
                      <ChevronRight className="h-5 w-5" />
                    )}
                    <CardTitle className="text-lg">{chain.chain_name}</CardTitle>
                    <Badge variant="secondary" className="bg-gray-200 dark:bg-gray-700 dark:text-gray-300">
                      {formatDollar(chain.total_value_usd || 0)}
                    </Badge>
                  </div>
                  <div className="text-sm text-gray-500">
                    {(chain.token_balances || []).length + (chain.lending_positions || []).length + 
                     (chain.liquidity_positions || []).length + (chain.staking_positions || []).length} positions
                  </div>
                </div>
              </CardHeader>
              
              {expandedChains.has(chain.chain_id?.toString()) && (
                <CardContent className="pt-0">
            <ChainDashboard chain={chain} />
                </CardContent>
              )}
            </Card>
        ))}
        </div>
      ) : (
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-gray-500">No EVM positions found for this wallet.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

interface ChainDashboardProps {
  chain: EvmChainData;
}

function ChainDashboard({ chain }: ChainDashboardProps) {
  // Filter tokens with value greater than $1
  const filteredTokens = (chain.token_balances || []).filter(token => token.value_usd > 1);
  
  return (
    <div className="space-y-4 md:space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base md:text-lg">{chain.chain_name || chain.name} Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
            <div className="p-3 md:p-4 border rounded-lg">
              <h3 className="text-xs md:text-sm font-medium text-gray-500">Total Value</h3>
              <p className="text-lg md:text-2xl font-bold">{formatDollar(chain.total_value_usd || 0)}</p>
            </div>
            <div className="p-3 md:p-4 border rounded-lg">
              <h3 className="text-xs md:text-sm font-medium text-gray-500">Tokens</h3>
              <p className="text-lg md:text-2xl font-bold">{(chain.token_balances || []).length}</p>
              <p className="text-xs text-gray-500">{filteredTokens.length} with value {'>'} $1</p>
            </div>
            <div className="p-3 md:p-4 border rounded-lg">
              <h3 className="text-xs md:text-sm font-medium text-gray-500">Lending Positions</h3>
              <p className="text-lg md:text-2xl font-bold">{(chain.lending_positions || []).length}</p>
            </div>
            <div className="p-3 md:p-4 border rounded-lg">
              <h3 className="text-xs md:text-sm font-medium text-gray-500">Liquidity Positions</h3>
              <p className="text-lg md:text-2xl font-bold">{(chain.liquidity_positions || []).length}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {filteredTokens.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base md:text-lg">Token Balances (Value {'>'} $1)</CardTitle>
          </CardHeader>
          <CardContent>
            {/* Mobile layout - stacked cards */}
            <div className="block md:hidden space-y-2">
              {filteredTokens.map((token, index) => (
                <div key={index} className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-sm">{token.token_symbol || token.symbol}</span>
                    <span className="text-sm font-semibold">{formatDollar(token.value_usd || 0)}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs text-gray-500">
                    <div>Balance: {formatNumber(token.amount || 0)}</div>
                    <div>Price: {formatDollar(token.price_usd || 0)}</div>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Desktop layout - table */}
            <div className="hidden md:block overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs">Token</TableHead>
                    <TableHead className="text-xs">Balance</TableHead>
                    <TableHead className="text-xs">Price</TableHead>
                    <TableHead className="text-xs">Value</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTokens.map((token, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium text-sm">{token.token_symbol || token.symbol}</TableCell>
                      <TableCell className="text-sm">{formatNumber(token.amount || 0)}</TableCell>
                      <TableCell className="text-sm">{formatDollar(token.price_usd || 0)}</TableCell>
                      <TableCell className="text-sm">{formatDollar(token.value_usd || 0)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {(chain.lending_positions || []).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Lending Positions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {(chain.lending_positions || []).map((position, index) => (
                <LendingPositionCard key={index} position={position} />
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {(chain.liquidity_positions || []).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Liquidity Positions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {(chain.liquidity_positions || []).map((position, index) => (
                <LiquidityPositionCard key={index} position={position} />
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {(chain.staking_positions || []).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Staking Positions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {(chain.staking_positions || []).map((position, index) => (
                <StakingPositionCard key={index} position={position} />
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

interface LendingPositionCardProps {
  position: EvmLendingPosition;
}

function LendingPositionCard({ position }: LendingPositionCardProps) {
  const healthRate = position.health_rate || 0;
  const healthStatus = healthRate > 2 ? "Excellent" : 
                       healthRate > 1.5 ? "Good" : 
                       healthRate > 1.2 ? "Fair" : "Poor";
  
  const healthColor = healthRate > 2 ? "bg-green-100 text-green-800" : 
                      healthRate > 1.5 ? "bg-blue-100 text-blue-800" : 
                      healthRate > 1.2 ? "bg-yellow-100 text-yellow-800" : 
                      "bg-red-100 text-red-800";

  return (
    <div className="border rounded-lg p-3 md:p-4 space-y-4">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-2 sm:space-y-0">
        <div className="min-w-0 flex-1">
          <h3 className="text-base md:text-lg font-medium truncate">{position.protocol}</h3>
          <p className="text-xs md:text-sm text-gray-500 truncate">{position.name}</p>
        </div>
        <Badge className={`${healthColor} text-xs whitespace-nowrap ml-0 sm:ml-2`}>
          Health: {healthStatus} ({healthRate.toFixed(2)})
        </Badge>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4">
        <div className="text-center sm:text-left">
          <p className="text-xs md:text-sm text-gray-500">Supplied</p>
          <p className="font-medium text-sm md:text-base">{formatDollar(position.total_supplied_value_usd || 0)}</p>
        </div>
        <div className="text-center sm:text-left">
          <p className="text-xs md:text-sm text-gray-500">Borrowed</p>
          <p className="font-medium text-sm md:text-base">{formatDollar(position.total_borrowed_value_usd || 0)}</p>
        </div>
        <div className="text-center sm:text-left">
          <p className="text-xs md:text-sm text-gray-500">Net Value</p>
          <p className="font-medium text-sm md:text-base">{formatDollar(position.net_value_usd || 0)}</p>
        </div>
      </div>

      <div className="space-y-3">
        <h4 className="text-sm md:text-base font-medium">Supplied Assets</h4>
        {position.supplies && position.supplies.length > 0 ? (
      <div className="space-y-2">
            {/* Mobile layout - stacked cards */}
            <div className="block md:hidden space-y-2">
              {position.supplies.map((supply, index) => (
                <div key={index} className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-sm">{supply.token || supply.symbol}</span>
                    <span className="text-sm font-semibold">{formatDollar(supply.value_usd || 0)}</span>
                  </div>
                  <div className="text-xs text-gray-500">
                    Amount: {formatNumber(supply.amount || 0)}
                  </div>
                </div>
              ))}
            </div>
            
            {/* Desktop layout - table */}
            <div className="hidden md:block">
          <Table>
            <TableHeader>
              <TableRow>
                    <TableHead className="text-xs">Token</TableHead>
                    <TableHead className="text-xs">Amount</TableHead>
                    <TableHead className="text-xs">Value</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {position.supplies.map((supply, index) => (
                <TableRow key={index}>
                      <TableCell className="text-sm">{supply.token || supply.symbol}</TableCell>
                      <TableCell className="text-sm">{formatNumber(supply.amount || 0)}</TableCell>
                      <TableCell className="text-sm">{formatDollar(supply.value_usd || 0)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
            </div>
          </div>
        ) : (
          <p className="text-xs md:text-sm text-gray-500">No supplied assets</p>
        )}
      </div>

      <div className="space-y-3">
        <h4 className="text-sm md:text-base font-medium">Borrowed Assets</h4>
        {position.borrows && position.borrows.length > 0 ? (
      <div className="space-y-2">
            {/* Mobile layout - stacked cards */}
            <div className="block md:hidden space-y-2">
              {position.borrows.map((borrow, index) => (
                <div key={index} className="bg-red-50 dark:bg-red-900/20 rounded-lg p-3 space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-sm">{borrow.token || borrow.symbol}</span>
                    <span className="text-sm font-semibold text-red-600 dark:text-red-400">{formatDollar(borrow.value_usd || 0)}</span>
                  </div>
                  <div className="text-xs text-gray-500">
                    Amount: {formatNumber(borrow.amount || 0)}
                  </div>
                </div>
              ))}
            </div>
            
            {/* Desktop layout - table */}
            <div className="hidden md:block">
          <Table>
            <TableHeader>
              <TableRow>
                    <TableHead className="text-xs">Token</TableHead>
                    <TableHead className="text-xs">Amount</TableHead>
                    <TableHead className="text-xs">Value</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {position.borrows.map((borrow, index) => (
                <TableRow key={index}>
                      <TableCell className="text-sm">{borrow.token || borrow.symbol}</TableCell>
                      <TableCell className="text-sm">{formatNumber(borrow.amount || 0)}</TableCell>
                      <TableCell className="text-sm">{formatDollar(borrow.value_usd || 0)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
            </div>
          </div>
        ) : (
          <p className="text-xs md:text-sm text-gray-500">No borrowed assets</p>
        )}
      </div>
    </div>
  );
}

interface LiquidityPositionCardProps {
  position: EvmLiquidityPosition;
}

function LiquidityPositionCard({ position }: LiquidityPositionCardProps) {
  return (
    <div className="border rounded-lg p-4 space-y-4">
      <div>
        <h3 className="text-lg font-medium">{position.protocol}</h3>
        <p className="text-sm text-gray-500">{position.name}</p>
        <p className="font-medium mt-1">Value: {formatDollar(position.total_value_usd || 0)}</p>
      </div>

      <div className="space-y-2">
        <h4 className="text-sm font-medium">Liquidity Tokens</h4>
        {position.tokens && position.tokens.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Token</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Value</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {position.tokens.map((token, index) => (
                <TableRow key={index}>
                  <TableCell>{token.token || token.symbol}</TableCell>
                  <TableCell>{formatNumber(token.amount || 0)}</TableCell>
                  <TableCell>{formatDollar(token.value_usd || 0)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <p className="text-sm text-gray-500">No liquidity tokens</p>
        )}
      </div>

      {position.rewards && position.rewards.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Rewards</h4>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Token</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Value</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {position.rewards.map((reward: EvmTokenAmount, index: number) => {
                // Calculate price if not provided
                const calculatedPrice = reward.price_usd || (reward.amount && reward.amount > 0 ? (reward.value_usd || 0) / reward.amount : 0);
                
                return (
                <TableRow key={index}>
                    <TableCell>{reward.token || reward.symbol}</TableCell>
                    <TableCell>{formatNumber(reward.amount || 0)}</TableCell>
                    <TableCell>{formatDollar(calculatedPrice)}</TableCell>
                </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}

interface StakingPositionCardProps {
  position: EvmStakingPosition;
}

function StakingPositionCard({ position }: StakingPositionCardProps) {
  return (
    <div className="border rounded-lg p-4 space-y-4">
      <div>
        <h3 className="text-lg font-medium">{position.protocol}</h3>
        <p className="text-sm text-gray-500">{position.name}</p>
        <div className="flex justify-between mt-1">
          <p className="font-medium">Value: {formatDollar(position.total_value_usd || 0)}</p>
          <Badge variant="outline">APR: {((position.apr || 0) * 100).toFixed(2)}%</Badge>
        </div>
      </div>

      <div className="space-y-2">
        <h4 className="text-sm font-medium">Staked Tokens</h4>
        {position.tokens && position.tokens.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Token</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Value</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {position.tokens.map((token, index) => (
                <TableRow key={index}>
                  <TableCell>{token.token || token.symbol}</TableCell>
                  <TableCell>{formatNumber(token.amount || 0)}</TableCell>
                  <TableCell>{formatDollar(token.value_usd || 0)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <p className="text-sm text-gray-500">No staked tokens</p>
        )}
      </div>

      {position.rewards && position.rewards.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Rewards</h4>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Token</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Value</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {position.rewards.map((reward, index) => (
                <TableRow key={index}>
                  <TableCell>{reward.token || reward.symbol}</TableCell>
                  <TableCell>{formatNumber(reward.amount || 0)}</TableCell>
                  <TableCell>{formatDollar(reward.value_usd || 0)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
} 