'use client'

import { Suspense, useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { Vehicle } from '@/lib/types'

export default function VehicleDetailPage() {
  return (
    <Suspense fallback={<p className="text-gray-500">読み込み中...</p>}>
      <VehicleDetailContent />
    </Suspense>
  )
}

function VehicleDetailContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const id = searchParams.get('id') || ''

  const [vehicle, setVehicle] = useState<Vehicle | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [id])

  async function fetchData() {
    setLoading(true)
    const { data } = await supabase.from('vehicles').select('*').eq('id', id).single()
    if (data) setVehicle(data)
    setLoading(false)
  }

  async function handleDelete() {
    if (!confirm('この車両を削除しますか？')) return
    await supabase.from('vehicles').delete().eq('id', id)
    router.push('/vehicles')
  }

  if (loading) return <p className="text-gray-500">読み込み中...</p>
  if (!vehicle) return <p className="text-gray-500">車両が見つかりません</p>

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">{vehicle.name}</h1>
        <div className="flex gap-2">
          <Link
            href={`/vehicles/edit?id=${id}`}
            className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm hover:bg-blue-700"
          >
            編集
          </Link>
          <button
            onClick={handleDelete}
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
            <dt className="text-gray-500">ナンバープレート</dt>
            <dd className="font-medium">{vehicle.number_plate || '-'}</dd>
          </div>
          <div>
            <dt className="text-gray-500">種別</dt>
            <dd className="font-medium">{vehicle.type || '-'}</dd>
          </div>
          <div>
            <dt className="text-gray-500">メーカー</dt>
            <dd className="font-medium">{vehicle.manufacturer || '-'}</dd>
          </div>
          <div>
            <dt className="text-gray-500">車種</dt>
            <dd className="font-medium">{vehicle.model || '-'}</dd>
          </div>
          <div>
            <dt className="text-gray-500">年式</dt>
            <dd className="font-medium">{vehicle.year || '-'}</dd>
          </div>
          <div>
            <dt className="text-gray-500">色</dt>
            <dd className="font-medium">{vehicle.color || '-'}</dd>
          </div>
        </dl>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">リース情報</h2>
        <dl className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <dt className="text-gray-500">リース会社</dt>
            <dd className="font-medium">{vehicle.lease_company || '-'}</dd>
          </div>
          <div>
            <dt className="text-gray-500">リース月額</dt>
            <dd className="font-medium">
              {vehicle.lease_monthly_fee != null ? `¥${vehicle.lease_monthly_fee.toLocaleString()}` : '-'}
            </dd>
          </div>
          <div className="md:col-span-2">
            <dt className="text-gray-500">リース期間</dt>
            <dd className="font-medium">
              {vehicle.lease_start_date || vehicle.lease_end_date
                ? `${vehicle.lease_start_date || '未定'} 〜 ${vehicle.lease_end_date || '未定'}`
                : '-'}
            </dd>
          </div>
        </dl>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">車検</h2>
        <dl className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <dt className="text-gray-500">次回車検日</dt>
            <dd className="font-medium">{vehicle.inspection_date || '-'}</dd>
          </div>
        </dl>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">保険</h2>
        <dl className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <dt className="text-gray-500">保険会社</dt>
            <dd className="font-medium">{vehicle.insurance_company || '-'}</dd>
          </div>
          <div>
            <dt className="text-gray-500">保険番号</dt>
            <dd className="font-medium">{vehicle.insurance_number || '-'}</dd>
          </div>
          <div>
            <dt className="text-gray-500">保険満了日</dt>
            <dd className="font-medium">{vehicle.insurance_end_date || '-'}</dd>
          </div>
        </dl>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">使用情報</h2>
        <dl className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <dt className="text-gray-500">使用者</dt>
            <dd className="font-medium">{vehicle.user_name || '-'}</dd>
          </div>
          <div>
            <dt className="text-gray-500">部署</dt>
            <dd className="font-medium">{vehicle.department || '-'}</dd>
          </div>
          <div className="md:col-span-2">
            <dt className="text-gray-500">備考</dt>
            <dd className="font-medium">{vehicle.notes || '-'}</dd>
          </div>
        </dl>
      </div>

      <div className="mt-4">
        <Link href="/vehicles" className="text-blue-600 hover:underline text-sm">
          ← 一覧に戻る
        </Link>
      </div>
    </div>
  )
}
