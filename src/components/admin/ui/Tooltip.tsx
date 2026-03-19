import React, { useState } from 'react';
import { Info } from 'lucide-react';

interface TooltipProps {
  text: string;
  position?: 'top' | 'right' | 'bottom' | 'left';
}

export const Tooltip: React.FC<TooltipProps> = ({ text, position = 'top' }) => {
  const [visible, setVisible] = useState(false);

  const positionClasses: Record<string, string> = {
    top:    'bottom-full mb-2 left-1/2 -translate-x-1/2',
    bottom: 'top-full mt-2 left-1/2 -translate-x-1/2',
    right:  'left-full ml-2 top-1/2 -translate-y-1/2',
    left:   'right-full mr-2 top-1/2 -translate-y-1/2',
  };

  return (
    <div className="relative inline-flex items-center ml-1.5">
      <button
        type="button"
        onMouseEnter={() => setVisible(true)}
        onMouseLeave={() => setVisible(false)}
        onFocus={() => setVisible(true)}
        onBlur={() => setVisible(false)}
        className="text-gray-300 hover:text-indigo-400 transition-colors cursor-help"
        aria-label={text}
      >
        <Info className="w-3.5 h-3.5" />
      </button>

      {visible && (
        <div
          className={`absolute z-50 w-52 bg-gray-900 text-white text-xs rounded-xl px-3 py-2.5 shadow-2xl leading-relaxed pointer-events-none ${positionClasses[position]}`}
          style={{ fontWeight: 400 }}
        >
          {text}
          {/* Arrow */}
          <div
            className={`absolute w-2 h-2 bg-gray-900 rotate-45 ${
              position === 'top'    ? 'bottom-[-4px] left-1/2 -translate-x-1/2' :
              position === 'bottom' ? 'top-[-4px]    left-1/2 -translate-x-1/2' :
              position === 'right'  ? 'left-[-4px]   top-1/2  -translate-y-1/2' :
                                      'right-[-4px]  top-1/2  -translate-y-1/2'
            }`}
          />
        </div>
      )}
    </div>
  );
};

export default Tooltip;
