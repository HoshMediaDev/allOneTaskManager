import React from 'react';
import { Paperclip } from 'lucide-react';
import { AttachmentList } from '../../../Attachments/AttachmentList';
import { AttachmentUpload } from '../../../Attachments/AttachmentUpload';
import { useTaskAttachments } from '../../../../hooks/useTaskAttachments';

interface AttachmentSectionProps {
  taskId: string;
}

export const AttachmentSection: React.FC<AttachmentSectionProps> = ({ taskId }) => {
  const { attachments, addAttachment, deleteAttachment } = useTaskAttachments(taskId);

  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <Paperclip className="w-5 h-5 text-gray-400" />
        <h3 className="text-lg font-medium text-white">Attachments</h3>
        <span className="text-sm text-gray-400">({attachments.length})</span>
      </div>
      
      <AttachmentUpload onUpload={addAttachment} />
      
      {attachments.length > 0 && (
        <div className="mt-4">
          <AttachmentList
            attachments={attachments}
            onDelete={deleteAttachment}
          />
        </div>
      )}
    </div>
  );
};