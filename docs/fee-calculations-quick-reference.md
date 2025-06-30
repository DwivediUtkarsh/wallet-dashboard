# Fee Calculations - Quick Reference

## 🎯 Three Core Metrics

### 1. **Hourly Fee Growth Rate**
```
Rate = Σ(Fee_Growth_i × Time_i) / Σ(Time_i)
```
- **Input**: Historical portfolio snapshots
- **Output**: USD per hour (e.g., $211.54/hr)
- **Method**: Auto-selects best from 4 algorithms based on data quality

### 2. **Expected 24 Hour Fees**  
```
Expected = Hourly_Rate × 24
```
- **Example**: $211.54/hr × 24 = $5,077.00
- **Confidence**: Shown via efficiency % and data quality score

### 3. **Last 24 Hour Fees Generated**
```
Last_24h = Current_Total_Fees - Fees_24h_Ago
```
- **Example**: $45,559.42 - $40,000.00 = $5,559.42
- **Fallbacks**: Incremental sum → Linear interpolation

---

## 📊 Method Selection Logic

| **Data Condition** | **Method Used** | **Formula Type** |
|-------------------|----------------|------------------|
| Rich recent data (≥5 points, ≥48h) | Time Decay | `Weight = e^(-age/24)` |
| Standard data (≥24h span) | Weighted Average | `Time-normalized rates` |
| Limited data (<48h) | Recent Focus | `Recent 25% × 2 weight` |
| Minimal data | Moving Average | `Last 7 data points` |

---

## 🎯 Your Current Performance

```
Expected 24H: $5,077.00
Actual 24H:   $5,559.42
Efficiency:   109.5% (9.5% underestimate)
```

**Analysis**: Excellent prediction accuracy - most DeFi systems see ±20-50% variance.

---

## 🔧 API Usage

```javascript
// Get comprehensive metrics
const metrics = await getFeeMetrics(walletAddress, 'auto');

// Access results
const hourlyRate = metrics.expected_24h_fees.hourly_rate;
const expected = metrics.expected_24h_fees.amount_usd;
const actual = metrics.last_24h_fees.amount_usd;
const method = metrics.calculation_details.selected_method;
```

---

## 📈 Data Quality Indicators

- **Data Quality Score**: `(data_points / 24) × 100%`
- **Rate Stability**: `1 - (max_rate - min_rate) / max_rate`
- **Efficiency**: `(actual / expected) × 100%`

---

## 🚨 Common Edge Cases

| **Issue** | **Solution** |
|-----------|-------------|
| Missing 24h data point | Linear interpolation |
| Negative fee growth | Ignored (fee corrections) |
| Insufficient data | Method fallback chain |
| Rate spikes | Weighted averaging smooths |

For detailed formulas and implementation details, see the full [fee-calculations.md](./fee-calculations.md) documentation. 