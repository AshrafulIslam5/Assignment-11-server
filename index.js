const express = require('express');
const cors = require('cors');
require('dotenv').config();
const port = process.env.PORT || 5000;
const app = express();

// middleware of the server
app.use(express.json());
const corsConfig = {
    origin: true,
    credentials: true,
}
app.use(cors(corsConfig))
app.options('*', cors(corsConfig))

const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.dbuserName}:${process.env.dbPassWord}@cluster0.rczhy.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
    try {
        await client.connect();
        const LaptopStock = client.db('Star-Stock').collection('All-Laptops');

        app.get('/laptops', async (req, res) => {
            const query = {};
            const cursor = LaptopStock.find(query);
            const laptops = await cursor.toArray();
            res.send(laptops);
        })

        app.get('/laptops/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const product = await LaptopStock.findOne(query);
            res.send(product);
        })

        // update quantity
        app.put('/laptops/:id', async (req, res) => {
            const id = req.params.id;
            const newQuantity = req.body;
            const query = { _id: ObjectId(id) };
            const options = { upsert: true };
            const updatedQuantity = {
                $set: {
                    newQuantity
                }
            }
            const finalQuantity = await LaptopStock.updateOne(query, updatedQuantity, options);
            res.send(finalQuantity);
        })

    }
    finally {

    }
}


run().catch(console.dir);



app.get('/', (req, res) => {
    res.send('WareHouse on Fire!');
});

app.listen(port, () => {
    console.log('Burning in port:', port, '!');
})