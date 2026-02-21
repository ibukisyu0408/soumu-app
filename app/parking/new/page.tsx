'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

export default function ParkingNewPage() {
  const router = useRouter()
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
  const [spacesInput, setSpacesInput] = useState('')

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

    const { data: lot, error } = await supabase
      .from('parking_lots')
      .insert({
        name: form.name,
        address: form.address || null,
        contract_company: form.contract_company || null,
        monthly_fee: form.monthly_fee ? parseInt(form.monthly_fee) : null,
        contract_start_date: form.contract_start_date || null,
        contract_end_date: form.contract_end_date || null,
        notes: form.notes || null,
      })
      .select()
      .single()

    if (error) {
      alert('保存に失敗しました: ' + error.message)
      setSaving(false)
      return
    }

    // 駐車枠の一括作成
    if (spacesInput.trim() && lot) {
      const spaceNumbers = spacesInput
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean)

      if (spaceNumbers.length > 0) {
        await supabase.from('parking_spaces').insert(
          spaceNumbers.map((num) => ({
            parking_lot_id: lot.id,
            space_number: num,
            status: '空き',
          }))
        )
      }
    }

    router.push(`/parking/detail?id=${lot.id}`)
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">駐車場 新規登録</h1>

      <form onSubmit={handleSubmit} className="bg-white rounded-lg border border-gray-200 p-6 max-w-2xl">
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

          <hr className="my-4" />

          <div>
            <label className="block text-sm font-medium mb-1">
              駐車枠（カンマ区切りで区画番号を入力）
            </label>
            <input
              type="text"
              value={spacesInput}
              onChange={(e) => setSpacesInput(e.target.value)}
              placeholder="例: A-1, A-2, A-3, B-1, B-2"
              className="border border-gray-300 rounded-md px-3 py-2 w-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-xs text-gray-500 mt-1">
              登録後に個別編集も可能です
            </p>
          </div>
        </div>

        <div className="mt-6 flex gap-3">
          <button
            type="submit"
            disabled={saving}
            className="bg-blue-600 text-white px-6 py-2 rounded-md text-sm hover:bg-blue-700 disabled:opacity-50"
          >
            {saving ? '保存中...' : '登録する'}
          </button>
          <Link
            href="/parking"
            className="border border-gray-300 px-6 py-2 rounded-md text-sm hover:bg-gray-50"
          >
            キャンセル
          </Link>
        </div>
      </form>
    </div>
  )
}
