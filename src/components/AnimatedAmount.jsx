import React, { useState, useEffect, useRef } from 'react';

export default function AnimatedAmount({ 
  value, 
  prefix = '₹', 
  suffix = '', 
  isPercent = false, 
  className = '',
  showArrow = false 
}) {
  const [jumpClass, setJumpClass] = useState('');
  const [indicator, setIndicator] = useState(null);
  const prevValueRef = useRef(value);

  useEffect(() => {
    const prev = prevValueRef.current;
    if (prev !== undefined && prev !== null && value !== undefined && value !== null) {
      const numPrev = Number(prev);
      const numVal = Number(value);

      if (numVal > numPrev) {
        setJumpClass('jump-up');
        setIndicator('▲');
        const t = setTimeout(() => {
          setJumpClass('');
          setIndicator(null);
        }, 700);
        return () => clearTimeout(t);
      } else if (numVal < numPrev) {
        setJumpClass('jump-down');
        setIndicator('▼');
        const t = setTimeout(() => {
          setJumpClass('');
          setIndicator(null);
        }, 700);
        return () => clearTimeout(t);
      }
    }
    prevValueRef.current = value;
  }, [value]);

  const formatDisplay = (val) => {
    if (val === undefined || val === null) return '0';
    if (isPercent) {
      const n = Number(val);
      return `${n >= 0 ? '+' : ''}${n.toFixed(2)}%`;
    }
    return Number(val).toLocaleString('en-IN');
  };

  return (
    <span className={`inline-flex items-center gap-1 transition-transform font-mono-num ${jumpClass} ${className}`}>
      <span>{prefix}{formatDisplay(value)}{suffix}</span>
      {indicator && (
        <span className={`text-[10px] font-bold ${indicator === '▲' ? 'text-emerald-400' : 'text-rose-400'} animate-bounce`}>
          {indicator}
        </span>
      )}
    </span>
  );
}
