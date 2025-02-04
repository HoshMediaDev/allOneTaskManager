import React, { useRef } from 'react';
import { PaperclipIcon, Link as LinkIcon } from 'lucide-react';
import type { Attachment } from '../../../types';

interface AttachmentUploadProps {
  onUpload: (attachment: Omit<Attachment, 'id'>) => void;
}

export const AttachmentUpload: React.FC<AttachmentUploadProps> = ({ onUpload }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showLinkInput, setShowLinkInput] = React.useState(false);
  const [linkUrl, setLinkUrl] = React.useState('');

  const handleFileClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation();
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      onUpload({
        name: file.name,
        url: reader.result as string,
        type: file.type.startsWith('image/') ? 'image' : 'document',
        size: file.size,
      });
    };
    reader.readAsDataURL(file);
  };

  const handleLinkSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (linkUrl.trim()) {
      onUpload({
        name: new URL(linkUrl).hostname,
        url: linkUrl,
        type: 'link',
      });
      setLinkUrl('');
      setShowLinkInput(false);
    }
  };

  return (
    <div className="space-y-2" onClick={e => e.stopPropagation()}>
      <div className="flex space-x-2">
        <button
          onClick={handleFileClick}
          className="flex items-center gap-2 px-3 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600"
        >
          <PaperclipIcon className="w-4 h-4" />
          Add File
        </button>
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setShowLinkInput(true);
          }}
          className="flex items-center gap-2 px-3 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600"
        >
          <LinkIcon className="w-4 h-4" />
          Add Link
        </button>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        onChange={handleFileChange}
        className="hidden"
        onClick={e => e.stopPropagation()}
      />

      {showLinkInput && (
        <form onSubmit={handleLinkSubmit} className="flex gap-2" onClick={e => e.stopPropagation()}>
          <input
            type="url"
            value={linkUrl}
            onChange={(e) => setLinkUrl(e.target.value)}
            placeholder="Enter URL"
            className="flex-1 bg-gray-700 text-white rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            required
            onClick={e => e.stopPropagation()}
          />
          <button
            type="submit"
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            Add
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setShowLinkInput(false);
            }}
            className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600"
          >
            Cancel
          </button>
        </form>
      )}
    </div>
  );
};