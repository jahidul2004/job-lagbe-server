const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
require("dotenv").config();

const app = express();

const port = process.env.PORT || 5000;

// Middleware
app.use(express.json());
app.use(cors());
app.use(cookieParser());

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
        const jobApplications = database.collection("jobApplications");

        // APIS

        // Auth Related APIS
        app.post("/jwt", async (req, res) => {
            const user = req.body;

            const token = jwt.sign(user, process.env.JWT_SECRET, {
                expiresIn: "1h",
            });

            res.cookie("token", token, {
                httpOnly: true,
                secure: false,
            });

            res.send({ success: true });
        });

        // Get all jobs
        app.get("/jobs", async (req, res) => {
            const email = req.query.email;
            let query = {};
            if (email) {
                query = { hr_email: email };
            }
            const allJobs = await jobs.find(query).toArray();
            res.send(allJobs);
        });

        // Get all job applications as a recruiter
        app.get("/job-applications/jobs/:id", async (req, res) => {
            const id = req.params.id;
            const query = { jobId: id };

            const result = await jobApplications.find(query).toArray();
            res.send(result);
        });

        // Get a single job with id
        app.get("/jobs/:id", async (req, res) => {
            const id = req.params.id;
            const job = await jobs.findOne({ _id: new ObjectId(id) });
            res.send(job);
        });

        // Job post api
        app.post("/jobs", async (req, res) => {
            const job = req.body;
            const result = await jobs.insertOne(job);
            res.send(result);
        });

        // Jobs application get,post api

        app.get("/job-application", async (req, res) => {
            const email = req.query.email;

            const query = { applicantEmail: email };

            const result = await jobApplications.find(query).toArray();

            // Aggregate more data

            for (const application of result) {
                const aggregateQueries = {
                    _id: new ObjectId(application.jobId),
                };
                const job = await jobs.findOne(aggregateQueries);

                if (job) {
                    application.title = job.title;
                    application.company = job.company;
                    application.logo = job.company_logo;
                    application.location = job.location;
                    application.category = job.category;
                }
            }

            res.send(result);
        });

        app.post("/job-application", async (req, res) => {
            const jobApplication = req.body;
            const result = await jobApplications.insertOne(jobApplication);
            res.send(result);
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
