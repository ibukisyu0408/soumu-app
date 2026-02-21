'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { ParkingLot, ParkingSpace } from '@/lib/types'
import SearchInput from '@/components/SearchInput'
import ParkingStatusBadge from '@/components/ParkingStatusBadge'

type LotWithSpaces = ParkingLot & { parking_spaces: ParkingSpace[] }

export default function ParkingListPage() {
  const [lots, setLots] = useState<LotWithSpaces[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchLots()
  }, [])

  async function fetchLots() {
    setLoading(true)
    const { data, error } = await supabase
      .from('parking_lots')
      .select('*, parking_spaces(*)')
      .order('created_at', { ascending: false })

    if (!error && data) {
      setLots(data as LotWithSpaces[])
    }
    setLoading(false)
  }

  const filtered = lots.filter(
    (lot) =>
      lot.name.includes(search) ||
      (lot.address && lot.address.includes(search))
  )

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">駐車場一覧</h1>
        <Link
          href="/parking/new"
          className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm hover:bg-blue-700"
        >
          新規登録
        </Link>
      </div>

      <div className="mb-4">
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="駐車場名・住所で検索..."
        />
      </div>

      {loading ? (
        <p className="text-gray-500">読み込み中...</p>
      ) : filtered.length === 0 ? (
        <p className="text-gray-500">駐車場が見つかりません</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full bg-white border border-gray-200 rounded-lg text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-4 py-3 font-semibold">駐車場名</th>
                <th className="text-left px-4 py-3 font-semibold">住所</th>
                <th className="text-left px-4 py-3 font-semibold">契約法人</th>
                <th className="text-center px-4 py-3 font-semibold">総枠数</th>
                <th className="text-center px-4 py-3 font-semibold">空き</th>
                <th className="text-center px-4 py-3 font-semibold">利用中</th>
                <th className="text-center px-4 py-3 font-semibold">操作</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((lot) => {
                const total = lot.parking_spaces.length
                const available = lot.parking_spaces.filter(
                  (s) => s.status === '空き'
                ).length
                const occupied = total - available
                return (
                  <tr key={lot.id} className="border-t border-gray-100 hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <Link href={`/parking/detail?id=${lot.id}`} className="text-blue-600 hover:underline font-medium">
                        {lot.name}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{lot.address || '-'}</td>
                    <td className="px-4 py-3 text-gray-600">{lot.contract_company || '-'}</td>
                    <td className="px-4 py-3 text-center">{total}</td>
                    <td className="px-4 py-3 text-center">
                      <ParkingStatusBadge status="空き" /> {available}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <ParkingStatusBadge status="利用中" /> {occupied}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <Link
                        href={`/parking/edit?id=${lot.id}`}
                        className="text-blue-600 hover:underline text-xs"
                      >
                        編集
                      </Link>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
