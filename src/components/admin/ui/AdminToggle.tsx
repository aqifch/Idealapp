import React from 'react';

/**
 * AdminToggle — A fully reusable toggle switch component.
 * Uses pure div + inline styles for 100% reliable behavior.
 * NO form events, NO synthetic events — just a direct boolean callback.
 */
interface AdminToggleProps {
  id: string;
  checked: boolean;
  onChange: (newValue: boolean) => void;
  onColor?: string;
  disabled?: boolean;
}

export const AdminToggle: React.FC<AdminToggleProps> = ({
  id,
  checked,
  onChange,
  onColor = '#6366f1',
  disabled = false,
}) => {
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) {
      onChange(!checked);
    }
  };

  return (
    <div
      id={id}
      role="switch"
      aria-checked={checked}
      aria-disabled={disabled}
      onClick={handleClick}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        width: '44px',
        height: '24px',
        borderRadius: '12px',
        backgroundColor: checked ? onColor : '#D1D5DB',
        cursor: disabled ? 'not-allowed' : 'pointer',
        position: 'relative',
        flexShrink: 0,
        transition: 'background-color 200ms ease',
        opacity: disabled ? 0.5 : 1,
        userSelect: 'none',
      }}
    >
      <div
        style={{
          position: 'absolute',
          top: '2px',
          left: checked ? '22px' : '2px',
          width: '20px',
          height: '20px',
          borderRadius: '50%',
          backgroundColor: '#ffffff',
          boxShadow: '0 1px 4px rgba(0,0,0,0.25)',
          transition: 'left 200ms ease',
        }}
      />
    </div>
  );
};

export default AdminToggle;
