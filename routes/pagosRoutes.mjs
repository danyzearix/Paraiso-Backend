import express from 'express';
import { initPayment, confirmationWebhook, getReceipt, getPaymentResponse } from '../controllers/pagosController.mjs';
const router = express.Router();

// Inicia un WebCheckout y devuelve la URL de pago
router.post('/init', initPayment);

// Webhook de confirmación de pago de Epayco
router.post('/webhook', confirmationWebhook);

//Enviar numero de la orden para imprimir recibo
router.get('/receipt/:orderNumber', getReceipt);

//Obtener respuesta de la orden con epayco
router.get('/response/:orderNumber', getPaymentResponse);


export default router;
