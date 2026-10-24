import { SlidersHorizontal } from 'lucide-react';
import { useApp } from '../context/AppContext';

function Slider({
  label, value, min, max, step = 1, unit = '%',
  onChange,
}: {
  label: string; value: number; min: number; max: number; step?: number; unit?: string;
  onChange: (v: number) => void;
}) {
  const pct = ((value - min) / (max - min)) * 100;

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <span className="text-xs text-gray-400">{label}</span>
        <span className="text-xs font-bold text-white bg-brand-600/20 border border-brand-500/30 px-2 py-0.5 rounded-md">
          {value}{unit}
        </span>
      </div>
      {/* Wrapper gives the invisible range input a proper click area */}
      <div className="relative h-5 flex items-center">
        {/* Visible track */}
        <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden pointer-events-none">
          <div
            className="h-full bg-gradient-to-r from-brand-600 to-indigo-400 rounded-full transition-all"
            style={{ width: `${pct}%` }}
          />
        </div>
        {/* Invisible range input sits on top, covers the full 20px hit area */}
        <input
          type="range"
          min={min} max={max} step={step} value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="absolute inset-0 w-full opacity-0 cursor-pointer"
        />
      </div>
    </div>
  );
}

export default function ThresholdControls() {
  const { thresholds, setThresholds } = useApp();

  return (
    <div className="bg-gray-900 border border-white/5 rounded-2xl p-5">
      <div className="flex items-center gap-2 mb-5">
        <div className="w-8 h-8 rounded-lg bg-brand-600/20 flex items-center justify-center">
          <SlidersHorizontal className="w-4 h-4 text-brand-400" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-white">Risk Thresholds</h3>
          <p className="text-xs text-gray-500">Adjust to recalculate all risk levels live</p>
        </div>
      </div>

      <div className="space-y-5">
        <Slider
          label="Minimum Attendance"
          value={thresholds.attendanceMin}
          min={50} max={95} step={1} unit="%"
          onChange={(v) => void setThresholds({ ...thresholds, attendanceMin: v })}
        />
        <Slider
          label="Max Score Drop Tolerance"
          value={thresholds.scoreDropMax}
          min={5} max={50} step={1} unit="%"
          onChange={(v) => void setThresholds({ ...thresholds, scoreDropMax: v })}
        />
        <Slider
          label="Max Backlogs Allowed"
          value={thresholds.backlogsMax}
          min={0} max={8} step={1} unit=""
          onChange={(v) => void setThresholds({ ...thresholds, backlogsMax: v })}
        />
      </div>
    </div>
  );
}
