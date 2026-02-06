'use client';

import { useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Area,
  ComposedChart,
} from 'recharts';

interface ScoreDataPoint {
  date?: string | Date;
  month?: string;
  year?: number;
  score?: number | null;
  averageScore?: number | null;
  sessionCount?: number;
}

interface ScoreChartProps {
  data: ScoreDataPoint[];
  height?: number;
  showBenchmark?: boolean;
  benchmarkValue?: number;
  chartType?: 'line' | 'area';
}

export function ScoreChart({
  data,
  height = 250,
  showBenchmark = true,
  benchmarkValue = 75,
  chartType = 'area',
}: ScoreChartProps) {
  const formattedData = useMemo(() => {
    return data.map((item, index) => {
      let label = '';
      let value = 0;

      if (item.month) {
        label = item.month;
      } else if (item.date) {
        const dateObj = typeof item.date === 'string' ? new Date(item.date) : item.date;
        label = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      } else {
        label = `#${index + 1}`;
      }

      value = item.score ?? item.averageScore ?? 0;

      return {
        name: label,
        score: value,
        sessions: item.sessionCount ?? 1,
      };
    });
  }, [data]);

  if (formattedData.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-slate-500">
        No data available
      </div>
    );
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 rounded-lg shadow-lg border border-slate-200">
          <p className="font-semibold text-slate-800">{label}</p>
          <p className="text-sm">
            <span className="text-indigo-600 font-bold">{payload[0].value}</span>
            <span className="text-slate-500"> / 100</span>
          </p>
          {payload[0].payload.sessions > 1 && (
            <p className="text-xs text-slate-500 mt-1">
              {payload[0].payload.sessions} sessions
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <ResponsiveContainer width="100%" height={height}>
      <ComposedChart data={formattedData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
        <defs>
          <linearGradient id="scoreGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
            <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
        <XAxis
          dataKey="name"
          tick={{ fill: '#64748b', fontSize: 12 }}
          tickLine={false}
          axisLine={{ stroke: '#e2e8f0' }}
        />
        <YAxis
          domain={[0, 100]}
          tick={{ fill: '#64748b', fontSize: 12 }}
          tickLine={false}
          axisLine={false}
          ticks={[0, 25, 50, 75, 100]}
        />
        <Tooltip content={<CustomTooltip />} />
        {showBenchmark && (
          <ReferenceLine
            y={benchmarkValue}
            stroke="#94a3b8"
            strokeDasharray="5 5"
            label={{
              value: 'Benchmark',
              position: 'right',
              fill: '#94a3b8',
              fontSize: 10,
            }}
          />
        )}
        {chartType === 'area' && (
          <Area
            type="monotone"
            dataKey="score"
            stroke="#6366f1"
            strokeWidth={2}
            fill="url(#scoreGradient)"
            animationDuration={1000}
          />
        )}
        <Line
          type="monotone"
          dataKey="score"
          stroke="#6366f1"
          strokeWidth={3}
          dot={{ fill: '#6366f1', strokeWidth: 2, r: 4 }}
          activeDot={{ r: 6, fill: '#4f46e5', strokeWidth: 0 }}
          animationDuration={1000}
        />
      </ComposedChart>
    </ResponsiveContainer>
  );
}
