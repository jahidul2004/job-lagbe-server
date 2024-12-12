const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();

const port = process.env.PORT || 5000;

// Middleware
app.use(express.json());
app.use(cors());

// Mongo DB Connection

const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.8eefy.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

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
        await client.connect();

        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log(
            "Pinged your deployment. You successfully connected to MongoDB!"
        );

        // Get the database and collection
        const database = client.db("jobLagbe");
        const jobs = database.collection("jobs");

        // APIS

        // Get all jobs
        app.get("/jobs", async (req, res) => {
            const allJobs = await jobs.find({}).toArray();
            res.send(allJobs);
        });

        // Get a single job with id
        app.get("/jobs/:id", async (req, res) => {
            const id = req.params.id;
            const job = await jobs.findOne({ _id: new ObjectId(id) });
            res.send(job);
        });
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);

// Routes

app.get("/", (req, res) => {
    res.send("Job lagbe server is running");
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
