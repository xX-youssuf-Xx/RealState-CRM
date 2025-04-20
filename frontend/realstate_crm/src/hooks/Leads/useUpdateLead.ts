import { useCallback } from "react";
import { useApiFetch } from "../utils/useApi";
import { Lead } from "../../types/Leads";

// Use Partial to allow updating only specific fields
type UpdateLeadBody = Partial<Lead>;

export const useUpdateLead = () => {
  const { isLoading, error, data, setError, _execute } = useApiFetch<Lead>();

  const execute = useCallback(
    async (id: number, updates: UpdateLeadBody, options: Record<string, any> = {}) => {
      try {
        const data = await _execute(`leads/${id}`, "PATCH", updates, options);
        return data;
      } catch (e) {
        setError(e);
        throw e;
      }
    },
    [_execute, setError]
  );

  return { isLoading, error, data, execute, setError };
};

// Helper function to compare original lead with form data and extract only changed fields
export const getChangedFields = (
  originalLead: Lead,
  formData: Partial<Lead>
): UpdateLeadBody => {
  // Create a clean object for changed fields
  const changedFields = {} as UpdateLeadBody;
  
  // Compare each field and only include those that have changed
  (Object.keys(formData) as Array<keyof Partial<Lead>>).forEach(key => {
    // Skip undefined values
    if (formData[key] === undefined) return;
    
    // Only include if value has changed
    if (formData[key] !== originalLead[key]) {
      // Safe assignment using type assertion
      (changedFields as any)[key] = formData[key];
    }
  });
  
  return changedFields;
};

// Specialized hook just for updating state/substate
export const useUpdateLeadState = () => {
  const { execute, isLoading, error, data, setError } = useUpdateLead();

  const updateState = useCallback(
    async (id: number, state: string, substate?: string, options: Record<string, any> = {}) => {
      const updates: UpdateLeadBody = { state };
      if (substate !== undefined) {
        updates.substate = substate;
      }
      return execute(id, updates, options);
    },
    [execute]
  );

  return { execute: updateState, isLoading, error, data, setError };
};

// Additional utility hook for campaign updates
export const useUpdateLeadCampaign = () => {
  const { execute, isLoading, error, data, setError } = useUpdateLead();

  const updateCampaign = useCallback(
    async (id: number, campaign: string, options: Record<string, any> = {}) => {
      return execute(id, { campaign }, options);
    },
    [execute]
  );

  return { execute: updateCampaign, isLoading, error, data, setError };
};