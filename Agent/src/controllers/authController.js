const Agent = require("../models/Agent");
const argon = require("argon2");
const randomString = require("crypto-random-string");
const sendMail = require("../utils/mail");
const jwt = require("jsonwebtoken");

const signup = async (req, res) => {
  const { email, password } = req.body;
  try {
    if (!email || !password)
      return res.status(400).json({ message: "All field is required" });
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
      email: req.body.email,
      password: hashedPassword,
      verification_code: code,
    });
    const agent = await newAgent.save();

    agent.verification_code = undefined;
    agent.refresh_token = undefined;
    agent.resetPasswordToken = undefined;
    agent.password = undefined;

    // const agentWithoutSensitiveData = await Agent.findById(
    //   agent.id
    // ).select("-password -verification_code -refresh_token -resetPasswordToken");

    await sendMail(from, email, subject, html);
    res.status(201).json({
      success: true,
      message: "Account created successfully",
      agent,
    });
  } catch (error) {
    console.log(error, "sorry an error occured");
    res.status(500).json(error);
  }
};

const login = async (req, res) => {
  try {
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
      foundAgent.id,
      {
        $push: { refresh_token: refreshToken },
      },
      { new: true }
    );

    const agent = { ...updatedAgent._doc, accessToken };
    agent.password = undefined;
    agent.verification_code = undefined;
    agent.refresh_token = undefined;
    agent.resetPasswordToken = undefined;

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      maxAge: 30 * 24 * 60 * 60 * 1000,
      sameSite: "None",
      secure: true,
    });

    res.status(200).json({
      success: true,
      message: "Login successfull",
      agent,
    });
  } catch (error) {
    res.status(500).json(error);
  }
};

module.exports = {
  signup,
  login,
};
