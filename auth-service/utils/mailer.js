const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'Gmail', // or your email provider
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

exports.sendVerificationEmail = async (to, code) => {
  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to,
    subject: 'Your SmartStitch Verification Code',
    text: `Your verification code is: ${code}`,
    html: `<p>Your verification code is: <b>${code}</b></p>`,
  });
};

exports.sendResetPasswordEmail = async (to, token) => {
    const url = `http://localhost:5000/api/auth/reset-password/${token}`;
    await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to,
        subject: 'Reset your password',
        html: `<p>Reset your password by clicking <a href="${url}">here</a>.</p>`
    });
};