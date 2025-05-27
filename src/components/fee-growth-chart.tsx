'use client';

import { useState, useEffect } from 'react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, 
  Legend, ResponsiveContainer
} from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

interface FeeGrowthChartProps {
  walletAddress: string;
}

interface ApiGrowthDataItem {
  timestamp: string;
  hourly_rates?: { total?: number };
  current_fees?: { total?: number; whirlpool?: number; raydium?: number };
}

interface ChartDataPoint {
  timestamp: Date;
  hourlyRate: number;
  totalFees: number;
  whirlpoolFees: number;
  raydiumFees: number;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    payload: ChartDataPoint; 
    value?: number; 
    name?: string;
  }>;
}

export default function FeeGrowthChart({ walletAddress }: FeeGrowthChartProps) {
  const [timeframe, setTimeframe] = useState('7d');
  const [portfolioData, setPortfolioData] = useState<ChartDataPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Fetch fee growth data
  useEffect(() => {
    if (!walletAddress) return;
    
    const fetchFeeGrowthData = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/fee-growth/${walletAddress}?timeframe=${timeframe}`);
        if (!response.ok) {
          throw new Error('Failed to fetch fee growth data');
        }
        const data = await response.json();
        
        if (data.growth_data && data.growth_data.length > 0) {
          const formattedData = data.growth_data.map((item: ApiGrowthDataItem) => ({
            timestamp: new Date(item.timestamp),
            hourlyRate: item.hourly_rates?.total || 0,
            totalFees: item.current_fees?.total || 0,
            whirlpoolFees: item.current_fees?.whirlpool || 0,
            raydiumFees: item.current_fees?.raydium || 0
          }));
          
          setPortfolioData(formattedData);
        } else {
          setPortfolioData([]);
        }
        
        setError(null);
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        console.error('Error fetching fee growth data:', err);
        setError(message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchFeeGrowthData();
  }, [walletAddress, timeframe]);
  
  // Format date for display
  const formatDate = (timestamp: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'numeric',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    }).format(timestamp);
  };
  
  // Custom tooltip for the chart
  const CustomTooltip = ({ active, payload }: CustomTooltipProps) => {
    if (active && payload && payload.length) {
      const dataPoint = payload[0].payload;
      const seriesValue = payload[0].value;
      return (
        <div className="bg-white p-3 border rounded shadow-md">
          <p className="font-medium">Time: {formatDate(dataPoint.timestamp)}</p>
          <p className="text-orange-500">Hourly Fee Rate: ${seriesValue?.toFixed(4)}/hr</p>
        </div>
      );
    }
    return null;
  };
  
  return (
    <Card className="w-full mt-6">
      <CardHeader>
        <div className="flex justify-between items-center flex-wrap gap-4">
          <div>
            <CardTitle>Fee Growth Analysis</CardTitle>
            <CardDescription>
              Track the growth rate of uncollected fees over time
            </CardDescription>
          </div>
          <div className="flex items-center gap-4">
            <Select value={timeframe} onValueChange={setTimeframe}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select timeframe" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="24h">Last 24 Hours</SelectItem>
                <SelectItem value="7d">Last 7 Days</SelectItem>
                <SelectItem value="30d">Last 30 Days</SelectItem>
                <SelectItem value="90d">Last 90 Days</SelectItem>
                <SelectItem value="1y">Last Year</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="hourly" className="space-y-4">
          <TabsList>
            <TabsTrigger value="hourly">Hourly Rate</TabsTrigger>
          </TabsList>
          
          <TabsContent value="hourly" className="space-y-4">
            <div className="h-[300px]">
              {loading ? (
                <div className="flex justify-center items-center h-full">
                  <p>Loading rate data...</p>
                </div>
              ) : error ? (
                <div className="flex justify-center items-center h-full">
                  <p className="text-red-500">{error}</p>
                </div>
              ) : portfolioData.length === 0 ? (
                <div className="flex justify-center items-center h-full">
                  <p>No rate data available yet. Data will appear after multiple snapshots are collected.</p>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart 
                    data={portfolioData}
                    margin={{ top: 5, right: 20, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="timestamp" 
                      tickFormatter={(tick) => formatDate(tick)}
                      interval="preserveEnd"
                      minTickGap={60}
                    />
                    <YAxis 
                      tickFormatter={(value) => `$${value.toFixed(2)}/hr`}
                      domain={['auto', 'auto']}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="hourlyRate"
                      name="Hourly Fee Rate"
                      stroke="#ff7300"
                      strokeWidth={2}
                      dot={{ r: 3 }}
                      activeDot={{ r: 8 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
} 