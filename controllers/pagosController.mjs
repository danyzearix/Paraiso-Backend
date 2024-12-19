import epayco from "../config/epayco.mjs";
import Horario from "../models/horarioSchema.mjs";
import crypto from "crypto";

// Iniciar una transacción con ePayco
export const iniciarTransaccion = async (req, res) => {
    const { idReserva, monto, nombre, email } = req.body;

    try {
        const datosPago = {
            token_card: "TOKEN_DE_TARJETA", // Esto lo proporciona el frontend
            customer_id: "ID_CLIENTE",      // Generado si ya registraste al cliente en ePayco
            description: `Reserva de misa ${idReserva}`,
            value: monto,
            currency: "COP",
            email: email,
            name: nombre,
            url_response: "https://tu-sitio.com/pago-exitoso",
            url_confirmation: "https://tu-sitio.com/api/pagos/confirmacion",
            method_confirmation: "POST"
        };

        const respuesta = await epayco.charge.create(datosPago);

        res.status(200).json({
            message: "Transacción creada con éxito",
            urlPago: respuesta.data.url_payment
        });
    } catch (error) {
        console.error("Error al crear la transacción:", error);
        res.status(500).json({ message: "Error al crear la transacción", error });
    }
};

// Confirmar una transacción desde ePayco
export const confirmarPago = async (req, res) => {
    const { x_signature, x_ref_payco, x_transaction_id, x_amount, x_currency_code, x_response } = req.body;

    try {
        // Verificar la firma
        const firmaValida = verificarFirma(
            x_signature,
            x_ref_payco,
            x_transaction_id,
            x_amount,
            x_currency_code
        );

        if (!firmaValida) {
            return res.status(400).json({ message: "Firma no válida" });
        }

        // Manejar el estado del pago
        if (x_response === "Aceptada") {
            const reserva = await Horario.findByIdAndUpdate(
                x_ref_payco, // Este debe coincidir con el ID de la reserva
                { estado: "reservado" },
                { new: true }
            );

            return res.status(200).json({ message: "Pago confirmado", reserva });
        }

        res.status(400).json({ message: `El pago no fue exitoso: ${x_response}` });
    } catch (error) {
        console.error("Error al confirmar el pago:", error);
        res.status(500).json({ message: "Error al confirmar el pago", error });
    }
};

// Función auxiliar para verificar la firma de seguridad
const verificarFirma = (signature, ref_payco, transaction_id, amount, currency) => {
    const signatureLocal = crypto
        .createHash("sha256")
        .update(`TU_CUST_ID~TU_API_KEY~${ref_payco}~${transaction_id}~${amount}~${currency}`)
        .digest("hex");
    return signature === signatureLocal;
};
