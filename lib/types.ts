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

export type ParkingLotFile = {
  id: string
  parking_lot_id: string
  file_name: string
  storage_path: string
  file_size: number
  file_type: string
  created_at: string
}

export type ParkingLotWithSummary = ParkingLot & {
  total_spaces: number
  available_spaces: number
  occupied_spaces: number
}

export type Vehicle = {
  id: string
  name: string
  number_plate: string | null
  type: string | null
  manufacturer: string | null
  model: string | null
  year: number | null
  color: string | null
  lease_company: string | null
  lease_start_date: string | null
  lease_end_date: string | null
  lease_monthly_fee: number | null
  inspection_date: string | null
  insurance_company: string | null
  insurance_end_date: string | null
  user_name: string | null
  department: string | null
  notes: string | null
  created_at: string
  updated_at: string
}
