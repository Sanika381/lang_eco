import express,{Request,Response} from "express";
import {runGraph} from "./src/graph/qaGraph"
import { sequelize } from "./src/db/dbConnect";
import "./src/db/model/conversation.schema"
import "./src/db/model/message.schema"
import "./src/db/model/convodoc.schema"  
import {router} from "./src/routes/question.route"
import "./src/db/model/chunk.schema"
import "./src/db/model/document.schema"
import "./src/db/association"
import { conversationRouter } from "./src/routes/conversation.route";
import { docRouter } from "./src/routes/document.route";
const app = express();
const PORT = 3000;

app.use(express.json());
app.use("/api",router)
app.use("/api/conversation",conversationRouter)
app.use("/doc",docRouter)
app.get("/", (req: Request, res:Response) => {
  try{
    console.log("Request received");
  return res.json({ message: "Hello from the server!" });
  }catch(error){
    console.error("Error handling request:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
  
})

const startServer = async () => {
  try {
    await sequelize.sync({ force: false });
    app.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

startServer();
