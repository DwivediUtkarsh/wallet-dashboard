// Type definitions for the wallet tracker API

export interface WalletInfo {
  id: number;
  address: string;
  label: string;
  created_at: string;
  updated_at: string;
  chain?: 'solana' | 'hyperliquid' | 'evm';
  total_value_usd?: number;
}

export interface TokenBalance {
  symbol: string;
  name: string;
  amount: number;
  price_usd: number;
  value_usd: number;
  updated_at: string;
}

export interface LPPosition {
  pool: string;
  token_a_symbol: string;
  token_b_symbol: string;
  token_a_qty: number;
  token_b_qty: number;
  total_value_usd: number;
  in_range: boolean;
  uncollected_fees_usd: number;
  updated_at: string;
}

// For aggregated data in the summary endpoints
export interface AggregatedLPPosition {
  pool: string;
  token_a_symbol: string;
  token_b_symbol: string;
  token_a_qty: number;
  token_b_qty: number;
  total_value_usd: number;
  uncollected_fees_usd: number;
  position_count: number;
  in_range_count: number;
}

export interface MarginfiDeposit {
  token: string;
  amount: number;
  value_usd: number;
  apr: number;
}

export interface MarginfiBorrow {
  token: string;
  amount: number;
  value_usd: number;
  apr: number;
}

export interface MarginfiAccount {
  account_address: string;
  total_collateral_value: number;
  total_borrow_value: number;
  net_value: number;
  health_ratio: number;
  health_status: string;
  deposits: MarginfiDeposit[];
  borrows: MarginfiBorrow[];
}

export interface MarginfiSummary {
  total_collateral_value: number;
  total_borrow_value: number;
  net_value: number;
  account_count: number;
}

export interface KaminoSupply {
  token: string;
  amount: number;
  value_usd: number;
  apr: number;
}

export interface KaminoBorrow {
  token: string;
  amount: number;
  value_usd: number;
  apr: number;
}

export interface KaminoAccount {
  market_address: string;
  obligation_address: string;
  total_supplied_value_usd: number;
  total_borrowed_value_usd: number;
  net_value_usd: number;
  health_ratio: number;
  supplies: KaminoSupply[];
  borrows: KaminoBorrow[];
}

export interface KaminoLendSummary {
  total_supplied_value: number;
  total_borrowed_value: number;
  net_value: number;
  account_count: number;
}

export interface HyperliquidPosition {
  coin: string;
  size: number;
  position_value: number;
  entry_price: number;
  mark_price: number;
  margin: number;
  leverage: number;
  leverage_type: string;
  pnl: number;
  pnl_percent: number;
  liq_price: number;
  risk_level: 'low' | 'medium' | 'high';
  is_long: boolean;
  funding_usd: number;
  updated_at: string;
}

export interface HyperliquidAccount {
  total_equity: number;
  perps_equity: number;
  total_volume: number;
  pnl_24h: number;
  volume_24h: number;
  unrealized_pnl: number;
  realized_pnl: number;
  total_pnl: number;
  margin_ratio: number;
  account_health: string;
  funding_paid_24h: number;
  funding_paid_total: number;
  roi_7d: number;
  roi_30d: number;
  roi_all_time: number;
  updated_at: string;
}

export interface HyperliquidFunding {
  coin: string;
  latest_rate: number;
  latest_timestamp: number;
  latest_amount: number;
  total_amount: number;
  updated_at: string;
  recent_payments: Array<{
    rate: number;
    amount: number;
    timestamp: number;
  }>;
}

export interface HyperliquidChartPoint {
  date_point: string;
  equity_value: number;
  pnl_value: number;
}

export interface HyperliquidSummary {
  total_equity: number;
  perps_equity: number;
  unrealized_pnl: number;
  total_pnl: number;
  funding_paid_24h: number;
  account_count: number;
  high_risk_count: number;
}

export interface PortfolioSummary {
  token_value: number;
  whirlpool_value: number;
  raydium_value: number;
  whirlpool_fees: number;
  raydium_fees: number;
  total_fees: number;
  marginfi_value: number;
  kamino_value: number;
  hyperliquid_value: number;
  hyperliquid_pnl: number;
  evm_value?: number;
  total_value: number;
}

export interface PortfolioSummaryData {
  wallet_count: number;
  token_balances: TokenBalance[];
  whirlpool_positions: AggregatedLPPosition[];
  raydium_positions: AggregatedLPPosition[];
  marginfi_summary: MarginfiSummary;
  kamino_lend_summary: KaminoLendSummary;
  hyperliquid_summary: HyperliquidSummary;
  evm_summary?: EvmSummary;
  summary: PortfolioSummary;
}

export interface PortfolioData {
  wallet_address?: string;
  chain?: 'solana' | 'hyperliquid' | 'evm';
  token_balances: TokenBalance[];
  whirlpool_positions: LPPosition[];
  raydium_positions: LPPosition[];
  marginfi_accounts: MarginfiAccount[];
  kamino_accounts: KaminoAccount[];
  hyperliquid_account: HyperliquidAccount | null;
  hyperliquid_positions: HyperliquidPosition[];
  hyperliquid_chart: HyperliquidChartPoint[];
  evm_data?: EvmPortfolioData;
  summary: PortfolioSummary;
}

// EVM related interfaces
export interface EvmPortfolioData {
  chains: EvmChainData[];
  total_value_usd: number;
}

export interface EvmChainData {
  chain_id: string; // 'ARB', 'BASE', 'MATIC', etc.
  name: string; // 'Arbitrum', 'Base', 'Polygon', etc.
  token_balances: EvmTokenBalance[];
  lending_positions: EvmLendingPosition[];
  liquidity_positions: EvmLiquidityPosition[];
  staking_positions: EvmStakingPosition[];
  total_value_usd: number;
}

export interface EvmTokenBalance {
  token: string;
  symbol: string;
  balance: number;
  price_usd: number;
  value_usd: number;
  updated_at: string;
}

export interface EvmLendingPosition {
  protocol: string; // 'AAVE3', etc.
  name: string;
  health_rate: number;
  total_supplied_value_usd: number;
  total_borrowed_value_usd: number;
  net_value_usd: number;
  supplies: EvmTokenAmount[];
  borrows: EvmTokenAmount[];
}

export interface EvmLiquidityPosition {
  protocol: string; // 'UNISWAP4', 'AERODROME3', etc.
  name: string;
  total_value_usd: number;
  tokens: EvmTokenAmount[];
  rewards: EvmTokenAmount[];
}

export interface EvmStakingPosition {
  protocol: string;
  name: string;
  total_value_usd: number;
  apr: number;
  tokens: EvmTokenAmount[];
  rewards: EvmTokenAmount[];
}

export interface EvmTokenAmount {
  token: string;
  symbol: string;
  amount: number;
  price_usd: number;
  value_usd: number;
}

export interface EvmSummary {
  total_value: number;
  chain_count: number;
  lending_value: number;
  liquidity_value: number;
  staking_value: number;
  token_value: number;
} 