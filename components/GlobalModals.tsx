'use client';

import { useApp } from '@/contexts/AppContext';
import AddAssignmentModal from './AddAssignmentModal';
import FloatingAddButton from './FloatingAddButton';

export default function GlobalModals() {
  const { isEditModalOpen, setIsEditModalOpen, setCurrentEditingAssignment, presetDate, setPresetDate } = useApp();

  const handleModalClose = () => {
    setIsEditModalOpen(false);
    // Clear editing assignment when modal closes
    setCurrentEditingAssignment(undefined);
    // Clear preset date when modal closes
    setPresetDate(undefined);
  };

  const handleAddButtonClick = () => {
    setIsEditModalOpen(true);
  };

  return (
    <>
      <FloatingAddButton onClick={handleAddButtonClick} />
      <AddAssignmentModal 
        isOpen={isEditModalOpen} 
        onClose={handleModalClose} 
        presetDate={presetDate}
      />
    </>
  );
}