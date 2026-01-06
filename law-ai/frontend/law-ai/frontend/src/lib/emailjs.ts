// EmailJS configuration for contact form
export const emailJSConfig = {
  serviceId: 'service_lawai',
  templateId: 'template_contact',
  publicKey: 'user_lawai_public_key'
}

export const sendEmail = async (formData: {
  name: string
  email: string
  subject: string
  message: string
}) => {
  // Simple fetch to EmailJS API
  const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      service_id: 'default_service',
      template_id: 'template_contact',
      user_id: 'public_key',
      template_params: {
        to_email: 'ragsproai@gmail.com',
        from_name: formData.name,
        from_email: formData.email,
        subject: formData.subject,
        message: formData.message,
        reply_to: formData.email
      }
    })
  })
  
  return response
}