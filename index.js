require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

const app = express();
const port = process.env.PORT || 3000;

// Middleware to parse JSON
app.use(cors());
app.use(express.json());

const uri = process.env.MONGO_URI;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // await client.connect();
    const taskcollection = client.db("TaskCluster").collection("allTask");
    const userscollection = client
      .db("TaskCluster")
      .collection("usercollection");

    // await client.db("admin").command({ ping: 1 });
    // console.log(
    //   "Pinged your deployment. You successfully connected to MongoDB!"
    // );

    app.post("/regestation", async (req, res) => {
      const user = req.body;
      const result = await userscollection.insertOne(user);
      res.send(result);
    });
    // for feture sections
    app.get("/FetureTask", async (req, res) => {
      const FetureTask = await taskcollection
        .find()
        .sort({ deadline: 1 })
        .limit(6)
        .toArray();
      res.send(FetureTask);
    });
    app.get("/regestation", async (req, res) => {
      const users = await userscollection.find().toArray();
      res.send(users);
    });

    app.post("/add-task", async (req, res) => {
      const usertask = req.body;
      usertask.bids = 0;
      const result = await taskcollection.insertOne(usertask);
      res.send(result);
    });

    app.get("/add-task", async (req, res) => {
      const task = await taskcollection.find().toArray();
      res.send(task);
    });

    app.get("/add-task/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const taskbyid = await taskcollection.findOne(query);
      res.send(taskbyid);
    });

    app.put("/add-task/:id", async (req, res) => {
      const id = req.params.id;
      const updatedTask = req.body;
      const filter = { _id: new ObjectId(id) };
      const updateDoc = { $set: { ...updatedTask } };

      try {
        const result = await taskcollection.updateOne(filter, updateDoc);
        res.send(result);
      } catch (error) {
        console.error(error);
        res.status(500).send({ error: "Error updating task" });
      }
    });

    app.delete("/add-task/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await taskcollection.deleteOne(query);
      res.send(result);
    });

    // for bids count
    app.put("/add-task/bid/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };

      const updateDoc = {
        $inc: { bids: 1 },
      };

      try {
        const result = await taskcollection.updateOne(query, updateDoc);
        res.send(result);
      } catch (error) {
        res.status(500).send({ error: "Error updating bid count" });
      }
    });
  } finally {
    // You can close the client here if needed
    // await client.close();
  }
}

app.get("/", (req, res) => {
  res.send("this is monir backend ");
});
run().catch(console.dir);
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
