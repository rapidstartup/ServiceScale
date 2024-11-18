import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload } from 'lucide-react';

interface FileDropzoneProps {
  onFileAccepted: (file: File) => void;
}

const FileDropzone: React.FC<FileDropzoneProps> = ({ onFileAccepted }) => {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      onFileAccepted(acceptedFiles[0]);
    }
  }, [onFileAccepted]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
    },
    maxFiles: 1,
  });

  return (
    <div
      {...getRootProps()}
      className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
        ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-400'}`}
    >
      <input {...getInputProps()} />
      <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
      {isDragActive ? (
        <p className="text-blue-500">Drop the CSV file here...</p>
      ) : (
        <div className="space-y-2">
          <p className="text-gray-600">Drag & drop a CSV file here, or click to select</p>
          <p className="text-sm text-gray-500">Only CSV files are accepted</p>
        </div>
      )}
    </div>
  );
};

export default FileDropzone;