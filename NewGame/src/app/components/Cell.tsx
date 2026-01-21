import { motion } from 'motion/react';

type CellValue = 'X' | 'O' | null;

interface CellProps {
  value: CellValue;
  onClick: () => void;
  isWinning: boolean;
  isDisabled: boolean;
  showPreview: boolean;
  previewValue: 'X' | 'O' | null;
}

export function Cell({ 
  value, 
  onClick, 
  isWinning, 
  isDisabled,
  showPreview,
  previewValue 
}: CellProps) {
  return (
    <button
      onClick={onClick}
      disabled={isDisabled || !!value}
      className={`
        w-12 h-12 border border-gray-300 
        flex items-center justify-center
        transition-all duration-200
        ${isWinning ? 'bg-yellow-200 border-yellow-400' : 'bg-white hover:bg-gray-50'}
        ${!value && !isDisabled ? 'cursor-pointer' : 'cursor-not-allowed'}
        relative
      `}
    >
      {/* Actual value */}
      {value && (
        <motion.span
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 260, damping: 20 }}
          className={`
            text-3xl font-bold
            ${value === 'X' ? 'text-blue-600' : 'text-red-600'}
          `}
        >
          {value}
        </motion.span>
      )}

      {/* Preview on hover */}
      {!value && showPreview && previewValue && !isDisabled && (
        <span
          className={`
            text-3xl font-bold opacity-20
            ${previewValue === 'X' ? 'text-blue-600' : 'text-red-600'}
          `}
        >
          {previewValue}
        </span>
      )}
    </button>
  );
}
