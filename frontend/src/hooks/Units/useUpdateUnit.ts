"use client"

import { useCallback } from "react"
import { useApiFetch } from "../utils/useApi"
import type { UnitStatus } from "../../types/units"

interface UpdateUnitBody {
  project_id?: number
  name?: string
  area?: number
  price?: number
  unit_notes?: string
  status?: UnitStatus
  sold_date?: string | null
  payment_method?: string | null
  down_payment?: number | null
  installment_amount?: number | null
  number_of_installments?: number | null
}

export const useUpdateUnit = () => {
  const { isLoading, error, data, setError, _execute } = useApiFetch()

  const execute = useCallback(
    async (unitId: number, unitData: UpdateUnitBody, mediaFiles?: File[]) => {
      try {
        // Create FormData object
        const formData = new FormData()

        // Append all unit data to FormData
        Object.entries(unitData).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            formData.append(key, String(value))
          }
        })

        // Append media files if provided
        if (mediaFiles && mediaFiles.length > 0) {
          mediaFiles.forEach((file) => {
            formData.append(`media_files`, file)
          })
        }

        // Add a field to indicate if files are being updated
        formData.append('update_media', mediaFiles ? 'true' : 'false')

        // Make the API call with formData
        const response = await _execute(`units/${unitId}`, "PUT", formData, {
          headers: {
            // Don't set Content-Type - browser will set it with proper boundary
          }
        })
        
        return response
      } catch (e) {
        setError(e)
        throw e
      }
    },
    [_execute, setError],
  )

  return { isLoading, error, data, execute, setError }
}