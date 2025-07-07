'use client';

interface FloatingAddButtonProps {
  onClick: () => void;
}

export default function FloatingAddButton({ onClick }: FloatingAddButtonProps) {
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