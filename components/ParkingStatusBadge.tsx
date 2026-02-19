type Props = {
  status: '空き' | '利用中'
}

export default function ParkingStatusBadge({ status }: Props) {
  const isAvailable = status === '空き'
  return (
    <span
      className={`inline-block px-2 py-1 rounded text-xs font-semibold ${
        isAvailable
          ? 'bg-green-100 text-green-800'
          : 'bg-red-100 text-red-800'
      }`}
    >
      {status}
    </span>
  )
}
