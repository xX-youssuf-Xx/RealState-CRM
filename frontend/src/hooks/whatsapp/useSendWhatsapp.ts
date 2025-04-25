import { useState } from "react";
import { useGetUnitById } from "../Units/useGetUnitById";
import { useGetProject } from "../Projects/useGetProject";
import { useGetEmployee } from "../Employees/useGetEmployee";

interface SendUnitParams {
  clientPhoneNumber: string;
  unitId: number;
  salesId: number;
  customMessage: string;
  mediaUrls?: string[];
}

interface SendWhatsappResponse {
  success: boolean;
  message: string;
}

// External WhatsApp service URL
const WHATSAPP_SERVICE_URL = "http://74.243.246.228:3000/send-media-message"; // Replace with the actual external service URL

// Payment method translations
const paymentMethodTranslations: Record<string, string> = {
  "CASH": "كاش",
  "INSTALLMENT": "تقسيط"
};

export const useSendWhatsapp = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Get hooks to fetch additional data
  const { execute: fetchUnit } = useGetUnitById();
  const { execute: fetchProject } = useGetProject();
  const { execute: fetchEmployee } = useGetEmployee();

  /**
   * Generate a message template for the unit
   */
  const generateMessageTemplate = async (unitId: number): Promise<{ 
    messageTemplate: string;
    mediaUrls: string[];
    unit: any;
    project: any;
  }> => {
    try {
      // Fetch unit and related data
      const unit = await fetchUnit(unitId);
      const project = await fetchProject(unit.project_id);
      
      // Extract media URLs if available
      const mediaUrls = unit.media ? unit.media.split(',') : [];
      
      // Translate payment method to Arabic
      const paymentMethodArabic = unit.payment_method ? 
        paymentMethodTranslations[unit.payment_method] || unit.payment_method : 
        "غير محدد";
      
      // Create the message template
      const messageTemplate = `
*معلومات الوحدة العقارية*
        
🏢 *المشروع:* ${project.name}
📍 *الموقع:* ${project.location || "غير محدد"}
🏠 *اسم الوحدة:* ${unit.name}
🔢 *رقم الوحدة:* ${unit.id}
📏 *المساحة:* ${unit.area || "غير محدد"} متر مربع
💰 *السعر:* ${unit.price || "غير محدد"} جنيه
💳 *طريقة الدفع:* ${paymentMethodArabic}
${unit.payment_method === "INSTALLMENT" ? `
📋 *تفاصيل التقسيط:*
   💵 *المقدم:* ${unit.down_payment || "غير محدد"} جنيه
   🔄 *القسط الشهري:* ${unit.installment_amount || "غير محدد"} جنيه
   🗓️ *عدد الأقساط:* ${unit.number_of_installments || "غير محدد"}` : ''}

📝 *ملاحظات:* ${unit.unit_notes || "لا توجد ملاحظات"}

للمزيد من المعلومات يرجى التواصل معنا
      `;
      
      return {
        messageTemplate: messageTemplate.trim(),
        mediaUrls,
        unit,
        project
      };
    } catch (error) {
      console.error("Error generating message template:", error);
      throw error;
    }
  };

  const sendUnit = async (params: SendUnitParams): Promise<SendWhatsappResponse> => {
    setIsLoading(true);
    setError(null);

    try {
      // Fetch sales rep data
      const sales = params.salesId ? await fetchEmployee(params.salesId) : null;

      // Making a direct call to the external WhatsApp service
      const response = await fetch(`${WHATSAPP_SERVICE_URL}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          phoneNumber: params.clientPhoneNumber,
          message: params.customMessage,
          media: params.mediaUrls || [],  // Send media URLs
          sales: sales ? {
            id: sales.id,
            name: sales.name,
            number: sales.number
          } : null
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "حدث خطأ أثناء إرسال الوحدة");
      }

      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "حدث خطأ أثناء إرسال الوحدة";
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    sendUnit,
    generateMessageTemplate,
    isLoading,
    error,
  };
};
