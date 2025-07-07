'use client';

import { useApp } from '@/contexts/AppContext';
import AddAssignmentModal from './AddAssignmentModal';
import FloatingAddButton from './FloatingAddButton';

export default function GlobalModals() {
  const { isEditModalOpen, setIsEditModalOpen, currentEditingAssignment, setCurrentEditingAssignment } = useApp();

  const handleModalClose = () => {
    setIsEditModalOpen(false);
    // Clear editing assignment when modal closes
    setCurrentEditingAssignment(undefined);
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
      />
    </>
  );
}