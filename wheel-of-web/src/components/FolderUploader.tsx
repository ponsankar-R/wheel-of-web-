'use client';

import { useState, useRef } from 'react';
import JSZip from 'jszip';
import { Loader2, UploadCloud, CheckCircle2, AlertCircle } from 'lucide-react';

interface FolderUploaderProps {
  regNumber: string;
  onUploadSuccess: () => void;
}

export default function FolderUploader({ regNumber, onUploadSuccess }: FolderUploaderProps) {
  const [zipping, setZipping] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFolderSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setError('');
    setZipping(true);

    try {
      const zip = new JSZip();
      let totalSize = 0;

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const path = (file as any).webkitRelativePath || file.name;

        // Skip node_modules
        if (path.includes('node_modules/')) {
          continue;
        }

        totalSize += file.size;
        
        // Quick estimate: if uncompressed size is way over 20-25MB, it'll likely exceed 16MB compressed
        // But the user specifically said check 16MB file size. Zip might be smaller.
        // We'll check the final zip size.
        
        const content = await file.arrayBuffer();
        zip.file(path, content);
      }

      const zipBlob = await zip.generateAsync({ type: 'blob' });
      setZipping(false);

      if (zipBlob.size > 16 * 1024 * 1024) {
        setError('Error: The resulting zip file is larger than 16MB. Please remove some files.');
        return;
      }

      // Automatic upload
      setUploading(true);
      const formData = new FormData();
      formData.append('regNumber', regNumber);
      formData.append('file', zipBlob, `project_${regNumber}.zip`);

      const response = await fetch('/api/upload-zip', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        setSuccess(true);
        onUploadSuccess();
      } else {
        const data = await response.json();
        setError(data.error || 'Upload failed');
      }
    } catch (err) {
      console.error(err);
      setError('An error occurred during zipping or upload.');
    } finally {
      setZipping(false);
      setUploading(false);
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto p-8 bg-white/10 backdrop-blur-md rounded-2xl border-2 border-dashed border-white/30 text-white">
      <div className="flex flex-col items-center text-center">
        {!success ? (
          <>
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mb-4">
              {zipping || uploading ? (
                <Loader2 className="animate-spin text-white w-8 h-8" />
              ) : (
                <UploadCloud className="text-white w-8 h-8" />
              )}
            </div>
            
            <h3 className="text-2xl font-bold mb-2">Upload your Code</h3>
            <p className="text-white/70 mb-6">Select your project folder. We'll automatically zip it and skip node_modules.</p>
            
            <label className="cursor-pointer group">
              <input
                type="file"
                ref={inputRef}
                className="hidden"
                webkitdirectory="true"
                directory=""
                multiple
                onChange={handleFolderSelect}
                disabled={zipping || uploading}
              />
              <div className="px-8 py-3 bg-white text-blue-600 font-bold rounded-lg group-hover:bg-blue-50 transition transform active:scale-95 flex items-center">
                {zipping ? 'Zipping Files...' : uploading ? 'Uploading Zip...' : 'Select Project Folder'}
              </div>
            </label>
            
            {error && (
              <div className="mt-4 flex items-center text-red-200 bg-red-500/20 px-4 py-2 rounded-lg">
                <AlertCircle className="w-4 h-4 mr-2" />
                <span className="text-sm">{error}</span>
              </div>
            )}
            
            <p className="mt-4 text-xs text-white/50 italic">Max file size: 16MB (node_modules will be excluded)</p>
          </>
        ) : (
          <div className="py-8">
            <CheckCircle2 className="w-20 h-20 text-green-400 mx-auto mb-4 animate-bounce" />
            <h3 className="text-3xl font-bold mb-2">Awesome Job!</h3>
            <p className="text-green-100">Your project has been successfully uploaded and linked to your registration.</p>
          </div>
        )}
      </div>
    </div>
  );
}

// Typing extension for webkitdirectory
declare module 'react' {
  interface InputHTMLAttributes<T> extends HTMLAttributes<T> {
    webkitdirectory?: string;
    directory?: string;
  }
}
