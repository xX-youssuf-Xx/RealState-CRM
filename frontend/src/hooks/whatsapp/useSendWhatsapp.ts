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

// Backend WhatsApp API endpoint with production URL
const WHATSAPP_API_ENDPOINT = "https://amaar.egypt-tech.com/api/whatsapp/send";

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
      const mediaUrls = unit.media ? unit.media.split(',').map((url: string) => {
        // Add the base URL to uploads paths
        if (url.trim().startsWith('/uploads')) {
          return `https://amaar.egypt-tech.com${url.trim()}`;
        }
        return url.trim();
      }) : [];
      
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

      // Process media URLs to add base URL for uploads
      const processedMediaUrls = (params.mediaUrls || []).map(url => {
        if (url.startsWith('/uploads')) {
          return `https://amaar.egypt-tech.com${url}`;
        }
        return url;
      });

      // Making a call to our backend API instead of directly to the external service
      const response = await fetch(WHATSAPP_API_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          phoneNumber: params.clientPhoneNumber,
          message: params.customMessage,
          media: processedMediaUrls,  // Use the processed media URLs
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
