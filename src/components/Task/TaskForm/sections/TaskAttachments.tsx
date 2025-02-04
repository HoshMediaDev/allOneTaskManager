import React from 'react';
import { Paperclip } from 'lucide-react';
import type { Attachment } from '../../../../types';
import { AttachmentList } from '../../../Attachments/AttachmentList';
import { AttachmentUpload } from '../../../Attachments/AttachmentUpload';

interface TaskAttachmentsProps {
  attachments: Attachment[];
  onChange: (attachments: Attachment[]) => void;
}

export const TaskAttachments: React.FC<TaskAttachmentsProps> = ({
  attachments,
  onChange,
}) => {
  const handleAddAttachment = (newAttachment: Omit<Attachment, 'id'>) => {
    const attachment = {
      ...newAttachment,
      id: crypto.randomUUID(),
    };
    onChange([...attachments, attachment]);
  };

  const handleDeleteAttachment = (id: string) => {
    onChange(attachments.filter(a => a.id !== id));
  };

  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <Paperclip className="w-5 h-5 text-gray-400" />
        <h3 className="text-lg font-medium text-white">Attachments</h3>
        <span className="text-sm text-gray-400">({attachments.length})</span>
      </div>

      <AttachmentUpload onUpload={handleAddAttachment} />

      {attachments.length > 0 && (
        <div className="mt-4">
          <AttachmentList
            attachments={attachments}
            onDelete={handleDeleteAttachment}
          />
        </div>
      )}
    </div>
  );
};