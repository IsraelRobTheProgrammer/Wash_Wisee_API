const { default: mongoose } = require("mongoose");
const AgentSchema = require("./agentApp/src/models/Agent");

const dbConnection = async () => {
  try {
    let userDBConn;
    const agentDBConn = await mongoose
      .createConnection(process.env.AGENT_DB_URL, {
        // maxPoolSize: 10,
        // minPoolSize: 2,
        // serverSelectionTimeoutMS: 10000,
        // socketTimeoutMS: 10000,
      })
      .asPromise();
    agentDBConn.model("Agent", AgentSchema);

    agentDBConn.on("connected", () => console.log("connected"));
    agentDBConn.once("open", () => console.log("open"));
    agentDBConn.on("disconnected", () => console.log("disconnected"));
    agentDBConn.on("reconnected", () => console.log("reconnected"));
    agentDBConn.on("disconnecting", () => console.log("disconnecting"));
    agentDBConn.on("close", () => console.log("close"));

    return { agentDBConn, userDBConn };
    // console.log(agentDBConn, "comn");
  } catch (error) {
    console.log("in error");
    console.log("DB Error: " + error);
    console.log("DB REASON", error.reason);
    return "ERROR";
  }
};
const conn = dbConnection();

module.exports = { conn, dbConnection };
