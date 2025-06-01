import { EvmPortfolioData, EvmChainData, EvmLendingPosition, EvmLiquidityPosition, EvmStakingPosition, EvmTokenAmount } from "@/types/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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

interface EvmDashboardProps {
  data: EvmPortfolioData;
}

export default function EvmDashboard({ data }: EvmDashboardProps) {
  if (!data || !data.chains || data.chains.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>EVM Portfolio</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500">No EVM data available for this wallet</p>
        </CardContent>
      </Card>
    );
  }

  // Sort chains by value
  const sortedChains = [...data.chains].sort((a, b) => b.total_value_usd - a.total_value_usd);
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>EVM Portfolio Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 border rounded-lg">
              <h3 className="text-sm font-medium text-gray-500">Total Value</h3>
              <p className="text-2xl font-bold">{formatDollar(data.total_value_usd)}</p>
            </div>
            <div className="p-4 border rounded-lg">
              <h3 className="text-sm font-medium text-gray-500">Chains</h3>
              <p className="text-2xl font-bold">{data.chains.length}</p>
            </div>
            <div className="p-4 border rounded-lg">
              <h3 className="text-sm font-medium text-gray-500">Token Count</h3>
              <p className="text-2xl font-bold">
                {data.chains.reduce((sum, chain) => sum + chain.token_balances.length, 0)}
              </p>
            </div>
            <div className="p-4 border rounded-lg">
              <h3 className="text-sm font-medium text-gray-500">Positions</h3>
              <p className="text-2xl font-bold">
                {data.chains.reduce((sum, chain) => 
                  sum + 
                  chain.lending_positions.length + 
                  chain.liquidity_positions.length + 
                  chain.staking_positions.length, 0)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue={sortedChains[0]?.chain_id} className="w-full">
        <TabsList className="grid w-full" style={{ gridTemplateColumns: `repeat(${Math.min(sortedChains.length, 5)}, 1fr)` }}>
          {sortedChains.map(chain => (
            <TabsTrigger key={chain.chain_id} value={chain.chain_id}>
              {chain.name}
            </TabsTrigger>
          ))}
        </TabsList>
        
        {sortedChains.map(chain => (
          <TabsContent key={chain.chain_id} value={chain.chain_id} className="mt-4 space-y-6">
            <ChainDashboard chain={chain} />
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}

interface ChainDashboardProps {
  chain: EvmChainData;
}

function ChainDashboard({ chain }: ChainDashboardProps) {
  // Filter tokens with value greater than $1
  const filteredTokens = chain.token_balances.filter(token => token.value_usd > 1);
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{chain.name} Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 border rounded-lg">
              <h3 className="text-sm font-medium text-gray-500">Total Value</h3>
              <p className="text-2xl font-bold">{formatDollar(chain.total_value_usd)}</p>
            </div>
            <div className="p-4 border rounded-lg">
              <h3 className="text-sm font-medium text-gray-500">Tokens</h3>
              <p className="text-2xl font-bold">{chain.token_balances.length}</p>
              <p className="text-xs text-gray-500">{filteredTokens.length} with value {'>'} $1</p>
            </div>
            <div className="p-4 border rounded-lg">
              <h3 className="text-sm font-medium text-gray-500">Lending Positions</h3>
              <p className="text-2xl font-bold">{chain.lending_positions.length}</p>
            </div>
            <div className="p-4 border rounded-lg">
              <h3 className="text-sm font-medium text-gray-500">Liquidity Positions</h3>
              <p className="text-2xl font-bold">{chain.liquidity_positions.length}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {filteredTokens.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Token Balances (Value {'>'} $1)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Token</TableHead>
                    <TableHead>Balance</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Value</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTokens.map((token, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{token.symbol}</TableCell>
                      <TableCell>{typeof token.balance === 'number' ? formatNumber(token.balance) : formatNumber(parseFloat(token.balance as string) || 0)}</TableCell>
                      <TableCell>{formatDollar(token.price_usd)}</TableCell>
                      <TableCell>{formatDollar(token.value_usd)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {chain.lending_positions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Lending Positions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {chain.lending_positions.map((position, index) => (
                <LendingPositionCard key={index} position={position} />
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {chain.liquidity_positions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Liquidity Positions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {chain.liquidity_positions.map((position, index) => (
                <LiquidityPositionCard key={index} position={position} />
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {chain.staking_positions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Staking Positions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {chain.staking_positions.map((position, index) => (
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
  const healthStatus = position.health_rate > 2 ? "Excellent" : 
                       position.health_rate > 1.5 ? "Good" : 
                       position.health_rate > 1.2 ? "Fair" : "Poor";
  
  const healthColor = position.health_rate > 2 ? "bg-green-100 text-green-800" : 
                      position.health_rate > 1.5 ? "bg-blue-100 text-blue-800" : 
                      position.health_rate > 1.2 ? "bg-yellow-100 text-yellow-800" : 
                      "bg-red-100 text-red-800";

  return (
    <div className="border rounded-lg p-4 space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-medium">{position.protocol}</h3>
          <p className="text-sm text-gray-500">{position.name}</p>
        </div>
        <Badge className={healthColor}>
          Health: {healthStatus} ({position.health_rate.toFixed(2)})
        </Badge>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <p className="text-sm text-gray-500">Supplied</p>
          <p className="font-medium">{formatDollar(position.total_supplied_value_usd)}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Borrowed</p>
          <p className="font-medium">{formatDollar(position.total_borrowed_value_usd)}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Net Value</p>
          <p className="font-medium">{formatDollar(position.net_value_usd)}</p>
        </div>
      </div>

      <div className="space-y-2">
        <h4 className="text-sm font-medium">Supplied Assets</h4>
        {position.supplies.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Token</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Value</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {position.supplies.map((supply, index) => (
                <TableRow key={index}>
                  <TableCell>{supply.token}</TableCell>
                  <TableCell>{formatNumber(supply.amount)}</TableCell>
                  <TableCell>{formatDollar(supply.value_usd)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <p className="text-sm text-gray-500">No supplied assets</p>
        )}
      </div>

      <div className="space-y-2">
        <h4 className="text-sm font-medium">Borrowed Assets</h4>
        {position.borrows.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Token</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Value</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {position.borrows.map((borrow, index) => (
                <TableRow key={index}>
                  <TableCell>{borrow.token}</TableCell>
                  <TableCell>{formatNumber(borrow.amount)}</TableCell>
                  <TableCell>{formatDollar(borrow.value_usd)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <p className="text-sm text-gray-500">No borrowed assets</p>
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
        <p className="font-medium mt-1">Value: {formatDollar(position.total_value_usd)}</p>
      </div>

      <div className="space-y-2">
        <h4 className="text-sm font-medium">Liquidity Tokens</h4>
        {position.tokens.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Token</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Value</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {position.tokens.map((token: EvmTokenAmount, index: number) => (
                <TableRow key={index}>
                  <TableCell>{token.token}</TableCell>
                  <TableCell>{formatNumber(token.amount)}</TableCell>
                  <TableCell>{formatDollar(token.price_usd)}</TableCell>
                  <TableCell>{formatDollar(token.value_usd)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <p className="text-sm text-gray-500">No liquidity tokens</p>
        )}
      </div>

      {position.rewards.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Rewards</h4>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Token</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Value</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {position.rewards.map((reward: EvmTokenAmount, index: number) => (
                <TableRow key={index}>
                  <TableCell>{reward.token}</TableCell>
                  <TableCell>{formatNumber(reward.amount)}</TableCell>
                  <TableCell>{formatDollar(reward.price_usd)}</TableCell>
                  <TableCell>{formatDollar(reward.value_usd)}</TableCell>
                </TableRow>
              ))}
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
          <p className="font-medium">Value: {formatDollar(position.total_value_usd)}</p>
          <Badge variant="outline">APR: {(position.apr * 100).toFixed(2)}%</Badge>
        </div>
      </div>

      <div className="space-y-2">
        <h4 className="text-sm font-medium">Staked Tokens</h4>
        {position.tokens.length > 0 ? (
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
                  <TableCell>{token.token}</TableCell>
                  <TableCell>{formatNumber(token.amount)}</TableCell>
                  <TableCell>{formatDollar(token.value_usd)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <p className="text-sm text-gray-500">No staked tokens</p>
        )}
      </div>

      {position.rewards.length > 0 && (
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
                  <TableCell>{reward.token}</TableCell>
                  <TableCell>{formatNumber(reward.amount)}</TableCell>
                  <TableCell>{formatDollar(reward.value_usd)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
} 