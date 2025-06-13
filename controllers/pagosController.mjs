// controllers/pagosController.mjs

import Pago from '../models/pagoSchema.mjs';
import Horario from '../models/horarioSchema.mjs';
import moment from 'moment';
import { generarOrderNumber } from '../utils/counters.mjs';

/**
 * POST /api/pagos/init
 * Genera un orderNumber, crea un pago con estado "pendiente" y lo devuelve al cliente.
 */
export const initPayment = async (req, res) => {
  console.log('🛫 initPayment req.body:', req.body);
  try {
    const {
      monto,
      horarioId,
      usuarioId,
      email,
      nombreComprador,
      celular,
      direccionResidencia,
      tipoIdentificacion,
      numeroDocumento,
      nombreDestinatario,
      intencionMisa,
      metodoPago
    } = req.body;

    // 1) Generar orderNumber
    const orderNumber = await generarOrderNumber('pago');
    console.log('🔢 orderNumber generado:', orderNumber);

    // 2) Crear registro de pago pendiente
    const nuevoPago = await Pago.create({
      orderNumber,
      horarioId,
      usuarioId,
      monto,
      email,
      nombreComprador,
      celular,
      direccionResidencia,
      tipoIdentificacion,
      numeroDocumento,
      nombreDestinatario,
      intencionMisa,
      metodoPago,
      estadoPago: 'pendiente'
    });
    console.log('💾 Pago creado en BD:', nuevoPago);

    // 3) Devolver sólo orderNumber
    return res.json({ orderNumber });
  } catch (error) {
    console.error('🔥 initPayment error:', error);
    return res.status(500).json({ message: 'Error iniciando el pago', error: error.message });
  }
};

/**
 * POST /api/pagos/webhook
 * Webhook que actualiza el estado del pago y reserva el horario si se confirma.
 */
export const confirmationWebhook = async (req, res) => {
  console.log('📬 confirmationWebhook payload:', req.body);
  const payload = req.body;
  try {
    // Extraer invoice
    const invoice = payload.x_id_invoice || payload.x_id_factura;

    // Encontrar pago por orderNumber
    const pago = await Pago.findOne({ orderNumber: invoice });
    if (!pago) {
      console.warn('Pago no encontrado para orderNumber:', invoice);
      return res.status(404).send('Pago no encontrado');
    }

    // Actualizar estadoPago
    pago.estadoPago = payload.x_response === 'Aceptada' ? 'confirmado' : 'rechazado';
    await pago.save();

    // Si confirmado, reservar horario
    if (pago.estadoPago === 'confirmado') {
      await Horario.findByIdAndUpdate(
        pago.horarioId,
        {
          estado: 'reservado',
          $push: {
            reservas: {
              usuarioId:          pago.usuarioId,
              nombreComprador:    pago.nombreComprador,
              email:              pago.email,
              celular:            pago.celular,
              tipoIdentificacion: pago.tipoIdentificacion,
              numeroDocumento:    pago.numeroDocumento,
              nombreDestinatario: pago.nombreDestinatario,
              intencionMisa:      pago.intencionMisa,
              pago: {
                metodo: pago.metodoPago,
                monto:  pago.monto,
                estado: 'pagado'
              }
            }
          }
        }
      );
    }

    return res.status(200).send('OK');
  } catch (error) {
    console.error('⚠ confirmationWebhook error:', error);
    return res.status(500).send('Error procesando webhook');
  }
};

export const getReceipt = async (req, res) => {
  const { orderNumber } = req.params;
  try {
    // 1) Encuentra el Pago
    const pago = await Pago.findOne({ orderNumber });
    if (!pago) return res.status(404).json({ message: 'Pago no encontrado' });

    // 2) Obtén el horario reservado
    const horario = await Horario.findById(pago.horarioId);
    if (!horario) return res.status(404).json({ message: 'Horario no encontrado' });

    // 3) Formatea fecha/hora para el PDF
    const fechaHuman = moment(horario.fecha).format('YYYY-MM-DD');
    const horaHuman  = moment(horario.fecha).format('HH:mm');

    // 4) Devuelve un JSON con todo lo necesario
    return res.json({
      orderNumber,
      fechaHuman,
      horaHuman,
      nombreComprador: pago.nombreComprador,
      email: pago.email,
      celular: pago.celular,
      numeroDocumento: pago.numeroDocumento,
      nombreDestinatario: pago.nombreDestinatario,
      intencionMisa: pago.intencionMisa,
      metodoPago: pago.metodoPago,
      monto: pago.monto,
      direccionResidencia: pago.direccionResidencia,
      servicioId: pago.servicioId
    });
  } catch (err) {
    console.error('getReceipt error:', err);
    return res.status(500).json({ message: 'Error obteniendo recibo' });
  }
};

export const getPaymentResponse = async (req, res) => {
  try {
    const { orderNumber } = req.params;
    // Busca el pago y luego el horario asociado:
    const pago = await Pago.findOne({ orderNumber });
    if (!pago) return res.status(404).json({ message: 'Pago no encontrado' });

    // Ahora busca el Horario actualizado
    const horario = await Horario.findById(pago.horarioId).lean();
    if (!horario) return res.status(404).json({ message: 'Horario no encontrado' });

    // Prepara la info que necesitas en el PDF (nombre comprador, fecha, etc)
    return res.json({
      orderNumber: pago.orderNumber,
      usuarioId: pago.usuarioId,
      nombreComprador: pago.nombreComprador,
      email: pago.email,
      celular: pago.celular,
      direccionResidencia: pago.direccionResidencia,
      tipoIdentificacion: pago.tipoIdentificacion,
      numeroDocumento: pago.numeroDocumento,
      nombreDestinatario: pago.nombreDestinatario,
      intencionMisa: pago.intencionMisa,
      metodoPago: pago.metodoPago,
      monto: pago.monto,
      fecha: horario.fecha,
      misaId: horario.misaId
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error interno' });
  }
};
