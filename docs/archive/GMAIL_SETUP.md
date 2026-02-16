# Gmail Setup for Contact Form

To enable email sending from the contact form to ragsproai@gmail.com, follow these steps:

## 1. Enable 2-Factor Authentication
- Go to your Google Account settings
- Enable 2-Factor Authentication if not already enabled

## 2. Generate App Password
- Go to Google Account → Security → 2-Step Verification → App passwords
- Select "Mail" and "Other (custom name)"
- Enter "LAW-AI Contact Form"
- Copy the generated 16-character password

## 3. Add to Environment Variables
Add this line to your `.env.local` file:

```
GMAIL_APP_PASSWORD=your_16_character_app_password_here
```

## 4. Restart Development Server
```bash
npm run dev
```

## Alternative: Use EmailJS (No server setup needed)
If you prefer a client-side solution:
1. Sign up at https://emailjs.com
2. Create a service and template
3. Update the contact form to use EmailJS

The contact form will now send emails directly to ragsproai@gmail.com!