"use client"

import { useState, useRef } from 'react'
import { Upload, X, FileText } from 'lucide-react'

export default function CVUpload({ 
  onFileChange 
}: { 
  onFileChange: (file: File | null) => void 
}) {
  const [file, setFile] = useState<File | null>(null)
  const [error, setError] = useState<string>('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (!selectedFile) return

    // Validate file type
    const validTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ]
    
    if (!validTypes.includes(selectedFile.type)) {
      setError('Chỉ chấp nhận file PDF, DOC, DOCX')
      return
    }

    // Validate file size (3MB)
    const maxSize = 3 * 1024 * 1024
    if (selectedFile.size > maxSize) {
      setError('Dung lượng file không được vượt quá 3MB')
      return
    }

    setError('')
    setFile(selectedFile)
    onFileChange(selectedFile)
  }

  const handleRemoveFile = () => {
    setFile(null)
    setError('')
    onFileChange(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Upload CV <span className="text-red-500">*</span>
      </label>
      
      {!file ? (
        <div
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-goldDark transition-colors"
        >
          <Upload className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-sm text-gray-600 mb-1">
            Nhấn để chọn file hoặc kéo thả file vào đây
          </p>
          <p className="text-xs text-gray-500">
            Hỗ trợ: PDF, DOC, DOCX (Tối đa 3MB)
          </p>
        </div>
      ) : (
        <div className="border border-gray-300 rounded-lg p-4 flex items-center justify-between bg-green-50">
          <div className="flex items-center gap-3">
            <FileText className="w-8 h-8 text-goldDark" />
            <div>
              <p className="text-sm font-medium text-gray-900">{file.name}</p>
              <p className="text-xs text-gray-500">
                {(file.size / 1024).toFixed(0)} KB
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleRemoveFile}
            className="text-red-500 hover:text-red-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      )}

      {error && (
        <p className="mt-2 text-sm text-red-600">{error}</p>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.doc,.docx"
        onChange={handleFileSelect}
        className="hidden"
      />
    </div>
  )
}
