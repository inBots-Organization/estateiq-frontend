'use client';

import { useMemo } from 'react';
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';

interface SkillData {
  skill: string;
  skillKey: string;
  averageScore: number | null;
  benchmark?: number;
  isStrength?: boolean;
  isWeakness?: boolean;
}

interface SkillRadarChartProps {
  skills: SkillData[];
  height?: number;
  showBenchmark?: boolean;
}

export function SkillRadarChart({
  skills,
  height = 300,
  showBenchmark = true,
}: SkillRadarChartProps) {
  const formattedData = useMemo(() => {
    return skills.map((skill) => ({
      subject: skill.skill.split(' ')[0], // Shorten for better display
      fullName: skill.skill,
      score: skill.averageScore ?? 0,
      benchmark: skill.benchmark ?? 75,
    }));
  }, [skills]);

  if (formattedData.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-slate-500">
        No skill data available
      </div>
    );
  }

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 rounded-lg shadow-lg border border-slate-200">
          <p className="font-semibold text-slate-800">{data.fullName}</p>
          <p className="text-sm">
            <span className="text-indigo-600 font-bold">{data.score}</span>
            <span className="text-slate-500"> / 100</span>
          </p>
          {showBenchmark && (
            <p className="text-xs text-slate-500 mt-1">
              Benchmark: {data.benchmark}
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <ResponsiveContainer width="100%" height={height}>
      <RadarChart data={formattedData} margin={{ top: 20, right: 30, bottom: 20, left: 30 }}>
        <PolarGrid stroke="#e2e8f0" />
        <PolarAngleAxis
          dataKey="subject"
          tick={{ fill: '#64748b', fontSize: 11 }}
          tickLine={false}
        />
        <PolarRadiusAxis
          angle={30}
          domain={[0, 100]}
          tick={{ fill: '#94a3b8', fontSize: 10 }}
          tickCount={5}
          axisLine={false}
        />
        {showBenchmark && (
          <Radar
            name="Benchmark"
            dataKey="benchmark"
            stroke="#94a3b8"
            fill="#94a3b8"
            fillOpacity={0.1}
            strokeDasharray="5 5"
          />
        )}
        <Radar
          name="Score"
          dataKey="score"
          stroke="#6366f1"
          fill="#6366f1"
          fillOpacity={0.4}
          strokeWidth={2}
          animationDuration={1000}
        />
        <Tooltip content={<CustomTooltip />} />
      </RadarChart>
    </ResponsiveContainer>
  );
}
