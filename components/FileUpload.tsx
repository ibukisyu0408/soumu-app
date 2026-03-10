'use client'

import { useState, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import { ParkingLotFile } from '@/lib/types'

const MAX_FILES = 5
const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB
const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'application/pdf']
const BUCKET_NAME = 'parking-lot-files'

type PendingFile = {
  file: File
  preview: string | null
}

type Props = {
  parkingLotId?: string
  existingFiles?: ParkingLotFile[]
  onFilesChange?: (pendingFiles: File[]) => void
  mode: 'create' | 'edit' | 'view'
}

export default function FileUpload({ parkingLotId, existingFiles = [], onFilesChange, mode }: Props) {
  const [savedFiles, setSavedFiles] = useState<ParkingLotFile[]>(existingFiles)
  const [pendingFiles, setPendingFiles] = useState<PendingFile[]>([])
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const totalCount = savedFiles.length + pendingFiles.length

  function handleSelectFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || [])
    setError('')

    if (totalCount + files.length > MAX_FILES) {
      setError(`ファイルは最大${MAX_FILES}件までです（現在${totalCount}件）`)
      return
    }

    for (const file of files) {
      if (!ACCEPTED_TYPES.includes(file.type)) {
        setError('対応形式: JPG, PNG, PDF のみアップロード可能です')
        return
      }
      if (file.size > MAX_FILE_SIZE) {
        setError(`${file.name} のサイズが10MBを超えています`)
        return
      }
    }

    const newPending = files.map((file) => ({
      file,
      preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : null,
    }))

    const updated = [...pendingFiles, ...newPending]
    setPendingFiles(updated)
    onFilesChange?.(updated.map((p) => p.file))

    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  function handleRemovePending(index: number) {
    const removed = pendingFiles[index]
    if (removed.preview) URL.revokeObjectURL(removed.preview)
    const updated = pendingFiles.filter((_, i) => i !== index)
    setPendingFiles(updated)
    onFilesChange?.(updated.map((p) => p.file))
  }

  async function handleDeleteSaved(file: ParkingLotFile) {
    if (!confirm(`${file.file_name} を削除しますか？`)) return

    await supabase.storage.from(BUCKET_NAME).remove([file.storage_path])
    await supabase.from('parking_lot_files').delete().eq('id', file.id)
    setSavedFiles(savedFiles.filter((f) => f.id !== file.id))
  }

  function handleViewFile(file: ParkingLotFile) {
    const { data } = supabase.storage.from(BUCKET_NAME).getPublicUrl(file.storage_path)
    if (data?.publicUrl) {
      window.open(data.publicUrl, '_blank')
    }
  }

  // 編集画面用: 即時アップロード
  async function handleUploadImmediate() {
    if (!parkingLotId || pendingFiles.length === 0) return

    setUploading(true)
    try {
      const results = await Promise.all(
        pendingFiles.map(async (pending, index) => {
          const storagePath = `${parkingLotId}/${Date.now()}_${index}_${pending.file.name}`

          const { error: uploadError } = await supabase.storage
            .from(BUCKET_NAME)
            .upload(storagePath, pending.file)

          if (uploadError) throw uploadError

          const { data } = await supabase
            .from('parking_lot_files')
            .insert({
              parking_lot_id: parkingLotId,
              file_name: pending.file.name,
              storage_path: storagePath,
              file_size: pending.file.size,
              file_type: pending.file.type,
            })
            .select()
            .single()

          return data
        })
      )

      const newFiles = results.filter(Boolean) as ParkingLotFile[]
      setSavedFiles((prev) => [...prev, ...newFiles])

      pendingFiles.forEach((p) => {
        if (p.preview) URL.revokeObjectURL(p.preview)
      })
      setPendingFiles([])
      onFilesChange?.([])
    } catch {
      alert('アップロードに失敗しました')
    } finally {
      setUploading(false)
    }
  }

  // view モード
  if (mode === 'view') {
    if (savedFiles.length === 0) {
      return (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold mb-4">添付ファイル</h2>
          <p className="text-gray-500 text-sm">添付ファイルはありません</p>
        </div>
      )
    }

    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-lg font-semibold mb-4">添付ファイル（{savedFiles.length}件）</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {savedFiles.map((file) => (
            <div
              key={file.id}
              onClick={() => handleViewFile(file)}
              className="border border-gray-200 rounded-lg p-3 flex items-center gap-3 cursor-pointer hover:bg-gray-50 transition-colors"
            >
              {file.file_type.startsWith('image/') ? (
                <div className="w-10 h-10 bg-blue-50 rounded flex items-center justify-center text-blue-500 flex-shrink-0">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              ) : (
                <div className="w-10 h-10 bg-red-50 rounded flex items-center justify-center text-red-500 flex-shrink-0">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                </div>
              )}
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium truncate">{file.file_name}</p>
                <p className="text-xs text-gray-500">{formatFileSize(file.file_size)}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  // create / edit モード
  return (
    <div>
      <h2 className="text-lg font-semibold mb-4">添付ファイル</h2>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded-md text-sm mb-4">
          {error}
        </div>
      )}

      {/* 保存済みファイル */}
      {savedFiles.length > 0 && (
        <div className="mb-4">
          <p className="text-sm text-gray-600 mb-2">保存済み（{savedFiles.length}件）</p>
          <div className="space-y-2">
            {savedFiles.map((file) => (
              <div key={file.id} className="flex items-center gap-3 border border-gray-200 rounded-lg p-2">
                {file.file_type.startsWith('image/') ? (
                  <div className="w-8 h-8 bg-blue-50 rounded flex items-center justify-center text-blue-500 flex-shrink-0">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                ) : (
                  <div className="w-8 h-8 bg-red-50 rounded flex items-center justify-center text-red-500 flex-shrink-0">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <p className="text-sm truncate">{file.file_name}</p>
                  <p className="text-xs text-gray-500">{formatFileSize(file.file_size)}</p>
                </div>
                <button
                  type="button"
                  onClick={() => handleDeleteSaved(file)}
                  className="text-red-500 hover:text-red-700 text-xs flex-shrink-0"
                >
                  削除
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 未アップロードファイル */}
      {pendingFiles.length > 0 && (
        <div className="mb-4">
          <p className="text-sm text-gray-600 mb-2">選択済み（{pendingFiles.length}件）</p>
          <div className="space-y-2">
            {pendingFiles.map((pending, index) => (
              <div key={index} className="flex items-center gap-3 border border-gray-200 rounded-lg p-2 bg-yellow-50">
                {pending.preview ? (
                  <img src={pending.preview} alt="" className="w-8 h-8 object-cover rounded flex-shrink-0" />
                ) : (
                  <div className="w-8 h-8 bg-red-50 rounded flex items-center justify-center text-red-500 flex-shrink-0">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <p className="text-sm truncate">{pending.file.name}</p>
                  <p className="text-xs text-gray-500">{formatFileSize(pending.file.size)}</p>
                </div>
                <button
                  type="button"
                  onClick={() => handleRemovePending(index)}
                  className="text-red-500 hover:text-red-700 text-xs flex-shrink-0"
                >
                  取消
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ファイル選択 */}
      {totalCount < MAX_FILES && (
        <div>
          <input
            ref={fileInputRef}
            type="file"
            accept=".jpg,.jpeg,.png,.pdf"
            multiple
            onChange={handleSelectFiles}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="border border-dashed border-gray-300 rounded-lg px-4 py-3 w-full text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-50"
          >
            {uploading ? 'アップロード中...' : 'ファイルを選択（JPG, PNG, PDF / 最大10MB）'}
          </button>
          <p className="text-xs text-gray-500 mt-1">
            あと{MAX_FILES - totalCount}件追加可能
          </p>
        </div>
      )}

      {/* 編集画面用: 即時アップロードボタン */}
      {mode === 'edit' && pendingFiles.length > 0 && (
        <button
          type="button"
          onClick={handleUploadImmediate}
          disabled={uploading}
          className="mt-3 bg-green-600 text-white px-4 py-2 rounded-md text-sm hover:bg-green-700 disabled:opacity-50"
        >
          {uploading ? 'アップロード中...' : 'ファイルをアップロード'}
        </button>
      )}
    </div>
  )
}

// コンポーネント外部から呼び出す用のアップロード関数（並列実行）
export async function uploadFilesForParkingLot(lotId: string, files: File[]) {
  await Promise.all(
    files.map(async (file, index) => {
      const storagePath = `${lotId}/${Date.now()}_${index}_${file.name}`

      const { error: uploadError } = await supabase.storage
        .from(BUCKET_NAME)
        .upload(storagePath, file)

      if (uploadError) throw uploadError

      await supabase.from('parking_lot_files').insert({
        parking_lot_id: lotId,
        file_name: file.name,
        storage_path: storagePath,
        file_size: file.size,
        file_type: file.type,
      })
    })
  )
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}
