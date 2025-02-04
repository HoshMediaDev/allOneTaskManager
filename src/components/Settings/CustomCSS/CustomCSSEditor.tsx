import React, { useState } from 'react';
import { Code } from 'lucide-react';
import { useCustomCSSStore } from '../../../store/customCSSStore';

export const CustomCSSEditor: React.FC = () => {
  const { css, setCSS } = useCustomCSSStore();
  const [localCSS, setLocalCSS] = useState(css);
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validateCSS = (css: string): boolean => {
    try {
      const style = document.createElement('style');
      style.textContent = css;
      document.head.appendChild(style);
      document.head.removeChild(style);
      return true;
    } catch (error) {
      return false;
    }
  };

  const handleSave = () => {
    if (!validateCSS(localCSS)) {
      setError('Invalid CSS syntax');
      return;
    }

    setError(null);
    setCSS(localCSS);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setLocalCSS(css);
    setError(null);
    setIsEditing(false);
  };

  return (
    <div className="bg-gray-800 rounded-lg p-6">
      <div className="flex items-center space-x-2 mb-4">
        <Code className="w-5 h-5 text-indigo-400" />
        <h3 className="text-lg font-medium text-white">Custom CSS</h3>
      </div>

      {!isEditing ? (
        <div className="space-y-4">
          {css ? (
            <div className="bg-gray-700 rounded-lg p-4">
              <pre className="text-gray-300 whitespace-pre-wrap font-mono text-sm">
                {css}
              </pre>
            </div>
          ) : (
            <p className="text-gray-400">No custom CSS configured</p>
          )}
          <button
            onClick={() => setIsEditing(true)}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            {css ? 'Edit CSS' : 'Add Custom CSS'}
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Enter your custom CSS
            </label>
            <textarea
              value={localCSS}
              onChange={(e) => setLocalCSS(e.target.value)}
              className="w-full h-64 bg-gray-700 text-white rounded-lg px-3 py-2 font-mono text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              placeholder=":root {
  --custom-bg-color: #1a1a1a;
}

.dashboard {
  background-color: var(--custom-bg-color);
}"
            />
            {error && (
              <p className="mt-2 text-sm text-red-400">
                {error}
              </p>
            )}
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={handleCancel}
              className="px-4 py-2 text-gray-300 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg"
            >
              Save CSS
            </button>
          </div>
        </div>
      )}
    </div>
  );
};