import React from 'react';
import { useNavigate } from 'react-router-dom';
import AddTableModal from './modal/AddTableModal';

// Route wrapper that renders the add-table flow as a modal.
export default function AddTablePage() {
  const navigate = useNavigate();

  return (
    <AddTableModal
      isOpen
      onClose={() => navigate('/admin/tables')}
      onCreated={() => navigate('/admin/tables')}
    />
  );
}