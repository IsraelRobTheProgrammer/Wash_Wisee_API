const argon = require("argon2");
const randomString = require("crypto-random-string");
const JWT = require("jsonwebtoken");
const sendMail = require("../utils/mail");
const { default: mongoose } = require("mongoose");
const { conn } = require("../mongo/dbConnect");


const signup = async (req, res) => {
  try {
    const { firstName, lastName, email, password } = req.body;
    // DB connection and check up
    const { agentDBConn } = await conn;
    if (agentDBConn == "ERROR")
      return res.status(500).json("Error connecting to DB");
    // getting the Agent Model from the agentDB
    const Agent = agentDBConn.model("Agent");

    const hashedPassword = await argon.hash(password);
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
                height: 100dvh;
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
    const subject = "Verify your account WashWisee!";
    const from = `WashWisee Support<${process.env.EMAIL}>`;
    console.log(req.body);
    const newAgent = new Agent({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      verification_code: code,
    });
    const agent = await newAgent.save();
    console.log(newAgent, "newAgent");
    newAgent.verification_code = null;
    newAgent.refreshToken = null;
    newAgent.resetPasswordCode = null;
    newAgent.password = null;

    await sendMail(from, email, subject, html);
    // await mongoose.close();
    // await agentDBConn.close();
    return res.status(201).json({
      message:
        "Account Created Successfully, Check Your Email For Verification Code",
      agent,
    });
  } catch (error) {
    console.log(error.message, "sorry an error occured");
    res.status(500).json({ msg: error.message });
  }
};

const login = async (req, res) => {
  try {
    const agentDBConn = await conn;
    if (agentDBConn == "ERROR")
      return res.status(500).json("Error connecting to DB");
    const Agent = agentDBConn.model("Agent");

    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ message: "All field is required" });
    const foundAgent = await Agent.findOne({ email }).select("+password");
    if (!foundAgent) return res.status(401).json("Wrong Credentials");

    const checkPswd = await argon.verify(foundAgent.password, password);

    if (!checkPswd)
      return res.status(401).json({ message: "Wrong credentials" });

    const accessToken = foundAgent.createAccessToken();
    const refreshToken = foundAgent.createRefreshToken();

    // update the agent to add the refresh token
    const updatedAgent = await Agent.findByIdAndUpdate(
      foundAgent._id,
      {
        $push: { refreshToken: refreshToken },
      },
      { new: true }
    );

    const agent = { ...updatedAgent._doc, accessToken };
    agent.password = null;
    agent.verification_code = null;
    agent.refreshToken = null;
    agent.resetPasswordCode = null;

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      maxAge: 30 * 24 * 60 * 60 * 1000,
      sameSite: "None",
      secure: true,
    });

    res.status(200).json({
      message: "Login succesfull",
      agent,
    });

    // await agentDBConn.close();
  } catch (error) {
    res.status(500).json(error);
  }
};

const forgotPassword = async (req, res) => {
  const agentDBConn = await conn;
  if (agentDBConn == "ERROR")
    return res.status(500).json("Error connecting to DB");
  const Agent = agentDBConn.model("Agent");

  const { email } = req.body;
  try {
    const agent = await Agent.findOne({ email });
    if (!agent) return res.status(404).json({ message: "Agent not found" });

    const resetCode = randomString({ length: 5, type: "numeric" });

    const resetToken = JWT.sign(
      { agent: agent.email, resetCode: resetCode },
      process.env.PSWD_RESET_TOKEN,
      {
        expiresIn: "1hr",
      }
    );

    await Agent.findByIdAndUpdate(agent._id, {
      $set: { resetPasswordCode: resetCode, resetPasswordToken: resetToken },
    });

    // Create a reset password email
    const html = `<!DOCTYPE html>
    <html lang="en">
    
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title> Password Reset Email </title>
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
                <h1> You have requested a password reset for your WashWisee account. </h1>
            </div>
    
            <div class="content">
                <p>Click on the following link to reset your password within 1 hour:</p>
                <a href="${process.env.FRONTEND_URL}/reset-password?token=${resetToken}">Reset Password</a>
            </div>
    
            <div class="content">
                <p>If you did not request a password reset, please ignore this email.</p>
            </div>
        </div>
    </body>
    </html>
`;
    const subject = "WashWisee Account Password Reset";
    const from = `WashWisee Support<${process.env.EMAIL}>`;

    // Send the reset password email
    await sendMail(from, email, subject, html);

    res.status(200).json({ message: "Password reset link sent to your email" });
    // await agentDBConn.close();
  } catch (e) {
    return res
      .status(500)
      .json({ message: "internal server error", error: e.message });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { token } = req.query;
    const { password } = req.body;

    const agentDBConn = await conn;
    if (agentDBConn == "ERROR")
      return res.status(500).json("Error connecting to DB");
    const Agent = agentDBConn.model("Agent");

    // Check if reset token is valid
    let email = "";
    let code = "";
    if (token) {
      JWT.verify(token, process.env.PSWD_RESET_TOKEN, (err, decoded) => {
        if (err) throw new Error("Invalid or expired reset token");
        email = decoded.agent;
        code = decoded.resetCode;
      });
    }
    console.log(email);
    const agent = await Agent.findOne({
      email: email,
      resetPasswordCode: code,
    });
    if (!agent)
      return res
        .status(400)
        .json({ message: "Invalid or expired reset token" });

    const hashedPassword = await argon.hash(password);

    // Update agent with the new password and remove reset token/code

    await Agent.findByIdAndUpdate(agent._id, {
      $set: {
        password: hashedPassword,
        resetPasswordCode: null,
        resetPasswordToken: null,
      },
    });

    const html = `<!DOCTYPE html>
    <html lang="en">
    
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title> Password Reset Successful </title>
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
                <h1> Your password reset for your WashWisee account is successful. </h1>
            </div>
    
            <div class="content">
                <p>Hey User ${email}, Your Password reset is successful you can go ahead and login with your new password</p>
            </div>
        </div>
    </body>
    </html>
`;
    const subject = "WashWisee Account Password Reset";
    const from = `WashWisee Support<${process.env.EMAIL}>`;

    // Send the reset password email
    await sendMail(from, email, subject, html);

    res.status(200).json({ message: "Password reset successful" });
    // await agentDBConn.close();
  } catch (e) {
    if (e.message === "Invalid or expired reset token") {
      return res
        .status(400)
        .json({ message: "Invalid or expired reset token" });
    }
    return res
      .status(500)
      .json({ message: "internal server error", error: e.message });
  }
};

module.exports = {
  signup,
  login,
  forgotPassword,
  resetPassword,
};
