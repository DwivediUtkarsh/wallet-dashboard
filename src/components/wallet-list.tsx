import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { WalletInfo } from "@/types/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDollar } from "@/lib/utils";
import { Badge } from "./ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from '@/components/ui/input';

interface WalletListProps {
  wallets: WalletInfo[];
}

export default function WalletList({ wallets }: WalletListProps) {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('all');

  // Filter wallets based on search term and active tab
  const filteredWallets = wallets.filter(wallet => {
    const matchesSearch = wallet.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          wallet.label?.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (activeTab === 'all') {
      return matchesSearch;
    } else {
      return matchesSearch && wallet.chain === activeTab;
    }
  });

  // Group wallets by chain for wallet count display
  const solanaWallets = wallets.filter(w => w.chain === 'solana');
  const evmWallets = wallets.filter(w => w.chain === 'evm');
  const hyperliquidWallets = wallets.filter(w => w.chain === 'hyperliquid');

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <CardTitle>Wallets</CardTitle>
          <div className="w-full md:w-1/3">
            <Input 
              placeholder="Search wallets..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-4">
            <TabsTrigger value="all">
              All ({wallets.length})
            </TabsTrigger>
            <TabsTrigger value="solana">
              Solana ({solanaWallets.length})
            </TabsTrigger>
            <TabsTrigger value="evm">
              EVM ({evmWallets.length})
            </TabsTrigger>
            <TabsTrigger value="hyperliquid">
              Hyperliquid ({hyperliquidWallets.length})
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Label</TableHead>
              <TableHead>Address</TableHead>
              <TableHead>Chain</TableHead>
              <TableHead className="text-right">Total Value</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredWallets.map((wallet) => (
              <TableRow 
                key={wallet.address} 
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => router.push(`/dashboard/${wallet.address}`)}
              >
                <TableCell className="font-medium">{wallet.label}</TableCell>
                <TableCell>{wallet.address.substring(0, 8)}...{wallet.address.substring(wallet.address.length - 6)}</TableCell>
                <TableCell>
                  <Badge variant={
                    wallet.chain === 'solana' ? "default" : 
                    wallet.chain === 'evm' ? "secondary" : 
                    "outline"
                  }>
                    {wallet.chain === 'solana' ? 'Solana' : 
                     wallet.chain === 'evm' ? 'EVM' : 
                     'Hyperliquid'}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  {formatDollar(wallet.total_value_usd || 0)}
                </TableCell>
              </TableRow>
            ))}
            {filteredWallets.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-4">
                  No wallets found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
} 