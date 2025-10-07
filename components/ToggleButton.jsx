/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React from 'react';

const ToggleButton = ({ icon: Icon, label, isSelected, onClick }) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 text-sm font-medium transition-colors focus:outline-none ${
        isSelected
          ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-700 dark:text-slate-50'
          : 'bg-transparent text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-50'
      }`}
    >
      {Icon && <Icon size={16} />}
      <span>{label}</span>
    </button>
  );
};

export default ToggleButton;
