import DataUriParser from 'datauri/parser.js';
import { createTransport } from 'nodemailer';
import path from 'path';

//get format data infos
export const getDataUri = (file) => {
  const parser = new DataUriParser();
  const extName = path.extname(file.originalname).toString();
  return parser.format(extName, file.buffer);
};

//sendmail

export const sendEmail = async (subject, to, text) => {
  const transporter = createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
  await transporter.sendMail({
    to,
    subject,
    text,
  },function(err, result) {
    if(err) {
      console.log(err);
    }else{
      console.log(result)
    }

  });
};
