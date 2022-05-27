const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();
const port = process.env.PORT || 4000;
const app = express();
// middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ynfqx.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });


function verifyJWT(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).send({ message: 'UNauthorized access' });
    }
    const token = authHeader.split(' ')[1];
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, function (err, decoded) {
        if (err) {
            return res.status(403).send({ message: 'Forbidden access' })
        }
        req.decoded = decoded;
        next();

    });
}


async function run() {
    await client.connect();
    const toolsCollection = client.db("bikeTools").collection("tools");
    const bookedCollection = client.db('bikeTools').collection('bookedTools');
    const reviewCollection = client.db('bikeTools').collection('reviews');
    const profileUpdateCollection = client.db('bikeTools').collection('updateProfile');
    const userCollection = client.db('bikeTools').collection('users');
    console.log('connected to db jkfdlasljk');


    const verifyAdmin = async (req, res, next) => {
        const requester = req.decoded.email;
        const requseterAccount = await userCollection.findOne({ email: requester });
        if (requseterAccount.role === 'admin') {
            next();
        }
        else {
            res.status(403).send({ message: 'forbidden' });
        }
    }




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

        app.get('/bookedTools/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const booking = await bookedCollection.findOne(query);
            res.send(booking);
        })
        app.get('/updateProfile', async (req, res) => {
            const query = {};
            const cursor = profileUpdateCollection.find(query);
            const results = await cursor.toArray();
            console.log(results);
            res.send(results);
        });
        app.get('/user', async (req, res) => {
            const users = await userCollection.find().toArray();
            res.send(users);
        })
        app.get('/admin/:email', async (req, res) => {
            const email = req.params.email;
            const user = await userCollection.findOne({ email: email });
            const isAdmin = user.role === 'admin';
            res.send({ admin: isAdmin })
        })

        app.put('/user/admin/:email', async (req, res) => {
            const email = req.params.email;
            const filter = { email: email };
            const updateDoc = {
                $set: { role: 'admin' },
            };
            const result = await userCollection.updateOne(filter, updateDoc);
            res.send(result);
        })
        app.post('/tools', async (req, res) => {
            const newTool = req.body;
            const result = await toolsCollection.insertOne(newTool);
            res.send(result);
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
        app.put('/updateProfile', async (req, res) => {
            const update = req.body;
            const result = await profileUpdateCollection.insertOne(update);
            res.send(result);
        });

        app.put('/user/:email', async (req, res) => {
            const email = req.params.email;
            const user = req.body;
            const filter = { email: email };
            const options = { upsert: true };
            const updateDoc = {
                $set: user,
            };
            const result = await userCollection.updateOne(filter, updateDoc, options);
            const token = jwt.sign({ email: email }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1h' })
            res.send({ result, token });
        });
        // DELETE
        app.delete('/bookedTools/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await bookedCollection.deleteOne(query);
            res.send(result);
        });
        app.delete('/updateProfile/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await profileUpdateCollection.deleteOne(query);
            res.send(result);
        });
        app.delete('/tools/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await toolsCollection.deleteOne(query);
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