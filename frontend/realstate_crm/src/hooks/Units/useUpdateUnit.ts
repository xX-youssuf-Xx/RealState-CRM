"use client"

import { useCallback } from "react"
import { useApiFetch } from "../utils/useApi"

interface UpdateUnitBody {
  project_id?: number
  name?: string
  area?: number
  price?: number
  unit_notes?: string
  status?: string
  sold_date?: string | null
}

export const useUpdateUnit = () => {
  const { isLoading, error, data, setError, _execute } = useApiFetch<any>()

  const execute = useCallback(
    async (
      id: number,
      project_id?: number,
      name?: string,
      area?: number,
      price?: number,
      unit_notes?: string,
      status?: string,
      sold_date?: string | null,
      options: Record<string, any> = {},
    ) => {
      try {
        // Create an object with only the fields that are provided (not undefined)
        const body: UpdateUnitBody = {}

        if (project_id !== undefined) body.project_id = project_id
        if (name !== undefined) body.name = name
        if (area !== undefined) body.area = area
        if (price !== undefined) body.price = price
        if (unit_notes !== undefined) body.unit_notes = unit_notes
        if (status !== undefined) body.status = status
        if (sold_date !== undefined) body.sold_date = sold_date

        const data = await _execute(`units/${id}`, "PATCH", body, options)
        return data
      } catch (e) {
        setError(e)
        throw e
      }
    },
    [_execute, setError],
  )

  return { isLoading, error, data, execute, setError }
}
