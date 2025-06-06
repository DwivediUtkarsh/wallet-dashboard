'use client';

import Link from 'next/link';
import { Card, CardContent } from './ui/card';
import { Tabs, TabsList, TabsTrigger } from './ui/tabs';
import { truncateAddress } from '../lib/utils';
import { WalletIcon, DocumentDuplicateIcon } from '@heroicons/react/24/outline';
import { Button } from './ui/button';
import { toast } from 'sonner';

interface WalletHeaderProps {
  address: string;
  activeTab?: string;
}

export function WalletHeader({ address, activeTab = 'overview' }: WalletHeaderProps) {
  
  const handleCopyAddress = () => {
    navigator.clipboard.writeText(address);
    toast.success('Address copied to clipboard');
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
      <Card className="border-0 shadow-lg bg-card/50 backdrop-blur-sm overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 opacity-30" />
        <CardContent className="relative pt-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg">
                <WalletIcon className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  {truncateAddress(address)}
                </h1>
                <p className="text-sm text-muted-foreground font-mono">{address}</p>
              </div>
            </div>
            
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleCopyAddress}
              className="bg-background/50 backdrop-blur-sm hover:bg-background/80 transition-all duration-200 group"
            >
              <DocumentDuplicateIcon className="h-4 w-4 mr-2 group-hover:scale-110 transition-transform" />
              Copy Address
            </Button>
          </div>
          
          <Tabs value={activeTab} className="w-full">
            <TabsList className="grid grid-cols-4 w-full md:w-auto p-1 bg-gradient-to-r from-muted/50 to-muted/30 backdrop-blur-sm">
              <TabsTrigger value="overview" asChild className="text-sm font-medium">
                <Link href={`/wallet/${address}`}>📊 Overview</Link>
              </TabsTrigger>
              <TabsTrigger value="positions" asChild className="text-sm font-medium">
                <Link href={`/wallet/${address}/positions`}>💼 Positions</Link>
              </TabsTrigger>
              <TabsTrigger value="fee-collections" asChild className="text-sm font-medium">
                <Link href={`/wallet/${address}/fee-collections`}>💰 Fees</Link>
              </TabsTrigger>
              <TabsTrigger value="history" asChild className="text-sm font-medium">
                <Link href={`/wallet/${address}/history`}>📈 History</Link>
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
} 