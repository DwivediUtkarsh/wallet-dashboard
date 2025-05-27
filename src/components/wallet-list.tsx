import { WalletInfo } from "@/types/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { formatDate } from "@/lib/utils";

interface WalletListProps {
  wallets: WalletInfo[];
}

export default function WalletList({ wallets }: WalletListProps) {
  if (!wallets || wallets.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Wallets</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500">No wallets found</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Tracked Wallets</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-1">
          {wallets.map((wallet) => (
            <Link
              key={wallet.id}
              href={`/dashboard/${wallet.address}`}
              className="block p-3 rounded-lg transition-colors hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <div className="flex justify-between items-center">
                <div>
                  <div className="font-medium">{wallet.label}</div>
                  <div className="text-sm text-gray-500 font-mono truncate max-w-[200px] md:max-w-[300px]">
                    {wallet.address}
                  </div>
                </div>
                <div className="text-sm text-gray-500">
                  {formatDate(wallet.updated_at)}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  );
} 