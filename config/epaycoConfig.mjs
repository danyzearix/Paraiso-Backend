// config/epaycoConfig.mjs
import dotenv from 'dotenv';
dotenv.config();

export default {
  apiKey:      process.env.EPAYCO_PUBLIC_KEY,
  privateKey:  process.env.EPAYCO_PRIVATE_KEY,
  lang:        'ES',
  test:        true,       // o false en prod
  // URL de tu webhook expuesto por ngrok
  webhookUrl:  process.env.EPAYCO_WEBHOOK_URL || 'https://ae6b-2a09-bac5-26fb-aa-00-11-1d2.ngrok-free.app/api/pagos/webhook'
};
