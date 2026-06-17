interface TagPillProps {
  tag: string;
  color?: string | null;
  onRemove?: () => void;
}

export default function TagPill({ tag, color, onRemove }: TagPillProps) {
  return (
    <span className="inline-flex items-center gap-0.5 rounded-full bg-gray-100 dark:bg-white/[0.08] px-1.5 py-[1px] text-[9px] font-medium text-gray-600 dark:text-gray-400 leading-tight max-w-[80px]">
      {color && (
        <span
          className="h-1.5 w-1.5 rounded-full shrink-0"
          style={{ backgroundColor: color }}
        />
      )}
      <span className="truncate">{tag}</span>
      {onRemove && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="ml-0.5 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 leading-none shrink-0"
        >
          ×
        </button>
      )}
    </span>
  );
}
