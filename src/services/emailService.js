import emailjs from '@emailjs/browser';

const EMAILJS_SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID;
const EMAILJS_TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
const EMAILJS_PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;
const ADMIN_EMAIL = 'iseellasanchezrico@gmail.com';

export const enviarConfirmacionTiquete = async (datosTiquete) => {
  try {
    const templateParams = {
      nombre: datosTiquete.nombre,
      pelicula: datosTiquete.pelicula,
      sala: datosTiquete.sala,
      asientos: datosTiquete.asientos,
      codigo: datosTiquete.codigo,
      total: datosTiquete.total,
      fecha: datosTiquete.fecha,
      admin_email: ADMIN_EMAIL,
      client_email: datosTiquete.email
    };

    const response = await emailjs.send(
      EMAILJS_SERVICE_ID,
      EMAILJS_TEMPLATE_ID,
      templateParams,
      EMAILJS_PUBLIC_KEY
    );

    console.log('Correo enviado!', response.status);
    return true;
  } catch (error) {
    console.error('Error EmailJS:', error);
    return false;
  }
};
