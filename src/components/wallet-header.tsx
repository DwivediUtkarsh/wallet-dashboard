'use client';

import Link from 'next/link';
import { Card, CardContent } from './ui/card';
import { Tabs, TabsList, TabsTrigger } from './ui/tabs';
import { truncateAddress } from '../lib/utils';

interface WalletHeaderProps {
  address: string;
  activeTab?: string;
}

export function WalletHeader({ address, activeTab = 'overview' }: WalletHeaderProps) {
  
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold">{truncateAddress(address)}</h1>
            <p className="text-sm text-muted-foreground">{address}</p>
          </div>
        </div>
        
        <Tabs value={activeTab} className="w-full">
          <TabsList className="grid grid-cols-4 w-full md:w-auto">
            <TabsTrigger value="overview" asChild>
              <Link href={`/wallet/${address}`}>Overview</Link>
            </TabsTrigger>
            <TabsTrigger value="positions" asChild>
              <Link href={`/wallet/${address}/positions`}>Positions</Link>
            </TabsTrigger>
            <TabsTrigger value="fee-collections" asChild>
              <Link href={`/wallet/${address}/fee-collections`}>Fee Collections</Link>
            </TabsTrigger>
            <TabsTrigger value="history" asChild>
              <Link href={`/wallet/${address}/history`}>History</Link>
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </CardContent>
    </Card>
  );
} 