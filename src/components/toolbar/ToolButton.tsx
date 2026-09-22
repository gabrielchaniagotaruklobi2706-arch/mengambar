import React from "react";
import { LucideIcon } from "lucide-react";

interface ToolButtonProps {
  id?: string;
  icon: LucideIcon;
  label: string;
  shortcut?: string;
  active?: boolean;
  onClick: () => void;
  badge?: string;
}

export const ToolButton: React.FC<ToolButtonProps> = ({
  id,
  icon: Icon,
  label,
  shortcut,
  active = false,
  onClick,
  badge,
}) => {
  return (
    <button
      id={id}
      type="button"
      onClick={onClick}
      title={shortcut ? `${label} (${shortcut})` : label}
      aria-label={label}
      aria-pressed={active}
      className={`group relative flex items-center justify-center w-10 h-10 rounded-lg transition-all duration-150 outline-none focus-visible:ring-2 focus-visible:ring-[#7C5CFF] ${
        active
          ? "bg-[#7C5CFF] text-white shadow-md shadow-[#7C5CFF]/30"
          : "text-neutral-400 hover:text-white hover:bg-neutral-800/80 active:bg-neutral-800"
      }`}
    >
      <Icon className="w-5 h-5 transition-transform group-hover:scale-105" />
      {badge && (
        <span className="absolute -top-1 -right-1 px-1 py-0.2 bg-[#7C5CFF] text-[9px] font-bold text-white rounded-full">
          {badge}
        </span>
      )}
      {/* Tooltip on hover */}
      <div className="pointer-events-none absolute left-full ml-2.5 px-2.5 py-1 bg-neutral-900 border border-neutral-700/80 rounded-md text-xs text-neutral-200 whitespace-nowrap opacity-0 translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-150 z-50 shadow-xl">
        <span className="font-medium text-white">{label}</span>
        {shortcut && <span className="ml-1.5 text-neutral-400 font-mono">[{shortcut}]</span>}
      </div>
    </button>
  );
};
