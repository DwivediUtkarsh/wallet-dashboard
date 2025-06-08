import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { WalletInfo } from "@/types/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDollar } from "@/lib/utils";
import { Badge } from "./ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from '@/components/ui/input';
import { 
  MagnifyingGlassIcon, 
  WalletIcon,
  ArrowTopRightOnSquareIcon,
  CurrencyDollarIcon
} from "@heroicons/react/24/outline";

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
  const suiWallets = wallets.filter(w => w.chain === 'sui');

  const getChainConfig = (chain: string) => {
    switch (chain) {
      case 'solana':
        return {
          name: '🟣 Solana',
          variant: 'default' as const,
          gradient: 'from-purple-500 to-pink-500',
          bgGradient: 'from-purple-500/10 to-pink-500/10'
        };
      case 'evm':
        return {
          name: '🔷 EVM',
          variant: 'secondary' as const,
          gradient: 'from-blue-500 to-indigo-500',
          bgGradient: 'from-blue-500/10 to-indigo-500/10'
        };
      case 'hyperliquid':
        return {
          name: '⚡ Hyperliquid',
          variant: 'outline' as const,
          gradient: 'from-orange-500 to-red-500',
          bgGradient: 'from-orange-500/10 to-red-500/10'
        };
      case 'sui':
        return {
          name: '🌊 Sui',
          variant: 'destructive' as const,
          gradient: 'from-teal-500 to-cyan-500',
          bgGradient: 'from-teal-500/10 to-cyan-500/10'
        };
      default:
        return {
          name: 'Unknown',
          variant: 'outline' as const,
          gradient: 'from-gray-500 to-gray-600',
          bgGradient: 'from-gray-500/10 to-gray-600/10'
        };
    }
  };

  return (
    <Card className="border-0 shadow-lg bg-card/50 backdrop-blur-sm">
      <CardHeader className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <CardTitle className="flex items-center gap-2 text-2xl">
            <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg text-white">
              <WalletIcon className="h-5 w-5" />
            </div>
            Wallets
          </CardTitle>
          <div className="relative w-full md:w-1/3">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search wallets..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-background/50 backdrop-blur-sm"
            />
          </div>
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-5 p-1 bg-gradient-to-r from-muted/50 to-muted/30 backdrop-blur-sm">
            <TabsTrigger value="all" className="text-xs md:text-sm">
              All ({wallets.length})
            </TabsTrigger>
            <TabsTrigger value="solana" className="text-xs md:text-sm">
              🟣 Solana ({solanaWallets.length})
            </TabsTrigger>
            <TabsTrigger value="evm" className="text-xs md:text-sm">
              🔷 EVM ({evmWallets.length})
            </TabsTrigger>
            <TabsTrigger value="hyperliquid" className="text-xs md:text-sm">
              ⚡ HL ({hyperliquidWallets.length})
            </TabsTrigger>
            <TabsTrigger value="sui" className="text-xs md:text-sm">
              🌊 Sui ({suiWallets.length})
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </CardHeader>
      
      <CardContent>
        {filteredWallets.length === 0 ? (
          <div className="text-center py-12">
            <WalletIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-lg font-medium text-muted-foreground">No wallets found</p>
            <p className="text-sm text-muted-foreground">Try adjusting your search terms</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredWallets.map((wallet, index) => {
              const chainConfig = getChainConfig(wallet.chain || 'unknown');
              
              return (
                <div
                key={wallet.address} 
                  className="animate-in fade-in slide-in-from-bottom-2 duration-500"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <Card 
                    className="group relative overflow-hidden border-0 shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer hover:-translate-y-1"
                onClick={() => router.push(`/dashboard/${wallet.address}`)}
              >
                    {/* Background gradient */}
                    <div className={`absolute inset-0 bg-gradient-to-br ${chainConfig.bgGradient} opacity-30 group-hover:opacity-50 transition-opacity duration-300`} />
                    
                    {/* Content */}
                    <div className="relative p-4 space-y-3">
                      {/* Header */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className={`p-1.5 rounded-md bg-gradient-to-r ${chainConfig.gradient} text-white`}>
                            <WalletIcon className="h-3 w-3" />
                          </div>
                          <h3 className="font-semibold text-sm truncate">
                            {wallet.label || 'Unlabeled Wallet'}
                          </h3>
                        </div>
                        <ArrowTopRightOnSquareIcon className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                      </div>

                      {/* Address */}
                      <div className="space-y-2">
                        <div className="text-xs text-muted-foreground font-mono bg-muted/50 px-2 py-1 rounded">
                          {wallet.address.substring(0, 8)}...{wallet.address.substring(wallet.address.length - 6)}
                        </div>
                        
                        {/* Chain Badge */}
                        <Badge variant={chainConfig.variant} className="text-xs">
                          {chainConfig.name}
                  </Badge>
                      </div>

                      {/* Value */}
                      <div className="flex items-center justify-between pt-2 border-t border-border/50">
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <CurrencyDollarIcon className="h-3 w-3" />
                          <span>Total Value</span>
                        </div>
                        <div className={`text-lg font-bold bg-gradient-to-r ${chainConfig.gradient} bg-clip-text text-transparent`}>
                  {formatDollar(wallet.total_value_usd || 0)}
                        </div>
                      </div>
                    </div>
                  </Card>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
} 