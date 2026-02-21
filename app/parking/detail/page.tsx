import { Suspense } from 'react'
import ParkingDetail from '@/components/ParkingDetail'

export default function ParkingDetailPage() {
  return (
    <Suspense fallback={<p className="text-gray-500">読み込み中...</p>}>
      <ParkingDetail />
    </Suspense>
  )
}
