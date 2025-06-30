# Fee Analytics Calculation Documentation

## Overview

This document explains the mathematical formulas and methodologies used to calculate the three core fee metrics in the wallet tracker system:

1. **Hourly Fee Growth Rate** - Average USD fees earned per hour
2. **Expected 24 Hour Fees** - Projected fees for the next 24 hours  
3. **Last 24 Hour Fees Generated** - Actual fees collected in the previous 24 hours

## Data Source

All calculations are based on historical portfolio snapshots stored in the `historical_portfolio_snapshots` database table, which contains:
- `snapshot_time` - Timestamp of the data point
- `whirlpool_fees_total` - Accumulated Whirlpool fees (USD)
- `raydium_fees_total` - Accumulated Raydium fees (USD)
- `wallet_address` - The wallet being analyzed

---

## 1. Hourly Fee Growth Rate

### Purpose
Calculate the average rate at which fees are generated per hour, used as the foundation for 24-hour projections.

### Data Processing
```sql
SELECT 
  snapshot_time,
  (COALESCE(whirlpool_fees_total, 0) + COALESCE(raydium_fees_total, 0)) as total_fees
FROM historical_portfolio_snapshots
WHERE wallet_address = ? AND snapshot_time > (NOW() - INTERVAL)
ORDER BY snapshot_time ASC
```

### Calculation Methods

#### Method 1: Weighted Average by Time Periods (Primary)
**Formula:**
```
Hourly_Rate = Σ(Rate_i × Duration_i) / Σ(Duration_i)

Where:
- Rate_i = (Current_Fees - Previous_Fees) / Time_Diff_Hours
- Duration_i = Time between consecutive snapshots (hours)
```

**Process:**
1. For each consecutive pair of snapshots:
   - Calculate fee growth: `fee_growth = current_total_fees - previous_total_fees`
   - Calculate time difference: `time_diff = (current_time - previous_time) / (1000 * 60 * 60)` (hours)
   - Calculate hourly rate: `hourly_rate = fee_growth / time_diff` (if fee_growth > 0)
2. Weight each rate by its time period
3. Calculate weighted average

**When Used:** Default method when sufficient data available (≥ 24 hours span)

#### Method 2: Time-Decay Weighted Average (Advanced)
**Formula:**
```
Hourly_Rate = Σ(Rate_i × Weight_i) / Σ(Weight_i)

Where:
- Weight_i = e^(-age_hours_i / 24)
- age_hours_i = Hours since the data point was recorded
```

**When Used:** When rich recent data available (≥ 5 data points in 24h, ≥ 48h total span)

#### Method 3: Recent Focus Method
**Formula:**
```
Hourly_Rate = (Recent_25%_Sum × 2 + Older_75%_Sum) / (Recent_Count × 2 + Older_Count)
```

**When Used:** Limited data availability (< 48 hours but > 24 hours)

#### Method 4: Moving Average
**Formula:**
```
Hourly_Rate = Σ(Last_N_Rates) / N

Where N = min(7, total_available_rates)
```

**When Used:** Fallback for very limited data

---

## 2. Expected 24 Hour Fees

### Purpose
Project the fees that will be generated in the next 24 hours based on current earning rates.

### Formula
```
Expected_24h_Fees = Hourly_Fee_Growth_Rate × 24
```

### Method Selection Logic
```javascript
if (recentDataCount >= 5 && dataSpanHours >= 48) {
    method = 'time_decay';           // Use time-decay weighted average
} else if (dataSpanHours >= 24) {
    method = 'weighted_average';     // Use weighted average
} else {
    method = 'recent_focus';         // Use recent focus method
}
```

### Example Calculation
```
Given:
- Hourly Rate = $211.54 USD/hour (from weighted average)
- Time Period = 24 hours

Expected 24h Fees = $211.54 × 24 = $5,077.00
```

---

## 3. Last 24 Hour Fees Generated

### Purpose
Calculate the actual fees collected in the previous 24-hour period.

### Calculation Methods (Priority Order)

#### Method 1: Direct Comparison (Primary)
**Formula:**
```
Last_24h_Fees = Current_Total_Fees - Fees_24h_Ago

Where:
- Current_Total_Fees = Most recent snapshot total fees
- Fees_24h_Ago = Total fees from snapshot closest to 24 hours ago
```

