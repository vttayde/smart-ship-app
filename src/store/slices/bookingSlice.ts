import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export interface CourierService {
  id: string
  name: string
  price: number
  estimatedDays: string
  rating: number
  features: string[]
  logo?: string
}

export interface BookingData {
  from: string
  to: string
  weight: string
  packageType: string
  selectedService?: CourierService
  parcelDetails?: {
    contents: string
    dimensions?: {
      length: number
      width: number
      height: number
    }
    declaredValue: number
  }
}

interface BookingState {
  bookingData: BookingData
  availableServices: CourierService[]
  isLoading: boolean
  error: string | null
  step: number // 1: search, 2: compare, 3: book, 4: payment
}

const initialState: BookingState = {
  bookingData: {
    from: '',
    to: '',
    weight: '1',
    packageType: 'document',
  },
  availableServices: [],
  isLoading: false,
  error: null,
  step: 1,
}

const bookingSlice = createSlice({
  name: 'booking',
  initialState,
  reducers: {
    setBookingData: (state, action: PayloadAction<Partial<BookingData>>) => {
      state.bookingData = { ...state.bookingData, ...action.payload }
    },
    setAvailableServices: (state, action: PayloadAction<CourierService[]>) => {
      state.availableServices = action.payload
    },
    selectService: (state, action: PayloadAction<CourierService>) => {
      state.bookingData.selectedService = action.payload
    },
    setStep: (state, action: PayloadAction<number>) => {
      state.step = action.payload
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload
    },
    resetBooking: (state) => {
      state.bookingData = initialState.bookingData
      state.availableServices = []
      state.step = 1
      state.error = null
      state.isLoading = false
    },
  },
})

export const {
  setBookingData,
  setAvailableServices,
  selectService,
  setStep,
  setLoading,
  setError,
  resetBooking,
} = bookingSlice.actions

export default bookingSlice.reducer
