'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

export default function VehicleNewPage() {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    name: '',
    number_plate: '',
    type: '',
    manufacturer: '',
    model: '',
    year: '',
    color: '',
    lease_company: '',
    lease_start_date: '',
    lease_end_date: '',
    lease_monthly_fee: '',
    inspection_date: '',
    insurance_company: '',
    insurance_end_date: '',
    user_name: '',
    department: '',
    notes: '',
  })

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name.trim()) {
      alert('車両名は必須です')
      return
    }

    setSaving(true)

    const { data, error } = await supabase
      .from('vehicles')
      .insert({
        name: form.name,
        number_plate: form.number_plate || null,
        type: form.type || null,
        manufacturer: form.manufacturer || null,
        model: form.model || null,
        year: form.year ? parseInt(form.year) : null,
        color: form.color || null,
        lease_company: form.lease_company || null,
        lease_start_date: form.lease_start_date || null,
        lease_end_date: form.lease_end_date || null,
        lease_monthly_fee: form.lease_monthly_fee ? parseInt(form.lease_monthly_fee) : null,
        inspection_date: form.inspection_date || null,
        insurance_company: form.insurance_company || null,
        insurance_end_date: form.insurance_end_date || null,
        user_name: form.user_name || null,
        department: form.department || null,
        notes: form.notes || null,
      })
      .select()
      .single()

    if (error) {
      alert('保存に失敗しました: ' + error.message)
      setSaving(false)
      return
    }

    router.push(`/vehicles/detail?id=${data.id}`)
  }

  const inputClass = "border border-gray-300 rounded-md px-3 py-2 w-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">車両 新規登録</h1>

      <form onSubmit={handleSubmit} className="bg-white rounded-lg border border-gray-200 p-6 max-w-2xl">
        <h2 className="text-lg font-semibold mb-4">基本情報</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              車両名 <span className="text-red-500">*</span>
            </label>
            <input type="text" name="name" value={form.name} onChange={handleChange} className={inputClass} />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">ナンバープレート</label>
            <input type="text" name="number_plate" value={form.number_plate} onChange={handleChange} className={inputClass} />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">種別</label>
            <select name="type" value={form.type} onChange={handleChange} className={inputClass}>
              <option value="">選択してください</option>
              <option value="社用車">社用車</option>
              <option value="リース">リース</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">メーカー</label>
              <input type="text" name="manufacturer" value={form.manufacturer} onChange={handleChange} className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">車種</label>
              <input type="text" name="model" value={form.model} onChange={handleChange} className={inputClass} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">年式</label>
              <input type="number" name="year" value={form.year} onChange={handleChange} className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">色</label>
              <input type="text" name="color" value={form.color} onChange={handleChange} className={inputClass} />
            </div>
          </div>
        </div>

        <hr className="my-6" />

        <h2 className="text-lg font-semibold mb-4">リース情報</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">リース会社</label>
            <input type="text" name="lease_company" value={form.lease_company} onChange={handleChange} className={inputClass} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">リース開始日</label>
              <input type="date" name="lease_start_date" value={form.lease_start_date} onChange={handleChange} className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">リース終了日</label>
              <input type="date" name="lease_end_date" value={form.lease_end_date} onChange={handleChange} className={inputClass} />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">リース月額（円）</label>
            <input type="number" name="lease_monthly_fee" value={form.lease_monthly_fee} onChange={handleChange} className={inputClass} />
          </div>
        </div>

        <hr className="my-6" />

        <h2 className="text-lg font-semibold mb-4">車検・保険</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">次回車検日</label>
            <input type="date" name="inspection_date" value={form.inspection_date} onChange={handleChange} className={inputClass} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">保険会社</label>
              <input type="text" name="insurance_company" value={form.insurance_company} onChange={handleChange} className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">保険満了日</label>
              <input type="date" name="insurance_end_date" value={form.insurance_end_date} onChange={handleChange} className={inputClass} />
            </div>
          </div>
        </div>

        <hr className="my-6" />

        <h2 className="text-lg font-semibold mb-4">使用情報</h2>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">使用者</label>
              <input type="text" name="user_name" value={form.user_name} onChange={handleChange} className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">部署</label>
              <input type="text" name="department" value={form.department} onChange={handleChange} className={inputClass} />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">備考</label>
            <textarea name="notes" value={form.notes} onChange={handleChange} rows={3} className={inputClass} />
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
            href="/vehicles"
            className="border border-gray-300 px-6 py-2 rounded-md text-sm hover:bg-gray-50"
          >
            キャンセル
          </Link>
        </div>
      </form>
    </div>
  )
}
