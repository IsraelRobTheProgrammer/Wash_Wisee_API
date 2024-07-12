const JWT = require("jsonwebtoken");
const { conn } = require("../mongo/dbConnect");

const createBusiness = async (req, res) => {
  try {
    const { businessName, services, priceRange, description } = req.body;
    const agentDBConn = await conn;
    if (agentDBConn == "ERROR")
      return res.status(500).json("Error connecting to DB");
    const Agent = agentDBConn.model("Agent");

    const token = req.cookies.agent_info;
    let agent_id = null;
    if (token) {
      JWT.verify(token, process.env.USER_INFO_TOKEN_SECRET, (err, decoded) => {
        if (err) throw new Error("Invalid or expired reset token");
        console.log(decoded);
        agent_id = decoded.agentId;
      });
    }
    const updatedAgent = await Agent.findByIdAndUpdate(agent_id, {
      $set: {
        businessName: businessName,
        services: services,
        priceRange: priceRange,
        description: description,
      },
    });

    res.status(201).json({
      message: "Agent's Business Created Successfully",
      updatedAgent,
    });
    // await agentDBConn.close();
  } catch (error) {
    console.log(error, "sorry an error occured");
    res.status(500).json(error);
  }
};

module.exports = {
  createBusiness,
};
