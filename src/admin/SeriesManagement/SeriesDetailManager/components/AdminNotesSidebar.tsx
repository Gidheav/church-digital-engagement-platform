import React, { useState } from 'react';
import Icon from '../../../../components/common/Icon';

interface AdminNotesSidebarProps {
  initialValue?: string;
  onSave?: (value: string) => void;
}

const AdminNotesSidebar: React.FC<AdminNotesSidebarProps> = ({ initialValue = '', onSave }) => {
  const [adminNotes, setAdminNotes] = useState(initialValue);

  const handleSave = () => {
    onSave?.(adminNotes);
  };

  return (
    <div className="bg-white border border-slate-200 rounded-lg shadow-sm p-4 flex-1">
      <h3 className="text-sm font-bold text-slate-900 mb-2">Admin Notes</h3>
      <textarea
        className="w-full h-32 text-xs p-2 border border-slate-200 rounded-md bg-slate-50 focus:ring-primary focus:border-primary resize-none"
        placeholder="Add internal notes for other admins..."
        value={adminNotes}
        onChange={e => setAdminNotes(e.target.value)}
      />
      <div className="flex justify-end mt-2">
        <button
          onClick={handleSave}
          className="text-xs text-primary font-medium hover:underline flex items-center gap-1"
        >
          <Icon name="save" size={12} />
          Save Note
        </button>
      </div>
    </div>
  );
};

export default React.memo(AdminNotesSidebar);
