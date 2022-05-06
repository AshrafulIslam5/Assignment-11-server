const express = require('express');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();
const port = process.env.PORT || 5000;
const cors = require('cors');
const query = require('express/lib/middleware/query');
const app = express();

// middleware of the server
app.use(express.json());
// Middlewares
const corsConfig = {
    origin: true,
    credentials: true,
}
app.use(cors(corsConfig))
app.options('*', cors(corsConfig))

const uri = `mongodb+srv://${process.env.dbuserName}:${process.env.dbPassWord}@cluster0.rczhy.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
    try {
        await client.connect();
        const LaptopStock = client.db('Star-Stock').collection('All-Laptops');
        // to get all products
        app.get('/laptops', async (req, res) => {
            const query = {};
            const cursor = LaptopStock.find(query);
            const laptops = await cursor.toArray();
            res.send(laptops);
        })
        // to get a single product
        app.get('/laptops/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const product = await LaptopStock.findOne(query);
            res.send(product);
        })

        // quantity increase and decrease
        app.put('/laptops/:id', async (req, res) => {
            const id = req.params.id;
            const newUpdatedQuantity = req.body;
            const filter = { _id: ObjectId(id) };
            const options = { upsert: true };
            const updatedQuantity = {
                $set: {
                    quantity: newUpdatedQuantity.addOrRemove
                }
            }
            const GivenQuantity = await LaptopStock.updateOne(filter, updatedQuantity, options);
            res.send(GivenQuantity);
        })

        // add a product
        app.post('/laptops', async (req, res) => {
            const newLaptop = req.body;
            const finalResult = await LaptopStock.insertOne(newLaptop);
            res.send(finalResult);
        })

        // delete a product
        app.delete('/laptops/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) }
            const result = await LaptopStock.deleteOne(query);
            res.send(result)
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