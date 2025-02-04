import React, { useRef, useState } from 'react';
import { PaperclipIcon, Link as LinkIcon, Loader2 } from 'lucide-react';
import type { Attachment } from '../../types';

interface AttachmentUploadProps {
  onUpload: (attachment: Omit<Attachment, 'id'>) => void;
}

export const AttachmentUpload: React.FC<AttachmentUploadProps> = ({ onUpload }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showLinkInput, setShowLinkInput] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  const handleFileClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation();
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      // Create a promise that resolves with the file data
      const fileDataPromise = new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      // Wait for the file to be read
      const fileData = await fileDataPromise;

      // Create the attachment object
      const attachment: Omit<Attachment, 'id'> = {
        name: file.name,
        url: fileData,
        type: file.type.startsWith('image/') ? 'image' : 'document',
        size: file.size,
      };

      // Upload the attachment
      await onUpload(attachment);
    } catch (error) {
      console.error('Error uploading file:', error);
      // You might want to show an error message to the user here
    } finally {
      setIsUploading(false);
      // Clear the input so the same file can be selected again
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleLinkSubmit = () => {
    if (linkUrl.trim()) {
      // Add protocol if missing
      let url = linkUrl.trim();
      if (!url.startsWith('http://') && !url.startsWith('https://')) {
        url = 'https://' + url;
      }

      try {
        // Basic URL validation
        new URL(url);
        
        onUpload({
          name: new URL(url).hostname,
          url: url,
          type: 'link',
        });
        setLinkUrl('');
        setShowLinkInput(false);
      } catch (error) {
        // If URL is invalid, try with http://
        try {
          url = 'http://' + linkUrl.trim();
          new URL(url);
          
          onUpload({
            name: new URL(url).hostname,
            url: url,
            type: 'link',
          });
          setLinkUrl('');
          setShowLinkInput(false);
        } catch {
          // If still invalid, just use the raw input
          onUpload({
            name: linkUrl.trim(),
            url: linkUrl.trim(),
            type: 'link',
          });
          setLinkUrl('');
          setShowLinkInput(false);
        }
      }
    }
  };

  return (
    <div className="space-y-2" onClick={e => e.stopPropagation()}>
      <div className="flex space-x-2">
        <button
          type="button"
          onClick={handleFileClick}
          disabled={isUploading}
          className="flex items-center gap-2 px-3 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isUploading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <PaperclipIcon className="w-4 h-4" />
          )}
          {isUploading ? 'Uploading...' : 'Add File'}
        </button>
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setShowLinkInput(true);
          }}
          disabled={isUploading}
          className="flex items-center gap-2 px-3 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
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
        <div className="flex gap-2" onClick={e => e.stopPropagation()}>
          <input
            type="text"
            value={linkUrl}
            onChange={(e) => setLinkUrl(e.target.value)}
            placeholder="Enter URL"
            className="flex-1 bg-gray-700 text-white rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleLinkSubmit();
              }
            }}
            onClick={e => e.stopPropagation()}
          />
          <button
            type="button"
            onClick={handleLinkSubmit}
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
        </div>
      )}
    </div>
  );
};