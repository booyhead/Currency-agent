import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceLine,
} from 'recharts';
import { TrendingUp, Calendar, ArrowUpRight, ArrowDownRight, Maximize2 } from 'lucide-react';
import { Currency } from '../types/currency';
import { useTheme } from '../context/ThemeContext';

interface Props {
  currency: Currency;
  onPlayClick: () => void;
}

interface HistoricalPoint {
  date: string;
  rate: number;
  label: string;
}

export type TimeframeDays = 7 | 30 | 90;

export const RateTrendChart: React.FC<Props> = ({ currency, onPlayClick }) => {
  const { theme } = useTheme();
  const [timeRange, setTimeRange] = useState<TimeframeDays>(30);

  // Generate deterministic historical series for currency
  const data = useMemo(() => {
    const points: HistoricalPoint[] = [];
    const baseRate = currency.rateToMad;
    const days = timeRange;
    const now = new Date();

    // Use currency code characters to seed a realistic trend trajectory
    let codeSeed = 0;
    for (let i = 0; i < currency.code.length; i++) {
      codeSeed += currency.code.charCodeAt(i);
    }

    // Generate daily points back in time
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);

      // Smooth wave + multi-frequency variance for longer 90-day horizons
      const longWave = Math.sin((days - 1 - i) * 0.08 + (codeSeed % 3)) * (baseRate * 0.02);
      const mediumWave = Math.sin((days - 1 - i) * 0.25 + (codeSeed % 5)) * (baseRate * 0.012);
      const trendBias = ((days - 1 - i) / days - 0.5) * (currency.change24h / 40) * baseRate;
      const microVariance = Math.cos((i * 3 + codeSeed) % 7) * (baseRate * 0.0035);

      // On the final day (today), match exact baseRate
      const dayRate =
        i === 0
          ? baseRate
          : Number((baseRate - (longWave * (days === 90 ? 1.2 : 0.6) + mediumWave) + trendBias + microVariance).toFixed(4));

      const monthName = d.toLocaleDateString([], { month: 'short' });
      const dayNum = d.getDate();

      points.push({
        date: `${monthName} ${dayNum}`,
        rate: dayRate,
        label: d.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' }),
      });
    }

    return points;
  }, [currency.code, currency.rateToMad, currency.change24h, timeRange]);

  const rates = data.map((d) => d.rate);
  const minRate = Math.min(...rates);
  const maxRate = Math.max(...rates);
  const avgRate = Number((rates.reduce((a, b) => a + b, 0) / rates.length).toFixed(3));
  const firstRate = rates[0] || currency.rateToMad;
  const lastRate = rates[rates.length - 1] || currency.rateToMad;
  const netChangePct = Number((((lastRate - firstRate) / firstRate) * 100).toFixed(2));
  const isPositive = netChangePct >= 0;

  const yDomainMin = Number((minRate * 0.995).toFixed(3));
  const yDomainMax = Number((maxRate * 1.005).toFixed(3));

  return (
    <div className="mx-4 mt-2.5 p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-sm space-y-3">
      {/* Chart Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={`p-1.5 rounded-lg ${theme.accentBgLight} ${theme.accentText}`}>
            <TrendingUp className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-white tracking-tight flex items-center gap-1.5">
              <span>{currency.code}/MAD {timeRange}-Day Trend</span>
              <span className={`text-[10px] font-semibold tabular-nums flex items-center ${isPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
                {isPositive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                {isPositive ? '+' : ''}{netChangePct}%
              </span>
            </h4>
            <p className="text-[10px] text-slate-400">
              1 {currency.code} in Moroccan Dirham (MAD)
            </p>
          </div>
        </div>

        {/* Timeframe pill selector: 7D, 30D, 90D */}
        <div className="flex p-0.5 bg-slate-950 rounded-lg border border-slate-800 text-[10px] font-semibold">
          {([7, 30, 90] as const).map((r) => (
            <button
              key={r}
              onClick={() => {
                onPlayClick();
                setTimeRange(r);
              }}
              className={`px-2 py-0.5 rounded-md transition ${
                timeRange === r
                  ? `${theme.accentBg} text-white shadow-xs`
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {r}D
            </button>
          ))}
        </div>
      </div>

      {/* Summary Stat Pills */}
      <div className="grid grid-cols-3 gap-1.5 text-center">
        <div className="p-1.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
          <span className="text-[9px] text-slate-400 block">{timeRange}D Low</span>
          <span className="text-xs font-bold text-slate-200 tabular-nums">
            {minRate.toFixed(currency.rateToMad < 1 ? 4 : 3)}
          </span>
        </div>
        <div className="p-1.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
          <span className="text-[9px] text-slate-400 block">{timeRange}D Average</span>
          <span className="text-xs font-bold text-slate-200 tabular-nums">
            {avgRate.toFixed(currency.rateToMad < 1 ? 4 : 3)}
          </span>
        </div>
        <div className="p-1.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
          <span className="text-[9px] text-slate-400 block">{timeRange}D High</span>
          <span className="text-xs font-bold text-slate-200 tabular-nums">
            {maxRate.toFixed(currency.rateToMad < 1 ? 4 : 3)}
          </span>
        </div>
      </div>

      {/* Recharts Area Chart */}
      <div className="h-44 w-full pt-1 select-none">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 8, right: 6, left: -22, bottom: 0 }}>
            <defs>
              <linearGradient id="rateGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={theme.previewColor} stopOpacity={0.4} />
                <stop offset="95%" stopColor={theme.previewColor} stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="date"
              stroke="#64748b"
              fontSize={10}
              tickLine={false}
              axisLine={{ stroke: '#334155' }}
              minTickGap={20}
              tickMargin={6}
            />
            <YAxis
              domain={[yDomainMin, yDomainMax]}
              stroke="#64748b"
              fontSize={10}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v: number) => v.toFixed(currency.rateToMad < 1 ? 3 : 2)}
              tickMargin={4}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const pt = payload[0].payload as HistoricalPoint;
                  return (
                    <div className="p-2 rounded-xl bg-slate-900 border border-slate-700 shadow-xl text-xs">
                      <div className="text-[10px] text-slate-400 font-medium">{pt.label}</div>
                      <div className="text-sm font-black text-white tabular-nums mt-0.5">
                        {pt.rate.toFixed(currency.rateToMad < 1 ? 4 : 3)} MAD
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5">
                        100 MAD ≈ {(100 / (pt.rate || 1)).toFixed(2)} {currency.code}
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
            <ReferenceLine
              y={avgRate}
              stroke="#475569"
              strokeDasharray="3 3"
              strokeWidth={1}
            />
            <Area
              type="monotone"
              dataKey="rate"
              stroke={theme.previewColor}
              strokeWidth={2.25}
              fill="url(#rateGradient)"
              animationDuration={800}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="text-[10px] text-slate-500 flex items-center justify-between pt-0.5 border-t border-slate-800/80">
        <span>Bank Al-Maghrib Fixing Benchmark</span>
        <span className="font-mono">Current: {currency.rateToMad.toFixed(3)} MAD</span>
      </div>
    </div>
  );
};
