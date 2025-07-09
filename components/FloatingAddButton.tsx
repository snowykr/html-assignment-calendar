'use client';

import { usePathname } from '@/navigation';

interface FloatingAddButtonProps {
  onClick: () => void;
}

export default function FloatingAddButton({ onClick }: FloatingAddButtonProps) {
  const pathname = usePathname();
  
  // Only show on calendar and subjects pages
  const shouldShow = pathname === '/calendar' || pathname === '/subjects';
  
  if (!shouldShow) {
    return null;
  }
  
  return (
    <button 
      className="floating-add-button" 
      onClick={onClick}
      title="課題を追加"
    >
      <span className="add-icon">+</span>
    </button>
  );
}