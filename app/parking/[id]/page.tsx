'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { ParkingLot, ParkingSpace } from '@/lib/types'
import ParkingStatusBadge from '@/components/ParkingStatusBadge'

export default function ParkingDetailPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string

  const [lot, setLot] = useState<ParkingLot | null>(null)
  const [spaces, setSpaces] = useState<ParkingSpace[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [id])

  async function fetchData() {
    setLoading(true)
    const [lotRes, spacesRes] = await Promise.all([
      supabase.from('parking_lots').select('*').eq('id', id).single(),
      supabase
        .from('parking_spaces')
        .select('*')
        .eq('parking_lot_id', id)
        .order('space_number'),
    ])

    if (lotRes.data) setLot(lotRes.data)
    if (spacesRes.data) setSpaces(spacesRes.data)
    setLoading(false)
  }

  async function handleDeleteLot() {
    if (!confirm('この駐車場を削除しますか？関連する駐車枠もすべて削除されます。')) return
    await supabase.from('parking_lots').delete().eq('id', id)
    router.push('/parking')
  }

  async function handleDeleteSpace(spaceId: string) {
    if (!confirm('この駐車枠を削除しますか？')) return
    await supabase.from('parking_spaces').delete().eq('id', spaceId)
    fetchData()
  }

  async function handleToggleStatus(space: ParkingSpace) {
    const newStatus = space.status === '空き' ? '利用中' : '空き'
    await supabase
      .from('parking_spaces')
      .update({ status: newStatus, user_name: newStatus === '空き' ? null : space.user_name, vehicle_number: newStatus === '空き' ? null : space.vehicle_number })
      .eq('id', space.id)
    fetchData()
  }

  if (loading) return <p className="text-gray-500">読み込み中...</p>
  if (!lot) return <p className="text-gray-500">駐車場が見つかりません</p>

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">{lot.name}</h1>
        <div className="flex gap-2">
          <Link
            href={`/parking/${id}/edit`}
            className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm hover:bg-blue-700"
          >
            編集
          </Link>
          <button
            onClick={handleDeleteLot}
            className="bg-red-600 text-white px-4 py-2 rounded-md text-sm hover:bg-red-700"
          >
            削除
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">基本情報</h2>
        <dl className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <dt className="text-gray-500">住所</dt>
            <dd className="font-medium">{lot.address || '-'}</dd>
          </div>
          <div>
            <dt className="text-gray-500">契約法人</dt>
            <dd className="font-medium">{lot.contract_company || '-'}</dd>
          </div>
          <div>
            <dt className="text-gray-500">月額料金</dt>
            <dd className="font-medium">
              {lot.monthly_fee != null ? `¥${lot.monthly_fee.toLocaleString()}` : '-'}
            </dd>
          </div>
          <div>
            <dt className="text-gray-500">契約期間</dt>
            <dd className="font-medium">
              {lot.contract_start_date || '未定'} 〜 {lot.contract_end_date || '未定'}
            </dd>
          </div>
          <div className="md:col-span-2">
            <dt className="text-gray-500">備考</dt>
            <dd className="font-medium">{lot.notes || '-'}</dd>
          </div>
        </dl>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">
            駐車枠一覧（{spaces.length}枠）
          </h2>
        </div>

        {spaces.length === 0 ? (
          <p className="text-gray-500 text-sm">駐車枠が登録されていません</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left px-4 py-2 font-semibold">区画番号</th>
                  <th className="text-center px-4 py-2 font-semibold">ステータス</th>
                  <th className="text-left px-4 py-2 font-semibold">使用者</th>
                  <th className="text-left px-4 py-2 font-semibold">車両ナンバー</th>
                  <th className="text-left px-4 py-2 font-semibold">備考</th>
                  <th className="text-center px-4 py-2 font-semibold">操作</th>
                </tr>
              </thead>
              <tbody>
                {spaces.map((space) => (
                  <tr key={space.id} className="border-t border-gray-100">
                    <td className="px-4 py-2 font-medium">{space.space_number}</td>
                    <td className="px-4 py-2 text-center">
                      <ParkingStatusBadge status={space.status} />
                    </td>
                    <td className="px-4 py-2">{space.user_name || '-'}</td>
                    <td className="px-4 py-2">{space.vehicle_number || '-'}</td>
                    <td className="px-4 py-2 text-gray-600">{space.notes || '-'}</td>
                    <td className="px-4 py-2 text-center flex gap-2 justify-center">
                      <button
                        onClick={() => handleToggleStatus(space)}
                        className="text-blue-600 hover:underline text-xs"
                      >
                        状態切替
                      </button>
                      <button
                        onClick={() => handleDeleteSpace(space.id)}
                        className="text-red-600 hover:underline text-xs"
                      >
                        削除
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="mt-4">
        <Link href="/parking" className="text-blue-600 hover:underline text-sm">
          ← 一覧に戻る
        </Link>
      </div>
    </div>
  )
}
