import React from 'react';
import { FileIcon, ImageIcon, LinkIcon, Trash2, Download } from 'lucide-react';
import type { Attachment } from '../../../types';

interface AttachmentListProps {
  attachments: Attachment[];
  onDelete: (id: string) => void;
}

export const AttachmentList: React.FC<AttachmentListProps> = ({ attachments, onDelete }) => {
  const getIcon = (type: Attachment['type']) => {
    switch (type) {
      case 'image': return <ImageIcon className="w-5 h-5" />;
      case 'link': return <LinkIcon className="w-5 h-5" />;
      default: return <FileIcon className="w-5 h-5" />;
    }
  };

  return (
    <div className="space-y-2">
      {attachments.map((attachment) => (
        <div 
          key={attachment.id}
          className="flex items-center justify-between bg-gray-700 p-3 rounded-lg group"
        >
          <div className="flex items-center space-x-3">
            {getIcon(attachment.type)}
            <div>
              <p className="text-white">{attachment.name}</p>
              {attachment.size && (
                <p className="text-sm text-gray-400">
                  {(attachment.size / 1024).toFixed(1)} KB
                </p>
              )}
            </div>
          </div>
          
          <div className="flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <a
              href={attachment.url}
              download={attachment.name}
              className="p-1 text-gray-400 hover:text-white"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Download className="w-4 h-4" />
            </a>
            <button
              onClick={() => onDelete(attachment.id)}
              className="p-1 text-gray-400 hover:text-red-400"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};