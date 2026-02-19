'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { ParkingSpace } from '@/lib/types'
import ParkingStatusBadge from '@/components/ParkingStatusBadge'

export default function ParkingEditPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    name: '',
    address: '',
    contract_company: '',
    monthly_fee: '',
    contract_start_date: '',
    contract_end_date: '',
    notes: '',
  })
  const [spaces, setSpaces] = useState<ParkingSpace[]>([])
  const [newSpaceNumber, setNewSpaceNumber] = useState('')
  const [editingSpace, setEditingSpace] = useState<string | null>(null)
  const [editSpaceForm, setEditSpaceForm] = useState({
    space_number: '',
    status: '空き' as '空き' | '利用中',
    user_name: '',
    vehicle_number: '',
    notes: '',
  })

  useEffect(() => {
    fetchData()
  }, [id])

  async function fetchData() {
    setLoading(true)
    const [lotRes, spacesRes] = await Promise.all([
      supabase.from('parking_lots').select('*').eq('id', id).single(),
      supabase.from('parking_spaces').select('*').eq('parking_lot_id', id).order('space_number'),
    ])

    if (lotRes.data) {
      const lot = lotRes.data
      setForm({
        name: lot.name || '',
        address: lot.address || '',
        contract_company: lot.contract_company || '',
        monthly_fee: lot.monthly_fee?.toString() || '',
        contract_start_date: lot.contract_start_date || '',
        contract_end_date: lot.contract_end_date || '',
        notes: lot.notes || '',
      })
    }
    if (spacesRes.data) setSpaces(spacesRes.data)
    setLoading(false)
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name.trim()) {
      alert('駐車場名は必須です')
      return
    }

    setSaving(true)
    const { error } = await supabase
      .from('parking_lots')
      .update({
        name: form.name,
        address: form.address || null,
        contract_company: form.contract_company || null,
        monthly_fee: form.monthly_fee ? parseInt(form.monthly_fee) : null,
        contract_start_date: form.contract_start_date || null,
        contract_end_date: form.contract_end_date || null,
        notes: form.notes || null,
      })
      .eq('id', id)

    if (error) {
      alert('保存に失敗しました: ' + error.message)
      setSaving(false)
      return
    }

    router.push(`/parking/${id}`)
  }

  async function handleAddSpace() {
    if (!newSpaceNumber.trim()) return

    const numbers = newSpaceNumber.split(',').map(s => s.trim()).filter(Boolean)
    await supabase.from('parking_spaces').insert(
      numbers.map(num => ({
        parking_lot_id: id,
        space_number: num,
        status: '空き',
      }))
    )
    setNewSpaceNumber('')
    fetchData()
  }

  async function handleDeleteSpace(spaceId: string) {
    if (!confirm('この駐車枠を削除しますか？')) return
    await supabase.from('parking_spaces').delete().eq('id', spaceId)
    fetchData()
  }

  function startEditSpace(space: ParkingSpace) {
    setEditingSpace(space.id)
    setEditSpaceForm({
      space_number: space.space_number,
      status: space.status,
      user_name: space.user_name || '',
      vehicle_number: space.vehicle_number || '',
      notes: space.notes || '',
    })
  }

  async function handleSaveSpace(spaceId: string) {
    await supabase
      .from('parking_spaces')
      .update({
        space_number: editSpaceForm.space_number,
        status: editSpaceForm.status,
        user_name: editSpaceForm.user_name || null,
        vehicle_number: editSpaceForm.vehicle_number || null,
        notes: editSpaceForm.notes || null,
      })
      .eq('id', spaceId)
    setEditingSpace(null)
    fetchData()
  }

  if (loading) return <p className="text-gray-500">読み込み中...</p>

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">駐車場 編集</h1>

      <form onSubmit={handleSubmit} className="bg-white rounded-lg border border-gray-200 p-6 max-w-2xl mb-6">
        <h2 className="text-lg font-semibold mb-4">基本情報</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              駐車場名 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              className="border border-gray-300 rounded-md px-3 py-2 w-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">住所</label>
            <input
              type="text"
              name="address"
              value={form.address}
              onChange={handleChange}
              className="border border-gray-300 rounded-md px-3 py-2 w-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">契約法人</label>
            <input
              type="text"
              name="contract_company"
              value={form.contract_company}
              onChange={handleChange}
              className="border border-gray-300 rounded-md px-3 py-2 w-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">月額料金（円）</label>
            <input
              type="number"
              name="monthly_fee"
              value={form.monthly_fee}
              onChange={handleChange}
              className="border border-gray-300 rounded-md px-3 py-2 w-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">契約開始日</label>
              <input
                type="date"
                name="contract_start_date"
                value={form.contract_start_date}
                onChange={handleChange}
                className="border border-gray-300 rounded-md px-3 py-2 w-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">契約終了日</label>
              <input
                type="date"
                name="contract_end_date"
                value={form.contract_end_date}
                onChange={handleChange}
                className="border border-gray-300 rounded-md px-3 py-2 w-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">備考</label>
            <textarea
              name="notes"
              value={form.notes}
              onChange={handleChange}
              rows={3}
              className="border border-gray-300 rounded-md px-3 py-2 w-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="mt-6 flex gap-3">
          <button
            type="submit"
            disabled={saving}
            className="bg-blue-600 text-white px-6 py-2 rounded-md text-sm hover:bg-blue-700 disabled:opacity-50"
          >
            {saving ? '保存中...' : '保存する'}
          </button>
          <Link
            href={`/parking/${id}`}
            className="border border-gray-300 px-6 py-2 rounded-md text-sm hover:bg-gray-50"
          >
            キャンセル
          </Link>
        </div>
      </form>

      <div className="bg-white rounded-lg border border-gray-200 p-6 max-w-2xl">
        <h2 className="text-lg font-semibold mb-4">駐車枠管理</h2>

        <div className="flex gap-2 mb-4">
          <input
            type="text"
            value={newSpaceNumber}
            onChange={(e) => setNewSpaceNumber(e.target.value)}
            placeholder="区画番号（カンマ区切りで複数可）"
            className="border border-gray-300 rounded-md px-3 py-2 text-sm flex-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="button"
            onClick={handleAddSpace}
            className="bg-green-600 text-white px-4 py-2 rounded-md text-sm hover:bg-green-700"
          >
            枠追加
          </button>
        </div>

        {spaces.length === 0 ? (
          <p className="text-gray-500 text-sm">駐車枠がありません</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-3 py-2 font-semibold">区画番号</th>
                <th className="text-center px-3 py-2 font-semibold">ステータス</th>
                <th className="text-left px-3 py-2 font-semibold">使用者</th>
                <th className="text-left px-3 py-2 font-semibold">車両ナンバー</th>
                <th className="text-left px-3 py-2 font-semibold">備考</th>
                <th className="text-center px-3 py-2 font-semibold">操作</th>
              </tr>
            </thead>
            <tbody>
              {spaces.map((space) => (
                <tr key={space.id} className="border-t border-gray-100">
                  {editingSpace === space.id ? (
                    <>
                      <td className="px-3 py-2">
                        <input
                          type="text"
                          value={editSpaceForm.space_number}
                          onChange={(e) => setEditSpaceForm({ ...editSpaceForm, space_number: e.target.value })}
                          className="border rounded px-2 py-1 text-xs w-full"
                        />
                      </td>
                      <td className="px-3 py-2 text-center">
                        <select
                          value={editSpaceForm.status}
                          onChange={(e) => setEditSpaceForm({ ...editSpaceForm, status: e.target.value as '空き' | '利用中' })}
                          className="border rounded px-2 py-1 text-xs"
                        >
                          <option value="空き">空き</option>
                          <option value="利用中">利用中</option>
                        </select>
                      </td>
                      <td className="px-3 py-2">
                        <input
                          type="text"
                          value={editSpaceForm.user_name}
                          onChange={(e) => setEditSpaceForm({ ...editSpaceForm, user_name: e.target.value })}
                          className="border rounded px-2 py-1 text-xs w-full"
                        />
                      </td>
                      <td className="px-3 py-2">
                        <input
                          type="text"
                          value={editSpaceForm.vehicle_number}
                          onChange={(e) => setEditSpaceForm({ ...editSpaceForm, vehicle_number: e.target.value })}
                          className="border rounded px-2 py-1 text-xs w-full"
                        />
                      </td>
                      <td className="px-3 py-2">
                        <input
                          type="text"
                          value={editSpaceForm.notes}
                          onChange={(e) => setEditSpaceForm({ ...editSpaceForm, notes: e.target.value })}
                          className="border rounded px-2 py-1 text-xs w-full"
                        />
                      </td>
                      <td className="px-3 py-2 text-center">
                        <button
                          onClick={() => handleSaveSpace(space.id)}
                          className="text-green-600 hover:underline text-xs mr-1"
                        >
                          保存
                        </button>
                        <button
                          onClick={() => setEditingSpace(null)}
                          className="text-gray-600 hover:underline text-xs"
                        >
                          取消
                        </button>
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="px-3 py-2 font-medium">{space.space_number}</td>
                      <td className="px-3 py-2 text-center">
                        <ParkingStatusBadge status={space.status} />
                      </td>
                      <td className="px-3 py-2">{space.user_name || '-'}</td>
                      <td className="px-3 py-2">{space.vehicle_number || '-'}</td>
                      <td className="px-3 py-2 text-gray-600">{space.notes || '-'}</td>
                      <td className="px-3 py-2 text-center">
                        <button
                          onClick={() => startEditSpace(space)}
                          className="text-blue-600 hover:underline text-xs mr-1"
                        >
                          編集
                        </button>
                        <button
                          onClick={() => handleDeleteSpace(space.id)}
                          className="text-red-600 hover:underline text-xs"
                        >
                          削除
                        </button>
                      </td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
