export type ParkingLot = {
  id: string
  name: string
  address: string | null
  contract_company: string | null
  monthly_fee: number | null
  contract_start_date: string | null
  contract_end_date: string | null
  notes: string | null
  created_at: string
  updated_at: string
}

export type ParkingSpace = {
  id: string
  parking_lot_id: string
  space_number: string
  status: '空き' | '利用中'
  user_name: string | null
  vehicle_number: string | null
  notes: string | null
  created_at: string
  updated_at: string
}

export type ParkingLotWithSummary = ParkingLot & {
  total_spaces: number
  available_spaces: number
  occupied_spaces: number
}
