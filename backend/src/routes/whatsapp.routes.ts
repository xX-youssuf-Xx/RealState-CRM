import express from 'express';
import { sendWhatsappMessage } from '../controllers/whatsapp.controller';

const router = express.Router();

// Route to send WhatsApp messages with media
router.post('/send', sendWhatsappMessage);

export default router; 