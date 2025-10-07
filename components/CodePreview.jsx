/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
/**
 * Copyright 2025 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import Editor from '@monaco-editor/react';
import JSZip from 'jszip';
import {
  Check,
  Code2,
  Copy,
  Download,
  FileCode,
  MessageCircle,
  Play,
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import ToggleButton from './ToggleButton';

const CodePreview = ({ output, isDarkMode }) => {
  const { header, structure, notes, files } = output;
  const [activeView, setActiveView] = useState('preview'); // preview, code, notes
  const [selectedFile, setSelectedFile] = useState(
    files.find((f) => f.name === 'index.html') || files[0],
  );
  const [isCopied, setIsCopied] = useState(false);
  const [previewContent, setPreviewContent] = useState('');

  const handleCopy = async () => {
    if (!selectedFile) return;
    try {
      await navigator.clipboard.writeText(selectedFile.content);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy code:', err);
    }
  };

  const handleDownload = async () => {
    const zip = new JSZip();
    files.forEach((file) => {
      zip.file(file.name, file.content);
    });
    const blob = await zip.generateAsync({ type: 'blob' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'emilio-ai-project.zip';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Create a sandboxed preview with blob URLs to handle relative paths
  useEffect(() => {
    const mainHtmlFile = files.find((f) => f.name === 'index.html');
    if (!mainHtmlFile) {
      setPreviewContent(
        '<div class="flex items-center justify-center h-full text-gray-500"><h2>No index.html found to preview.</h2></div>',
      );
      return;
    }

    const blobUrls = new Map();

    // Create blob URLs for all files
    for (const file of files) {
      let mimeType = 'text/plain';
      if (file.name.endsWith('.html')) mimeType = 'text/html';
      else if (file.name.endsWith('.css')) mimeType = 'text/css';
      else if (file.name.endsWith('.js')) mimeType = 'application/javascript';
      else if (file.name.endsWith('.json')) mimeType = 'application/json';
      else if (file.name.endsWith('.svg')) mimeType = 'image/svg+xml';

      const blob = new Blob([file.content], { type: mimeType });
      blobUrls.set(file.name, URL.createObjectURL(blob));
    }

    let processedHtml = mainHtmlFile.content;

    // Replace relative paths with blob URLs
    processedHtml = processedHtml.replace(
      /(href|src)=["'](\.\/|)?([^"']+)["']/g,
      (match, attr, prefix, path) => {
        const absolutePath = path.startsWith('/') ? path.substring(1) : path;
        if (blobUrls.has(absolutePath)) {
          return `${attr}="${blobUrls.get(absolutePath)}"`;
        }
        return match; // Keep original if file not found
      },
    );

    setPreviewContent(processedHtml);

    // Clean up blob URLs on unmount
    return () => {
      for (const url of blobUrls.values()) {
        URL.revokeObjectURL(url);
      }
    };
  }, [files]);

  const renderPreview = () => {
    return (
      <div className="relative w-full h-[600px] bg-white rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700">
        <iframe
          srcDoc={previewContent}
          title="Project Preview"
          sandbox="allow-scripts allow-same-origin"
          width="100%"
          height="100%"
          style={{ border: 'none' }}
          className="absolute inset-0"
        />
      </div>
    );
  };

  return (
    <div className="flex flex-col gap-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-6 shadow-sm">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-3">
        <div className="inline-flex rounded-full bg-slate-100 dark:bg-slate-800 p-1">
          <ToggleButton
            icon={Play}
            label="Preview"
            isSelected={activeView === 'preview'}
            onClick={() => setActiveView('preview')}
          />
          <ToggleButton
            icon={Code2}
            label="Code"
            isSelected={activeView === 'code'}
            onClick={() => setActiveView('code')}
          />
          <ToggleButton
            icon={MessageCircle}
            label="Notes"
            isSelected={activeView === 'notes'}
            onClick={() => setActiveView('notes')}
          />
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <button
            type="button"
            onClick={handleCopy}
            disabled={activeView !== 'code' || !selectedFile}
            className={`px-3 py-2 rounded-lg transition-colors inline-flex text-sm border
                    items-center gap-2 w-full sm:w-auto justify-center disabled:opacity-50 disabled:cursor-not-allowed ${
                      isCopied
                        ? 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/50 dark:text-green-300 dark:border-green-700'
                        : 'bg-transparent text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 border-slate-300 dark:border-slate-700'
                    }`}
          >
            {isCopied ? (
              <>
                <Check size={16} />
                <span>Copied!</span>
              </>
            ) : (
              <>
                <Copy size={16} />
                <span>Copy Code</span>
              </>
            )}
          </button>
          <button
            type="button"
            onClick={handleDownload}
            className="px-3.5 py-2 rounded-lg transition-colors inline-flex text-sm
                    items-center gap-2 w-full sm:w-auto justify-center bg-slate-800 text-white hover:bg-slate-700 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200"
          >
            <Download size={16} />
            <span>Download ZIP</span>
          </button>
        </div>
      </div>

      <div>
        {activeView === 'code' && (
          <div className="flex w-full h-[600px] rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">
            <div className="w-1/3 max-w-xs bg-slate-50 dark:bg-slate-800/50 border-r border-slate-200 dark:border-slate-700 overflow-y-auto">
              <div className="p-3 font-semibold text-sm text-slate-700 dark:text-slate-200 border-b border-slate-200 dark:border-slate-700">
                Files
              </div>
              <ul>
                {files.map((file) => (
                  <li key={file.name}>
                    <button
                      type="button"
                      onClick={() => setSelectedFile(file)}
                      className={`w-full text-left px-3 py-2 text-sm flex items-center gap-2 transition-colors ${
                        selectedFile?.name === file.name
                          ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300'
                          : 'hover:bg-slate-200/50 dark:hover:bg-slate-700/50'
                      }`}
                    >
                      <FileCode size={14} />
                      <span>{file.name}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
            <div className="w-2/3 flex-1">
              {selectedFile ? (
                <Editor
                  height="600px"
                  language={selectedFile.lang}
                  value={selectedFile.content}
                  theme={isDarkMode ? 'vs-dark' : 'light'}
                  path={selectedFile.name}
                  options={{
                    minimap: { enabled: false },
                    fontSize: 13,
                    readOnly: true,
                    wordWrap: 'on',
                  }}
                />
              ) : (
                <div className="flex items-center justify-center h-full text-slate-500">
                  Select a file to view its content.
                </div>
              )}
            </div>
          </div>
        )}
        {activeView === 'preview' && renderPreview()}
        {activeView === 'notes' && (
          <div className="w-full h-[600px] rounded-lg overflow-y-auto border border-slate-200 dark:border-slate-700 p-6 prose prose-sm max-w-none bg-white dark:bg-slate-900 dark:prose-invert">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {`${header}\n\n${notes}`}
            </ReactMarkdown>
          </div>
        )}
      </div>
    </div>
  );
};

export default CodePreview;
