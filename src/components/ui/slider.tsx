'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

interface SliderProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value'> {
  value?: number[];
  onValueChange?: (value: number[]) => void;
  max?: number;
  min?: number;
  step?: number;
}

const Slider = React.forwardRef<HTMLInputElement, SliderProps>(
  ({ className, value = [0], onValueChange, max = 100, min = 0, step = 1, ...props }, ref) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      onValueChange?.([Number(e.target.value)]);
    };

    const percentage = ((value[0] - min) / (max - min)) * 100;

    return (
      <div className={cn('relative w-full', className)}>
        <input
          type="range"
          ref={ref}
          min={min}
          max={max}
          step={step}
          value={value[0]}
          onChange={handleChange}
          className={cn(
            'w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer',
            'range-slider'
          )}
          style={{
            background: `linear-gradient(to right, rgb(139 92 246) 0%, rgb(139 92 246) ${percentage}%, rgb(51 65 85) ${percentage}%, rgb(51 65 85) 100%)`,
          }}
          {...props}
        />
        <style jsx>{`
          .range-slider::-webkit-slider-thumb {
            appearance: none;
            width: 16px;
            height: 16px;
            border-radius: 50%;
            background: white;
            cursor: pointer;
            box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
          }
          .range-slider::-moz-range-thumb {
            width: 16px;
            height: 16px;
            border-radius: 50%;
            background: white;
            cursor: pointer;
            border: none;
            box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
          }
        `}</style>
      </div>
    );
  }
);

Slider.displayName = 'Slider';

export { Slider };
