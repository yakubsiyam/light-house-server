const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const cors = require("cors");
require("dotenv").config();
const { MongoClient } = require("mongodb");

const ObjectId = require("mongodb").ObjectId;

const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());
app.use(bodyParser.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.cgvvx.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;

const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function run() {
  try {
    await client.connect();
    const database = client.db("light-house");
    const lampsCollection = database.collection("lamps");
    const cartsCollection = database.collection("carts");
    const reviewsCollection = database.collection("reviews");

    // found all lamps
    app.get("/lamps", async (req, res) => {
      const cursor = lampsCollection.find({});
      const lamps = await cursor.toArray();
      res.send(lamps);
    });

    // find single lamp
    app.get("/lamps/:lampId", async (req, res) => {
      const id = req.params.lampId;
      const query = { _id: ObjectId(id) };
      const singleLamp = await lampsCollection.findOne(query);
      res.send(singleLamp);
    });

    // found my carts
    // app.get("/carts", async (req, res) => {
    //   const cursor = cartsCollection.find({});
    //   const carts = await cursor.toArray();
    //   res.send(carts);
    // });

    // add mycart
    app.post("/carts", async (req, res) => {
      const cart = req.body;
      const allCart = await cartsCollection.insertOne(cart);
      res.json(allCart);
    });

    // my cart data filtering
    app.get("/carts", async (req, res) => {
      let query = {};
      const email = req.query.email;
      if (email) {
        query = { email: email };
      }

      const cursor = cartsCollection.find(query);
      const myCarts = await cursor.toArray();
      res.send(myCarts);
    });

    // found all reviews
    app.get("/reviews", async (req, res) => {
      const cursor = reviewsCollection.find({});
      const reviews = await cursor.toArray();
      res.send(reviews);
    });

    //post a review
    app.post("/reviews", async (req, res) => {
      const singleReview = req.body;
      const review = await reviewsCollection.insertOne(singleReview);
      res.json(review);
    });

    //update status data
    app.put("/carts/:id", async (req, res) => {
      const id = req.params.id;
      const updateStatus = "accepted";
      const filter = { _id: ObjectId(id) };
      const options = { upsert: true };
      const updateDoc = {
        $set: {
          status: updateStatus,
        },
      };
      const updatedLamps = await cartsCollection.updateOne(
        filter,
        updateDoc,
        options
      );
      res.send(updatedLamps);
    });

    // delete my cart lamps
    app.delete("/carts/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const deleteLamps = await cartsCollection.deleteOne(query);
      res.send(deleteLamps);
    });
  } finally {
    // await client.close();
  }
}

run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Hello light house!!");
});

app.listen(port, () => {
  console.log(`listening at ${port}`);
});
