const subject_mail = "OTP: For Email Verification"

const message = (otp) =>{
     return 'To verify your email address, please use the\n'
      + 'following One Time Password (OTP):\n\n'
      + `${otp}\n\n`
      + 'Otp Valid only for 5 Minutes.\n'
      + 'Do not share this OTP with anyone. BestOf Shopping takes\n'
      + 'your account security very seriously. BestOf Shopping\n'
      + 'Customer Service will never ask you to disclose or\n'
      + 'verify your BestOf password, OTP, credit card, or\n'
      + 'banking account number. If you receive a suspicious\n'
      + 'email with a link to update your account information,\n'
      + 'do not click on the link.\n\n'
      + 'This is a auto-generated email. Please do not reply to this email.\n\n'
      + 'Regards\n'
      + 'Bestof Shopping\n\n'
}

module.exports={subject_mail, message};