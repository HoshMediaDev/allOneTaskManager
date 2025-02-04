import React from 'react';
import { FileIcon, ImageIcon, LinkIcon, Trash2, Download, Copy, CheckCircle } from 'lucide-react';
import type { Attachment } from '../../types';

interface AttachmentListProps {
  attachments: Attachment[];
  onDelete: (id: string) => void;
}

export const AttachmentList: React.FC<AttachmentListProps> = ({ attachments, onDelete }) => {
  const [copiedId, setCopiedId] = React.useState<string | null>(null);

  const getIcon = (type: Attachment['type']) => {
    switch (type) {
      case 'image': return <ImageIcon className="w-5 h-5" />;
      case 'link': return <LinkIcon className="w-5 h-5" />;
      default: return <FileIcon className="w-5 h-5" />;
    }
  };

  const handleCopyUrl = async (url: string, id: string) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000); // Reset after 2 seconds
    } catch (err) {
      console.error('Failed to copy URL:', err);
    }
  };

  return (
    <div className="space-y-2">
      {attachments.map((attachment) => (
        <div 
          key={attachment.id}
          className="flex items-center justify-between bg-gray-700 p-3 rounded-lg group"
        >
          <div className="flex items-center space-x-3 flex-1 min-w-0">
            {getIcon(attachment.type)}
            <div className="flex-1 min-w-0">
              {attachment.type === 'link' ? (
                <div>
                  <a 
                    href={attachment.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-indigo-400 hover:text-indigo-300 truncate block"
                  >
                    {attachment.name}
                  </a>
                  <p className="text-sm text-gray-400 truncate">{attachment.url}</p>
                </div>
              ) : (
                <div>
                  <p className="text-white truncate">{attachment.name}</p>
                  {attachment.size && (
                    <p className="text-sm text-gray-400">
                      {(attachment.size / 1024).toFixed(1)} KB
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
          
          <div className="flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
            {attachment.type === 'link' ? (
              <button
                onClick={() => handleCopyUrl(attachment.url, attachment.id)}
                className="p-1 text-gray-400 hover:text-white transition-colors"
                title="Copy URL"
              >
                {copiedId === attachment.id ? (
                  <CheckCircle className="w-4 h-4 text-green-500" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </button>
            ) : (
              <a
                href={attachment.url}
                download={attachment.name}
                className="p-1 text-gray-400 hover:text-white transition-colors"
                title="Download file"
              >
                <Download className="w-4 h-4" />
              </a>
            )}
            <button
              onClick={() => onDelete(attachment.id)}
              className="p-1 text-gray-400 hover:text-red-400 transition-colors"
              title="Remove attachment"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};