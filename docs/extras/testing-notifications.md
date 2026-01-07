# Testing Notifications Module

## Quick Testing Guide for Email Notifications

---

## Prerequisites

✅ Mailtrap account set up  
✅ SMTP credentials in `.env` file  
✅ Backend running (`npm run start:dev`)  
✅ Postman or similar API testing tool  

---

## Test 1: Email Verification (Registration)

### **Endpoint:** `POST /auth/register`

### **Request Body:**
```json
{
  "email": "test@example.com",
  "username": "testuser",
  "fullName": "Test User",
  "password": "Test@1234",
  "confirmPassword": "Test@1234"
}
```

### **Expected Response:**
```json
{
  "message": "Registration successful. Please check your email for verification code."
}
```

### **Check Mailtrap:**
1. Open Mailtrap inbox
2. Find email with subject: **"Verify Your SQUADZ Account"**
3. Verify email contains:
   - 6-digit OTP code (large, centered)
   - SQUADZ ID (format: SQZ-XXXXXXXX)
   - "3 minutes" expiry notice
   - Welcome message

### **Visual Check:**
- Purple gradient header
- OTP in large purple font with letter spacing
- Green box with SQUADZ ID
- Yellow warning box for expiry
- Professional layout

---

## Test 2: Password Reset Email

### **Endpoint:** `POST /auth/forgot-password`

### **Request Body:**
```json
{
  "email": "test@example.com"
}
```

### **Expected Response:**
```json
{
  "message": "If the email exists, a password reset link has been sent."
}
```

### **Check Mailtrap:**
1. Open Mailtrap inbox
2. Find email with subject: **"Reset Your SQUADZ Password"**
3. Verify email contains:
   - 6-digit OTP code (large, centered)
   - "5 minutes" expiry notice for OTP
   - "15 minutes" window to complete reset
   - Security advisory
   - Support email (support@squadz.app)

### **Visual Check:**
- Pink/red gradient header
- OTP in large pink/red font
- Yellow warning box for expiry
- Red security notice box
- Professional layout

---

## Test 3: Account Lockout Email

### **Setup:**
Make 5 failed login attempts to trigger lockout.

### **Endpoint:** `POST /auth/login` (5 times with wrong password)

### **Request Body (wrong password):**
```json
{
  "identifier": "test@example.com",
  "password": "WrongPassword123"
}
```

### **Expected Response (5th attempt):**
```json
{
  "statusCode": 403,
  "message": "Account locked due to too many failed login attempts. Please try again in 15 minutes.",
  "error": "Forbidden"
}
```

### **Check Mailtrap:**
1. Open Mailtrap inbox
2. Find email with subject: **"SQUADZ Account Temporarily Locked"**
3. Verify email contains:
   - Formatted unlock time (e.g., "3:45 PM EST")
   - "15 minutes" lockout duration
   - Security recommendations list
   - Support email (support@squadz.app)

### **Visual Check:**
- Red gradient header
- Unlock time in large red font
- Yellow warning box
- Blue security advisory box with bullet points
- Professional layout

---

## Common Issues & Troubleshooting

### **Issue: No emails received in Mailtrap**

**Check:**
1. SMTP credentials correct in `.env`
2. Backend logs for errors: `npm run start:dev` (watch console)
3. Mailtrap inbox is correct (check inbox ID)

**Fix:**
```bash
# Restart backend after .env changes
npm run start:dev
```

---

### **Issue: Email sent but template not rendering**

**Check:**
1. Templates exist in `src/notifications/templates/`
2. Templates copied to `dist/notifications/templates/` after build
3. Template syntax is valid Handlebars

**Fix:**
```bash
# Rebuild project
npm run build
```

---

### **Issue: Template variables not showing**

**Check:**
1. Context variables passed correctly in service
2. Handlebars syntax correct: `{{variableName}}`
3. Variable names match between service and template

**Example:**
```typescript
// Service passes:
context: { otp: '123456', squadzId: 'SQZ-12345678' }

// Template uses:
{{otp}}  ✅ Correct
{{code}} ❌ Wrong (variable not passed)
```

---

## Testing Checklist

### **Email Verification:**
- [ ] Email received in Mailtrap
- [ ] OTP displayed correctly (6 digits)
- [ ] SQUADZ ID displayed correctly (SQZ-XXXXXXXX format)
- [ ] Expiry time shown (3 minutes)
- [ ] Layout looks professional
- [ ] Mobile responsive (check in Mailtrap preview)

### **Password Reset:**
- [ ] Email received in Mailtrap
- [ ] OTP displayed correctly (6 digits)
- [ ] Expiry time shown (5 minutes)
- [ ] Reset window shown (15 minutes)
- [ ] Security notice visible
- [ ] Support email shown
- [ ] Layout looks professional

### **Account Lockout:**
- [ ] Email received after 5 failed logins
- [ ] Unlock time formatted correctly
- [ ] Lockout duration shown (15 minutes)
- [ ] Security recommendations visible
- [ ] Support email shown
- [ ] Layout looks professional

---

## Advanced Testing

### **Test with Real Email (Optional):**

1. Update `.env` with real SMTP (Gmail, Outlook, etc.)
2. Use your real email in registration
3. Check actual inbox (not Mailtrap)
4. Verify deliverability and spam score

### **Test Template Rendering:**

Create a simple test endpoint (dev only):

```typescript
// In notifications.controller.ts (create if needed)
@Get('test-email')
async testEmail() {
  await this.notificationsService.sendVerificationEmail(
    'your-email@example.com',
    '123456',
    'SQZ-12345678'
  );
  return { message: 'Test email sent' };
}
```

---

## Production Readiness

Before deploying to production:

1. ✅ All 3 email types tested in Mailtrap
2. ✅ Templates render correctly on mobile and desktop
3. ✅ No broken images or styling issues
4. ✅ All dynamic variables populate correctly
5. ✅ AWS SES configured and domain verified
6. ✅ SPF/DKIM records set up
7. ✅ Production SMTP credentials in Elastic Beanstalk env vars
8. ✅ Test email delivery in production (sandbox mode first)

---

## Support

If emails aren't working:

1. Check backend logs for errors
2. Verify SMTP credentials
3. Test SMTP connection manually (use Nodemailer test)
4. Check Mailtrap inbox limits (free tier: 500 emails/month)
5. Contact support if persistent issues

---

## Next Steps

After verifying emails work:

1. Test complete auth flows end-to-end
2. Verify OTP codes work for verification and reset
3. Test account lockout and unlock timing
4. Move to Phase 7: Common Guards & Decorators
5. Complete E2E testing for Milestone 1

