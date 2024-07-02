const randomString = require("crypto-random-string");
const sendMail = require("../utils/mail");
const Agent = require("../models/Agent");
const { emailSchema } = require("../../joiSchema");

const verificationMail = async (req, res) => {
  try {
    const { email } = req.params;
    const { error } = emailSchema.validate({ email });
    if (error)
      return res.status(400).json({ message: error.details[0].message });

    // Checking if the user exists
    const agent = await Agent.findOne({ email });
    if (!agent)
      return res
        .status(404)
        .json({ message: "Agent not found, Try Signing Up" });
    const code = randomString({ length: 5, type: "numeric" });

    const html = `
    <!DOCTYPE html>
    <html lang="en">
    
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Verify Your Email Address</title>
        <style>
            body {
                font-family: sans-serif;
                margin: 0;
                padding: 0;
            }
    
            .container {
                padding: 20px;
                max-width: 600px;
                margin: 0 auto;
                border-radius: 5px;
                background-color: #332c54;
                height: 100vh;
            }
    
            .header {
                text-align: center;
            }
    
            .content {
                padding: 20px;
            }
    
            .cta {
                text-align: center;
                margin-top: 20px;
            }
    
            a {
                color: #fff2eb;
                text-decoration: none;
            }
        </style>
    </head>
    
    <body>
        <div class="container">
            <div class="header">
                <h1>Welcome to WashWisee!</h1>
            </div>
            <div class="content">
                <p>Thank you for signing up for an account on WashWisee. To verify your email address and unlock full access
                    to our features, please enter the verification code below.</p>
            </div>
            <div class="cta">
                <h1>${code}</h1>
            </div>
            <div class="content">
                <p>For your security, this verification code will expire in 10 minutes.</p>
            </div>
            <div class="content">
                <p>If you didn't create an account on WashWisee, please ignore this email.</p>
            </div>
        </div>
    </body>
    
    </html>
          `;
    const subject = "Verify your account on WashWisee!";
    const from = `WashWisee Support<${process.env.EMAIL}>`;

    await Agent.findByIdAndUpdate(agent._id, {
      $set: { verification_code: code },
    });

    await sendMail(from, email, subject, html);
    res.status(200).json({ message: "Verification mail has been sent" });
  } catch (e) {
    return res.status(500).json({ message: "internal server error", error: e });
  }
};

const verifyCode = async (req, res) => {
  try {
    const { code, email } = req.body;
    if (!email || !code)
      return res.status(400).json({ message: "All field is required" });

    const agent = await Agent.findOne({ email }).select("+verification_code");
    if (!agent)
      return res
        .status(404)
        .json({ message: "Agent not found, Try Signing Up" });

    if (agent.verification_code !== code)
      return res.status(400).json({ message: "Invalid Verification Code" });

    await Agent.findByIdAndUpdate(
      agent._id,
      {
        $set: { verification_code: null, isVerified: true },
      },
    );
    const html = `
    //                   <!DOCTYPE html>
    // <html lang="en">
    // <head>
    //   <meta charset="UTF-8">
    //   <meta name="viewport" content="width=device-width, initial-scale=1.0">
    //   <title>Your Email is Verified!</title>
    //   <style>
    //     body {
    //       font-family: sans-serif;
    //       margin: 0;
    //       padding: 0;
    //     }
    //     .container {
    //       padding: 20px;
    //       max-width: 600px;
    //       margin: 0 auto;
    //       background-color: #332c54;
    //     }
    //     .header {
    //       text-align: center;
    //     }
    //     .content {
    //       padding: 20px;
    //     }
    //     .cta {
    //       text-align: center;
    //       margin-top: 20px;
    //     }
    //     a {
    //       text-decoration: none;
    //       color: #fff;
    //     }
    //   </style>
    // </head>
    // <body>
    //   <div class="container">
    //     <div class="header">
    //       <h1>Welcome to WashWisee!</h1>
    //     </div>
    //     <div class="content">
    //       <p>Hi User ${agent.email},</p>
    //       <p>Your email address has been successfully verified. You're now ready to explore all the great things WashWisee has to offer.</p>
    //     </div>
    //     <div class="cta">
    //       <a href="https://washwise.co/213edaq3ew2">Start Exploring Now!</a>
    //     </div>
    //   </div>
    // </body>
    // </html>
    //             `;
    const subject = "Verification Successful!";
    const from = `WashWisee Support<${process.env.EMAIL}>`;

    await sendMail(from, email, subject, html);
    return res
      .status(200)
      .json({ message: "Agent has been verified successfully" });
  } catch (e) {
    return res.status(500).json({ message: "internal server error", error: e });
  }
};

module.exports = { verificationMail, verifyCode };
