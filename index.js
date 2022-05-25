const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();
const port = process.env.PORT || 4000;
const app = express();
// middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ynfqx.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
    await client.connect();
    const toolsCollection = client.db("bikeTools").collection("tools");
    const bookedCollection = client.db('bikeTools').collection('bookedTools');
    const reviewCollection = client.db('bikeTools').collection('reviews');
    console.log('connected to db jkfdlasljk');
    try {
        app.get('/tools', async (req, res) => {
            const query = {};
            const cursor = toolsCollection.find(query);
            const results = await cursor.toArray();
            console.log(results);
            res.send(results);
        });

        app.get('/tools/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const tool = await toolsCollection.findOne(query);
            res.send(tool);

        });

        app.get('/reviews', async (req, res) => {
            const query = {};
            const cursor = reviewCollection.find(query);
            const results = await cursor.toArray();
            console.log(results);
            res.send(results);
        });
        app.get('/bookedTools', async (req, res) => {
            const query = {};
            const cursor = bookedCollection.find(query);
            const results = await cursor.toArray();
            console.log(results);
            res.send(results);
        });

        app.post('/reviews', async (req, res) => {
            const newReview = req.body;
            const result = await reviewCollection.insertOne(newReview);
            res.send(result);
        });
        app.post('/bookedTools', async (req, res) => {
            const booked = req.body;
            const result = await bookedCollection.insertOne(booked);
            res.send(result);
        });


    } finally {




    }
}
run().catch(console.dir);
app.get('/', (req, res) => {
    res.send(' i am assigmnet-12')
});
app.listen(port, () => {
    console.log('db connected')
})