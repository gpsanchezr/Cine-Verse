/**
 * EmailJS Service — Cine-Verse
 * 
 * SETUP REQUERIDO:
 * 1. Crea cuenta en https://emailjs.com
 * 2. Crea un Email Service (Gmail) y anota el SERVICE_ID
 * 3. Crea un Email Template con las variables:
 *    {{nombre}}, {{pelicula}}, {{sala}}, {{asientos}}, {{codigo}}, {{total}}, {{fecha}}
 * 4. Reemplaza las constantes de abajo con tus credenciales reales
 */

import emailjs from '@emailjs/browser'

// ⚠️ REEMPLAZAR CON TUS CREDENCIALES REALES DE EMAILJS
const EMAILJS_SERVICE_ID = 'TU_SERVICE_ID_AQUI'
const EMAILJS_TEMPLATE_ID = 'TU_TEMPLATE_ID_AQUI'
const EMAILJS_PUBLIC_KEY = 'TU_PUBLIC_KEY_AQUI'
const ADMIN_EMAIL = 'admin@cineverse.com' // Correo del administrador

/**
 * Envía confirmación de tiquete al cliente y al admin
 * @param {Object} params
 * @param {string} params.clientEmail - Correo del cliente
 * @param {string} params.nombre - Nombre del cliente
 * @param {string} params.pelicula - Título de la película
 * @param {string} params.sala - Nombre de la sala
 * @param {string} params.asientos - Lista de asientos (ej: "A1, A2, B3")
 * @param {string} params.codigo - Código único del tiquete
 * @param {number} params.total - Valor total de la compra
 * @param {string} params.fecha - Fecha y hora de la función
 */
export const enviarConfirmacionTiquete = async (params) => {
  const templateParams = {
    nombre: params.nombre,
    pelicula: params.pelicula,
    sala: params.sala,
    asientos: params.asientos,
    codigo: params.codigo,
    total: `$${params.total?.toLocaleString('es-CO')} COP`,
    fecha: params.fecha,
    to_email: params.clientEmail,
  }

  try {
    // Email al cliente
    await emailjs.send(
      EMAILJS_SERVICE_ID,
      EMAILJS_TEMPLATE_ID,
      { ...templateParams, to_email: params.clientEmail },
      EMAILJS_PUBLIC_KEY
    )

    // Copia al administrador
    await emailjs.send(
      EMAILJS_SERVICE_ID,
      EMAILJS_TEMPLATE_ID,
      { ...templateParams, to_email: ADMIN_EMAIL, nombre: `[ADMIN COPY] ${params.nombre}` },
      EMAILJS_PUBLIC_KEY
    )

    return { success: true }
  } catch (error) {
    console.error('Error enviando email:', error)
    return { success: false, error }
  }
}
