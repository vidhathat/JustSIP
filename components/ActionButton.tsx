import React from 'react';
import { FaEdit, FaTrash, FaSave } from 'react-icons/fa';

type ActionButtonProps = {
  type: 'edit' | 'delete';
  onClick: () => void;
  isEditing?: boolean;
};

const ActionButton: React.FC<ActionButtonProps> = ({ type, onClick, isEditing }) => {
  return (
    <button onClick={onClick} className={`text-${type === 'delete' ? 'red' : 'blue'}-500 hover:text-${type === 'delete' ? 'red' : 'blue'}-700`}>
      {type === 'edit' ? (isEditing ? <FaSave /> : <FaEdit />) : <FaTrash />}
    </button>
  );
};

export default ActionButton; 