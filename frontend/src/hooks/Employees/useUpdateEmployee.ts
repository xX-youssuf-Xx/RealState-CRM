"use client"

import { useCallback, useState } from "react"
import { useApiFetch } from "../utils/useApi"

export interface UpdateEmployeeBody {
  name?: string
  number?: string
  role?: string
  notes?: string
  password?: string
}

export const useUpdateEmployee = () => {
  const { _execute, isLoading } = useApiFetch()
  const [error, setError] = useState<Error | null>(null)

  // Update the execute function to accept an object of fields to update instead of individual parameters
  const execute = useCallback(
    async (id: number, updates: UpdateEmployeeBody, options: Record<string, any> = {}) => {
      try {
        // Only include non-undefined fields in the request body
        const body: UpdateEmployeeBody = {}

        // Only add properties that are defined
        if (updates.name !== undefined) body.name = updates.name
        if (updates.number !== undefined) body.number = updates.number
        if (updates.role !== undefined) body.role = updates.role
        if (updates.notes !== undefined) body.notes = updates.notes
        if (updates.password !== undefined) body.password = updates.password

        const data = await _execute(`employees/${id}`, "PATCH", body, options)
        return data
      } catch (e:any) {
        setError(e)
        throw e
      }
    },
    [_execute, setError],
  )

  return { execute,isLoading, error }
}
