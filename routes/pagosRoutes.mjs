import express from 'express';
import { initPayment, confirmationWebhook, getReceipt } from '../controllers/pagosController.mjs';
const router = express.Router();

// Inicia un WebCheckout y devuelve la URL de pago
router.post('/init', initPayment);

// Webhook de confirmación de pago de Epayco
router.post('/webhook', confirmationWebhook);

//Enviar numero de la orden para imprimir recibo
router.get('/receipt/:orderNumber', getReceipt);


export default router;
