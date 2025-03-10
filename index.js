const express = require("express");
const app = express();
const cors = require("cors");
require("dotenv").config();

// const jwt = require('jsonwebtoken');
// const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const port = process.env.PORT || 5000;

const allowedOrigins = [
  "http://localhost:5173",
  "https://assingment12p.web.app",
];

// middleware
app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PATCH", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json());

const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.mti5t.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();
    // Send a ping to confirm a successful connection
    // await client.db("admin").command({ ping: 1 });
    // console.log("Pinged your deployment. You successfully connected to MongoDB!");

    // Database Collections
    const parcelCollection = client.db("parcelDB").collection("parcels");
    const userCollection = client.db("parcelDB").collection("users");

    // Users APIs
    // ---------------------------------------
    // Create User
    app.post("/users", async (req, res) => {
      const newUser = req.body;
      const bodyEmail = { email: newUser.email };
      const existingEmail = await userCollection.findOne(bodyEmail);
      if (existingEmail) {
        return res.send({ message: "User Already Exists" });
      }
      const result = await userCollection.insertOne(newUser);
      res.send(result);
    });

    // Get User by email
    app.get("/user/:email", async (req, res) => {
      const email = req.params.email;
      const filter = { email: email };
      const result = await userCollection.findOne(filter);
      res.send(result);
    });

    // Update User by email
    app.put("/user/:email", async (req, res) => {
      const email = req.params.email;
      const filter = { email: email };
      const options = { upsert: true };
      const updatedDoc = req.body;
      const newData = {
        $set: {
          name: updatedDoc.name,
          imgUrl: updatedDoc.imgUrl,
          phone: updatedDoc.phone,
        },
      };
      const result = await userCollection.updateOne(filter, newData, options);
      res.send(result);
    });

    // Update User Role by ID
    app.patch("/user-role/:id", async (req, res) => {
      const userId = req.params.id;
      const { role } = req.body;
      const filter = { _id: new ObjectId(userId) };
      const options = { upsert: true };
      const newData = {
        $set: {
          userRole: role,
        },
      };
      const result = await userCollection.updateOne(filter, newData, options);
      res.send(result);
    });

    // Delete User by email
    app.delete("/user/:email", async (req, res) => {
      const email = req.params.email;
      const filter = { email: email };
      const result = await userCollection.deleteOne(filter);
      res.send(result);
    });

    // ---------------------------------------

    // Book A Parcel Post
    app.post("/parcel-book", async (req, res) => {
      const data = req.body;
      const result = await parcelCollection.insertOne(data);
      res.send(result);
    });

    // Get Booked Parcel for user
    app.get("/my-parcel-book/:email", async (req, res) => {
      const email = req.params.email;
      const filter = { email: email };
      const result = await parcelCollection.find(filter).toArray();
      res.send(result);
    });

    // Get One parcel by id
    app.get("/my-parcel-book/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const result = await parcelCollection.findOne(filter);
      res.send(result);
    });

    // Update parcel by id
    app.put("/my-parcel-book/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const options = { upsert: true };
      const updatedDoc = req.body;
      const newData = {
        $set: {
          phoneNumber: updatedDoc.phoneNumber,
          parcelWeight: updatedDoc.parcelWeight,
          parcelType: updatedDoc.parcelType,
          receiverPhoneNumber: updatedDoc.receiverPhoneNumber,
          receiverName: updatedDoc.receiverName,
          parcelDeliveryAddress: updatedDoc.parcelDeliveryAddress,
          requestedDeliveryDate: updatedDoc.requestedDeliveryDate,
          price: updatedDoc.price,
          latitude: updatedDoc.latitude,
          longitude: updatedDoc.longitude,
          status: updatedDoc.status,
          date: updatedDoc.date,
        },
      };
      const result = parcelCollection.updateOne(filter, newData, options);
      res.send(result);
    });

    // Parcel Status Update
    app.patch("/my-parcel-book/:id", async (req, res) => {
      const id = req.params.id;
      const updatedDoc = req.body;
      const filter = { _id: new ObjectId(id) };
      const newData = {
        $set: updatedDoc,
      };
      const result = await parcelCollection.updateOne(filter, newData);
      res.send(result);
    });

    // Delete parcel by id
    app.delete("/parcel/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const result = await parcelCollection.deleteOne(filter);
      res.send(result);
    });

    // Admin APIs
    //Admin Statistics
    app.get("/admin-statistics", async (req, res) => {
      const parcels = await parcelCollection.estimatedDocumentCount();
      const users = await userCollection.estimatedDocumentCount();

      res.send({
        parcels,
        users,
      });
    });

    // Get All Users
    app.get("/all-users", async (req, res) => {
      const result = await userCollection.find().toArray();
      res.send(result);
    });

    // All "Delivery Men"
    app.get("/allDeliveryMan", async (req, res) => {
      const filter = { userRole: "Delivery Men" };
      const result = await userCollection.find(filter).toArray();
      res.send(result);
    });

    // All Parcels
    app.get("/all-parcels", async (req, res) => {
      const result = await parcelCollection.find().toArray();
      res.send(result);
    });

    // Manage Parcel
    app.put("/manage-parcel/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const options = { upsert: true };
      const updatedDoc = req.body;
      const newData = {
        $set: updatedDoc,
      };
      const result = await parcelCollection.updateOne(filter, newData, options);
      res.send(result);
    });

    // Statistics Parcel Booked By date
    app.get("/booked-by-date", async (req, res) => {
      const parcels = await parcelCollection
        .aggregate([
          {
            $addFields: {
              formattedDate: {
                $dateToString: {
                  format: "%d-%m-%Y",
                  date: { $toDate: "$date" },
                },
              },
            },
          },
          {
            $group: {
              _id: "$formattedDate",
              count: { $sum: 1 },
            },
          },
          { $sort: { _id: 1 } },
        ])
        .toArray();
      res.send(parcels);
    });
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Assignment 12 Starting");
});

app.listen(port, () => {
  console.log(`Assignment-12 is sitting on port ${port}`);
});
