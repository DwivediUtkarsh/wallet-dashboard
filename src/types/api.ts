// Type definitions for the wallet tracker API

export interface WalletInfo {
  id: number;
  address: string;
  label: string;
  created_at: string;
  updated_at: string;
  chain?: 'solana' | 'hyperliquid' | 'evm' | 'sui';
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

// For the top tokens feature
export interface TokenWalletData {
  address: string;
  label?: string;
  value_usd: number;
  amount: number;
}

export interface TopTokenData {
  symbol: string;
  name: string;
  total_amount: number;
  price_usd: number;
  total_value_usd: number;
  wallets: TokenWalletData[];
}

// For the exposure feature - tracks tokens across all protocols and positions
export interface TokenExposureSource {
  source_type: 'direct_solana' | 'direct_evm' | 'direct_sui' | 
              'lp_position_a' | 'lp_position_b' | 
              'marginfi_deposit' | 'marginfi_borrow' |
              'kamino_supply' | 'kamino_borrow' |
              'evm_liquidity' | 'evm_lending_supply' | 'evm_lending_borrow' | 'evm_staking' |
              'sui_bluefin_a' | 'sui_bluefin_b' | 'sui_lend_deposit' | 'sui_lend_borrow' |
              'hyperliquid_staking';
  amount: number;
  value_usd: number;
  avg_price_usd: number;
  wallet_count: number;
}

export interface TokenExposureData {
  symbol: string;
  name: string;
  token_address: string;
  total_amount: number;
  total_value_usd: number;
  price_usd: number;
  portfolio_percentage: number;
  wallet_count: number;
  source_count: number;
  sources: TokenExposureSource[];
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
  protocol?: 'whirlpool' | 'raydium';
  position_address?: string;
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

export interface HyperliquidStakingDelegation {
  validator: string;
  amount: number;
  locked_until: string | null;
}

export interface HyperliquidStaking {
  delegated_amount: number;
  undelegated_amount: number;
  pending_withdrawal_amount: number;
  pending_withdrawal_count: number;
  usd_value: number;
  token_symbol: string;
  delegations: HyperliquidStakingDelegation[];
  updated_at: string;
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

// CEX related interfaces
export interface CexWallet {
  wallet_name: string;
  net_total_value: number;
  last_updated: string;
}

export interface CexSummary {
  wallets: CexWallet[];
  total_value: number;
  wallet_count: number;
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
  hyperliquid_staking_value: number;
  evm_value?: number;
  sui_token_value?: number;
  sui_bluefin_value?: number;
  sui_bluefin_fees?: number;
  sui_suilend_value?: number;
  sui_total_value?: number;
  cex_value: number;
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
  sui_summary?: SuiSummary;
  cex_summary: CexSummary;
  summary: PortfolioSummary;
}

export interface PortfolioData {
  wallet_address?: string;
  chain?: 'solana' | 'hyperliquid' | 'evm' | 'sui';
  token_balances: TokenBalance[];
  whirlpool_positions: LPPosition[];
  raydium_positions: LPPosition[];
  marginfi_accounts: MarginfiAccount[];
  kamino_accounts: KaminoAccount[];
  hyperliquid_account: HyperliquidAccount | null;
  hyperliquid_positions: HyperliquidPosition[];
  hyperliquid_chart: HyperliquidChartPoint[];
  hyperliquid_staking: HyperliquidStaking | null;
  evm_data?: EvmPortfolioData;
  sui_data?: SuiPortfolioData;
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

// Sui-specific types
export interface SuiTokenBalance {
  symbol: string;
  coin_type: string;
  name: string;
  amount: number;
  price_usd: number;
  value_usd: number;
  updated_at: string;
}

export interface SuiBluefinPosition {
  pool: string;
  token_a: string;
  token_b: string;
  amount_a: number;
  amount_b: number;
  usd_value: number;
  position_id: string;
  tick_lower: number;
  tick_upper: number;
  in_range: boolean;
  uncollected_fees_usd: number;
  updated_at: string;
}

export interface SuiLendPosition {
  symbol: string;
  type: 'deposit' | 'borrow';
  amount: number;
  usd_value: number;
  coin_type: string;
  market_address: string;
  apr: number;
  net_usd: number;
  updated_at: string;
}

export interface SuiPortfolioData {
  wallet_address: string;
  chain: 'sui';
  token_balances: SuiTokenBalance[];
  bluefin_positions: SuiBluefinPosition[];
  suilend_positions: SuiLendPosition[];
  summary: {
    total_token_value: number;
    total_bluefin_value: number;
    total_bluefin_fees: number;
    total_suilend_value: number;
    total_portfolio_value: number;
  };
}

export interface SuiSummary {
  total_token_value: number;
  total_bluefin_value: number;
  total_bluefin_fees: number;
  total_suilend_value: number;
  total_value: number;
  wallet_count: number;
} 

// Lending Summary Types
export interface LendingPosition {
  type: 'deposit' | 'borrow' | 'supply';
  token_symbol: string;
  token_address: string;
  amount: number;
  value_usd: number;
  apr: number;
}

export interface LendingAccount {
  wallet_address: string;
  wallet_label: string;
  account_address: string;
  protocol: string;
  chain: string;
  chain_id?: string;
  positions: LendingPosition[];
  total_supplied_value: number;
  total_borrowed_value: number;
  net_value_usd: number;
  health_ratio: number;
  updated_at: string;
}

export interface LendingProtocolBreakdown {
  positions: number;
  net_value: number;
}

export interface LendingSummary {
  total_supplied_value_usd: number;
  total_borrowed_value_usd: number;
  net_value_usd: number;
  position_count: number;
  wallet_count: number;
  protocol_breakdown: {
    marginfi: LendingProtocolBreakdown;
    evm_protocols: LendingProtocolBreakdown;
    suilend: LendingProtocolBreakdown;
  };
}

export interface LendingSummaryData {
  summary: LendingSummary;
  positions: LendingAccount[];
  last_updated: string;
}

// Analytics-specific interfaces
export interface FeeGrowthPoint {
  timestamp: string;
  fee_growth?: number;
  current_fees?: {
    total?: number;
    whirlpool?: number;
    raydium?: number;
  } | number;
}

export interface FeeGrowthData {
  growth_data: FeeGrowthPoint[];
  overall_hourly_rate: number;
}

export interface HistoricalPortfolioPoint {
  snapshot_time: string;
  total_portfolio_value?: number;
}

// Chart data interfaces used in analytics
export interface ChartDataPoint {
  timestamp: string;
  date: string;
  value: number;
  fees?: number;
}

export interface AnalyticsKeyMetrics {
  expectedDailyFees: number;
  last24hFees: number;
  totalPortfolio: number;
  uncollectedFees: number;
}

export interface AnalyticsData {
  totalPortfolioHistory: ChartDataPoint[];
  feeHistory: ChartDataPoint[];
  solanaHistory: ChartDataPoint[];
  hyperliquidHistory: ChartDataPoint[];
  evmHistory: ChartDataPoint[];
  suiHistory: ChartDataPoint[];
  cexHistory: ChartDataPoint[];
  keyMetrics: AnalyticsKeyMetrics;
} 