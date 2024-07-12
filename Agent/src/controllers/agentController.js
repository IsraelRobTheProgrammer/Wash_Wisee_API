const JWT = require("jsonwebtoken");
const { conn } = require("../mongo/dbConnect");
// const Agent = agentConn.model("Agent");

const agentDashBoard = async (req, res) => {
  try {
    const agentDBConn = await conn;
    if (agentDBConn == "ERROR")
      return res.status(500).json("Error connecting to DB");
    const Agent = agentDBConn.model("Agent");
    const agent = Agent.findOne({ email: res.agent.email });
    res.status(200).json({
      agentDetails: {
        total_earnings: agent.totalEarning,
        totalBookings: agent.totalBookings,
        rejectedBookings: agent.rejectedBookings,
        pendingBookings: agent.pendingBookings,
        recent_bookings: agent.recentBookings,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  agentDashBoard,
};