**Process:**
1. Filter snapshots from last 24 hours: `snapshot_time >= (NOW() - 24 hours)`
2. Get most recent snapshot: `most_recent_fees`
3. Get earliest snapshot in 24h window: `day_ago_fees`
4. Calculate difference: `last_24h_fees = most_recent_fees - day_ago_fees`

**When Used:** When exact or near-exact 24-hour data points exist

#### Method 2: Incremental Sum (Fallback)
**Formula:**
```
Last_24h_Fees = Σ(Fee_Growth_i) for all i in [t-24h, t_now]

Where Fee_Growth_i = max(0, Current_Fees_i - Previous_Fees_i)
```

**Process:**
1. For each consecutive pair in the 24h window
2. Calculate positive fee growth only
3. Sum all incremental gains

**When Used:** When direct comparison fails (insufficient exact data)

#### Method 3: Linear Interpolation (Last Resort)
**Formula:**
```
Last_24h_Fees = Current_Fees - Interpolated_Fees_24h_ago

Where Interpolated_Fees_24h_ago is calculated from nearest data points
```

**When Used:** When no direct 24h data available but longer historical data exists

### Example Calculation
```
Given snapshots:
- Now (2024-01-15 12:00): $45,559.42 total fees
- 24h ago (2024-01-14 12:00): $40,000.00 total fees

Last 24h Fees = $45,559.42 - $40,000.00 = $5,559.42
```

---

## Performance Metrics

### Efficiency Percentage
```
Efficiency = (Actual_24h_Fees / Expected_24h_Fees) × 100

Example: ($5,559.42 / $5,077.00) × 100 = 109.5%
```

**Interpretation:**
- 100% = Perfect prediction
- >100% = Underestimated (conservative)
- <100% = Overestimated

### Rate Stability
```
Stability = 1 - (Max_Rate - Min_Rate) / (Max_Rate + 0.001)

Range: 0 (highly volatile) to 1 (perfectly stable)
```

### Data Quality Score
```
Quality_Score = min(100, (hourly_rates_count / 24) × 100)

Range: 0-100% (percentage of ideal data density)
```

---

## API Endpoints

### Get Fee Growth Data
```
GET /fee-growth/:wallet?timeframe=7d
```
Returns hourly rates and overall rate calculation.

### Get Fee Metrics
```
GET /fee-metrics/:wallet?method=auto
```
Returns comprehensive 24h fee calculations with multiple methods.

**Method Options:**
- `auto` - Automatic best method selection
- `weighted` - Force weighted average
- `recent` - Force recent focus
- `moving` - Force moving average
- `decay` - Force time-decay weighted

---

## Error Handling

### Data Gaps
- **Missing snapshots:** Linear interpolation between available points
- **Insufficient data:** Falls back to simpler calculation methods
- **No data:** Returns zero values with appropriate flags

### Edge Cases
- **Negative fee growth:** Ignored in rate calculations (fee corrections)
- **Extreme rates:** Capped at reasonable maximum values
- **Clock skew:** Time differences validated and corrected

---

## Usage Example

```javascript
// Get enhanced fee metrics
const metrics = await getFeeMetrics(walletAddress, 'auto');

console.log(`Hourly Rate: $${metrics.expected_24h_fees.hourly_rate.toFixed(2)}/hr`);
console.log(`Expected 24h: $${metrics.expected_24h_fees.amount_usd.toFixed(2)}`);
console.log(`Last 24h: $${metrics.last_24h_fees.amount_usd.toFixed(2)}`);
console.log(`Method: ${metrics.expected_24h_fees.calculation_method}`);
console.log(`Efficiency: ${metrics.performance_metrics.efficiency_percentage.toFixed(1)}%`);
```

---

## Accuracy Considerations

### Typical Accuracy Ranges
- **Expected vs Actual:** ±10-20% variance is normal
- **Short-term predictions:** More accurate (24h)
- **Market volatility:** Can cause larger deviations

### Factors Affecting Accuracy
- **Trading volume changes:** Higher volume = more fees
- **Price volatility:** Affects trading frequency
- **Liquidity changes:** Position adjustments change fee generation
- **Market conditions:** Bull/bear markets affect trading patterns

### Improvement Strategies
- **More frequent snapshots:** Better time resolution
- **External data integration:** Volume, volatility indicators
- **Machine learning:** Pattern recognition for better predictions
- **Market condition awareness:** Adjust calculations based on market state 