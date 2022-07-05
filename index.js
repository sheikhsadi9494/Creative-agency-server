const { MongoClient, ServerApiVersion } = require('mongodb');
const express = require('express')
const app = express()
const cors = require('cors');
const { is } = require('express/lib/request');
const ObjectId = require('mongodb').ObjectId
require('dotenv').config()
const port = process.env.PORT || 5000

// middleware
app.use(cors())
app.use(express.json())

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.4wgcq.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
    try {
        await client.connect();
        const database = client.db('creative-agency');
        const servicesCollection = database.collection('services');
        const ordersCollection = database.collection('orders');
        const userCollection = database.collection('user');
        const reviewsCollection = database.collection('reviews')

        // get all services data
        app.get('/services', async (req, res) => {
            const quiry = servicesCollection.find({});
            const result = await quiry.toArray();
            res.json(result);
        })
        // get single service data by thire id
        app.get('/services/:id', async (req, res) => {
            const id = req.params.id;
            const quiry = { _id: ObjectId(id)};
            const result = await servicesCollection.findOne(quiry);
            res.send(result);
        })
        // post service data 
        app.post('/services', async (req, res) => {
            const service = req.body;
            const result = await servicesCollection.insertOne(service);
            res.json(result);
        })
        //delete service data
        app.delete('/services/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id)};
            const result = await servicesCollection.deleteOne(query);
            res.json(result);
        })
        //post order data to database
        app.post('/orders', async (req, res) => {
            const order = req.body;
            const result = await ordersCollection.insertOne(order);
            res.json(result);
        })
        //get order data
        app.get('/orders', async (req, res) => {
            const email = req.query.email;
            const query = {email: email}
            const cursor = ordersCollection.find(query);
            const orders = await cursor.toArray();
            res.json(orders)
        })
        // get order by id
        app.get('/orders/:id', async(req, res) => {
            const id = req.params.id;
            const quiry = { _id: ObjectId(id)};
            const result = await ordersCollection.findOne(quiry);
            res.json(result);
        })
        //delete order data
        app.delete('/orders/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id)};
            const result = await ordersCollection.deleteOne(query);
            res.json(result);
        })
        //get orders
        app.get('/allOrders', async (req, res) => {
            const query = ordersCollection.find({});
            const result = await query.toArray();
            res.json(result);
        })
        //get single order by id
        app.get('/allOrders/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id)};
            const result = await ordersCollection.findOne(query);
            res.json(result);
        })
        //delete single order to all ordres
        app.delete('/allOrders/:id', async (req, res) => {
            const id = req.params.id;
            const query = {_id: ObjectId(id)};
            const result = await ordersCollection.deleteOne(query);
            res.json(result);
        })
        // update order status
        app.put('/allOrders/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id)};
            const updateDoc = {$set: {status: 'Approved'}};
            const result = await ordersCollection.updateOne(query, updateDoc);
            res.json(result)
        })
        //post user data to the databse 
        app.post('/user', async (req, res) => {
            const user = req.body;
            const result = await userCollection.insertOne(user);
            console.log(result);
            res.json(result);
        })
        //upert user for google login
        app.put('/user', async (req, res) => {
            const user = req.body;
            const filter = { email: user.email };
            const options = { upsert: true };
            const updateDoc = {$set: user};
            const result = await userCollection.updateOne(filter, updateDoc, options);
            res.json(result);
        })
        //update user to admin
        app.put('/user/admin', async (req, res) => {
            const user = req.body;
            console.log('put', user);
            const filter = { email: user.email };
            const updateDoc = { $set: {role: 'admin'} };
            const result = await userCollection.updateOne(filter, updateDoc);
            res.json(result);
        })
        //cheack that user admin or not
        app.get('/user/:email', async (req, res) => {
            const email = req.params.email;
            const query = {email: email};
            const user = await userCollection.findOne(query);
            let isAdmin = false;
            if(user?.role === 'admin'){
                isAdmin = true;
            }
            res.json({admin: isAdmin});
        })
        //post review data form ui
        app.post('/reviews', async (req, res) => {
            const review = req.body;
            const result = await reviewsCollection.insertOne(review);
            console.log(result);
            res.json(result)
        })
        //get all review data
        app.get('/reviews', async (req, res) => {
            const query = reviewsCollection.find({});
            const result = await query.toArray();
            console.log(result.email)
            res.json(result)
        })

    }
    finally {
        // await client.close();
    }
}
run().catch(console.dir);

app.get('/', (req, res) => {
    res.send('creative agency server')
})

app.listen(port, () => {
    console.log('server running on', port)
});