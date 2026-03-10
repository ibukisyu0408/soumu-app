'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { Vehicle } from '@/lib/types'
import SearchInput from '@/components/SearchInput'

export default function VehicleListPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchVehicles()
  }, [])

  async function fetchVehicles() {
    setLoading(true)
    const { data, error } = await supabase
      .from('vehicles')
      .select('*')
      .order('created_at', { ascending: false })

    if (!error && data) {
      setVehicles(data as Vehicle[])
    }
    setLoading(false)
  }

  const filtered = vehicles.filter(
    (v) =>
      v.name.includes(search) ||
      (v.number_plate && v.number_plate.includes(search))
  )

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">車両一覧</h1>
        <Link
          href="/vehicles/new"
          className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm hover:bg-blue-700"
        >
          新規登録
        </Link>
      </div>

      <div className="mb-4">
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="車両名・ナンバーで検索..."
        />
      </div>

      {loading ? (
        <p className="text-gray-500">読み込み中...</p>
      ) : filtered.length === 0 ? (
        <p className="text-gray-500">車両が見つかりません</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full bg-white border border-gray-200 rounded-lg text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-4 py-3 font-semibold">車両名</th>
                <th className="text-left px-4 py-3 font-semibold">ナンバー</th>
                <th className="text-left px-4 py-3 font-semibold">種別</th>
                <th className="text-left px-4 py-3 font-semibold">使用者</th>
                <th className="text-left px-4 py-3 font-semibold">次回車検日</th>
                <th className="text-center px-4 py-3 font-semibold">操作</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((v) => (
                <tr key={v.id} className="border-t border-gray-100 hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <Link href={`/vehicles/detail?id=${v.id}`} className="text-blue-600 hover:underline font-medium">
                      {v.name}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{v.number_plate || '-'}</td>
                  <td className="px-4 py-3 text-gray-600">{v.type || '-'}</td>
                  <td className="px-4 py-3 text-gray-600">{v.user_name || '-'}</td>
                  <td className="px-4 py-3 text-gray-600">{v.inspection_date || '-'}</td>
                  <td className="px-4 py-3 text-center">
                    <Link
                      href={`/vehicles/edit?id=${v.id}`}
                      className="text-blue-600 hover:underline text-xs"
                    >
                      編集
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
