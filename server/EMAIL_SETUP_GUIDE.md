# 📧 Equipment Booking Email Notifications Setup Guide

This guide will help you set up email notifications for the SAAN HOMES equipment booking system.

## 🎯 **Email Notifications Implemented**

### **Complete Equipment Booking Workflow:**
1. **Booking Confirmation** - When user creates a booking
2. **Booking Approved** - When admin approves the booking
3. **Booking Rejected** - When admin rejects the booking
4. **Payment Confirmed** - When user completes payment
5. **Equipment Handed Over** - When equipment is given to user
6. **Equipment Returned** - When equipment is returned

## 🚀 **Quick Setup**

### **Step 1: Configure Gmail (Recommended)**
1. **Enable 2-Factor Authentication** on your Gmail account
2. **Generate App Password**:
   - Go to Google Account settings
   - Security → 2-Step Verification → App passwords
   - Generate a new app password for "Mail"
   - Use this password in `EMAIL_HOST_PASSWORD`

### **Step 2: Add Environment Variables**
Create a `.env` file in your `server` directory:

```env
# Email Configuration (Gmail SMTP)
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=your-app-password-here
DEFAULT_FROM_EMAIL=noreply@saanhomes.com

# Frontend URL for email links
FRONTEND_URL=http://localhost:3000
```

### **Step 3: Test Email Configuration**
```bash
cd server
python manage.py test_email
```

## 📧 **Email Templates Created**

All templates are located in `server/templates/emails/`:

- `base_email.html` - Base template with SAAN HOMES branding
- `equipment_booking_confirmation.html` - Initial booking confirmation
- `equipment_booking_approved.html` - Booking approved notification
- `equipment_booking_rejected.html` - Booking rejected notification
- `equipment_payment_confirmed.html` - Payment confirmation
- `equipment_handed_over.html` - Equipment handed over notification
- `equipment_returned.html` - Equipment returned confirmation

## 🔄 **Email Workflow**

### **1. User Books Equipment**
- **Trigger**: `POST /api/equipments/bookings/`
- **Email**: Booking confirmation with details
- **Status**: PENDING

### **2. Admin Approves Booking**
- **Trigger**: `PATCH /api/equipments/bookings/{id}/approve/`
- **Email**: Approval notification with payment link
- **Status**: APPROVED

### **3. Admin Rejects Booking**
- **Trigger**: `PATCH /api/equipments/bookings/{id}/reject/`
- **Email**: Rejection notification with alternatives
- **Status**: REJECTED

### **4. User Completes Payment**
- **Trigger**: `PATCH /api/equipments/bookings/{id}/pay/`
- **Email**: Payment confirmation with pickup/delivery info
- **Status**: PAID

### **5. Equipment Handed Over**
- **Trigger**: `PATCH /api/equipments/bookings/{id}/mark_rented/`
- **Email**: Equipment handed over with return date
- **Status**: RENTED

### **6. Equipment Returned**
- **Trigger**: `PATCH /api/equipments/bookings/{id}/complete/`
- **Email**: Return confirmation with feedback request
- **Status**: COMPLETED

## 🎨 **Email Features**

- **Beautiful HTML Templates** with SAAN HOMES branding
- **Responsive Design** for mobile and desktop
- **Status Badges** with color coding
- **Professional Styling** with gradients and modern UI
- **Contextual Information** based on booking status
- **Action Buttons** for payment and other actions
- **Important Reminders** and instructions

## 🔧 **Files Modified/Created**

### **New Files:**
- `server/templates/emails/` - Email templates directory
- `server/utils/email_utils.py` - Email utility functions
- `server/userAccounts/management/commands/test_email.py` - Test command

### **Modified Files:**
- `server/backend/settings.py` - Email configuration
- `server/equipments/views.py` - Added email notifications

## 🛠️ **Testing the System**

### **1. Test Email Configuration**
```bash
python manage.py test_email
```

### **2. Test Booking Workflow**
1. Create a booking via API
2. Check user's email for confirmation
3. Approve booking as admin
4. Check user's email for approval
5. Complete payment
6. Check user's email for payment confirmation
7. Mark as rented
8. Check user's email for handed over notification
9. Mark as completed
10. Check user's email for return confirmation

## 🆓 **Free Email Options**

### **Gmail SMTP (Recommended)**
- **Free**: 500 emails/day
- **Easy Setup**: Use existing Gmail account
- **Reliable**: Google's infrastructure

### **SendGrid (Production)**
- **Free Tier**: 100 emails/day forever
- **Professional**: Better deliverability
- **Analytics**: Email tracking

### **Mailgun**
- **Free Tier**: 5,000 emails/month for 3 months
- **High Volume**: Good for testing

## 🔒 **Security Features**

- **Environment Variables**: Secure credential storage
- **App Passwords**: Gmail app-specific passwords
- **Error Handling**: Graceful failure without breaking workflow
- **Logging**: Comprehensive error logging
- **Template Security**: Safe template rendering

## 📊 **Email Content Examples**

### **Booking Confirmation Email:**
- Equipment details and rental period
- Total amount calculation
- Next steps information
- Delivery and license requirements

### **Approval Email:**
- Payment button and amount
- Payment deadline
- Pickup/delivery instructions
- Important reminders

### **Payment Confirmation:**
- Payment confirmation
- Equipment ready status
- Pickup/delivery arrangements
- Contact information

## 🚨 **Troubleshooting**

### **Common Issues:**

1. **"Authentication failed"**
   - Check if 2FA is enabled on Gmail
   - Use App Password instead of regular password
   - Verify EMAIL_HOST_USER is correct

2. **"Connection refused"**
   - Check EMAIL_HOST and EMAIL_PORT settings
   - Ensure firewall allows SMTP connections
   - Try different port (465 for SSL, 587 for TLS)

3. **"Template not found"**
   - Verify TEMPLATES setting includes templates directory
   - Check template file paths are correct

4. **Emails not sending**
   - Check Django logs for error messages
   - Verify email configuration with test command
   - Check spam folder

### **Debug Commands:**
```bash
# Test email configuration
python manage.py test_email

# Check Django logs
tail -f logs/django.log

# Test specific email function
python manage.py shell
>>> from utils.email_utils import test_email_configuration
>>> test_email_configuration()
```

## 🎉 **Success!**

Your equipment booking email notification system is now fully implemented! Users will receive professional, branded emails at every step of the booking process, keeping them informed and engaged throughout their rental experience.

---

**Happy emailing! 📧✨**
