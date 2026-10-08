"use client";

import { nigeriaStates, getLGAs } from "@/lib/nigeria-locations";

interface Props {
  state: string;
  lga: string;
  onStateChange: (s: string) => void;
  onLgaChange: (l: string) => void;
  required?: boolean;
}

export default function NigeriaLocationSelectors({
  state,
  lga,
  onStateChange,
  onLgaChange,
  required = true,
}: Props) {
  const lgas = getLGAs(state);

  return (
    <div className="grid grid-cols-2 gap-2">
      <div>
        <label className="block text-slate-300 font-medium mb-1 text-xs">State {required && "*"}</label>
        <select
          value={state}
          required={required}
          onChange={(e) => { onStateChange(e.target.value); onLgaChange(""); }}
          className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 text-xs focus:outline-none focus:border-emerald-500 transition"
        >
          <option value="" disabled>Select State</option>
          {nigeriaStates.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-slate-300 font-medium mb-1 text-xs">LGA {required && "*"}</label>
        <select
          value={lga}
          required={required}
          onChange={(e) => onLgaChange(e.target.value)}
          disabled={!state}
          className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 text-xs focus:outline-none focus:border-emerald-500 transition disabled:opacity-50"
        >
          <option value="" disabled>Select LGA</option>
          {lgas.map((l) => (
            <option key={l} value={l}>{l}</option>
          ))}
        </select>
      </div>
    </div>
  );
}
