// Type definitions for the wallet tracker API

export interface WalletInfo {
  id: number;
  address: string;
  label: string;
  created_at: string;
  updated_at: string;
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

export interface PortfolioSummary {
  token_value: number;
  whirlpool_value: number;
  raydium_value: number;
  whirlpool_fees: number;
  raydium_fees: number;
  total_fees: number;
  marginfi_value: number;
  kamino_value: number;
  total_value: number;
}

export interface PortfolioSummaryData {
  wallet_count: number;
  token_balances: TokenBalance[];
  whirlpool_positions: AggregatedLPPosition[];
  raydium_positions: AggregatedLPPosition[];
  marginfi_summary: MarginfiSummary;
  kamino_lend_summary: KaminoLendSummary;
  summary: PortfolioSummary;
}

export interface PortfolioData {
  token_balances: TokenBalance[];
  whirlpool_positions: LPPosition[];
  raydium_positions: LPPosition[];
  marginfi_accounts: MarginfiAccount[];
  kamino_accounts: KaminoAccount[];
  summary: PortfolioSummary;
} 