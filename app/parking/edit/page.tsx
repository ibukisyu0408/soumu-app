import { Suspense } from 'react'
import ParkingEdit from '@/components/ParkingEdit'

export default function ParkingEditPage() {
  return (
    <Suspense fallback={<p className="text-gray-500">読み込み中...</p>}>
      <ParkingEdit />
    </Suspense>
  )
}
