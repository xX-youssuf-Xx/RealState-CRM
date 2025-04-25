import type { Request, Response } from 'express';
import fetch from 'node-fetch';

// External WhatsApp service URL
const WHATSAPP_SERVICE_URL = "http://74.243.246.228:3000/send-media-message";

/**
 * Send a WhatsApp message with media to a client
 */
export const sendWhatsappMessage = async (req: Request, res: Response): Promise<void> => {
  try {
    const { phoneNumber, message, media, sales } = req.body;

    // Validate required fields
    if (!phoneNumber || !message) {
      res.status(400).json({ success: false, message: 'Phone number and message are required' });
      return;
    }

    // Forward the request to the external WhatsApp service
    const response = await fetch(WHATSAPP_SERVICE_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        phoneNumber,
        message,
        media: media || [],
        sales: sales || null
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      res.status(response.status).json({ 
        success: false, 
        message: data.message || 'Error sending WhatsApp message'
      });
      return;
    }

    res.status(200).json({ 
      success: true, 
      message: 'WhatsApp message sent successfully',
      data
    });
  } catch (error) {
    console.error('Error sending WhatsApp message:', error);
    res.status(500).json({ 
      success: false, 
      message: error instanceof Error ? error.message : 'Internal server error'
    });
  }
}; 