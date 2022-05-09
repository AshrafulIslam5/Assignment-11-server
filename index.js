const express = require('express');
const jwt = require('jsonwebtoken');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();
const port = process.env.PORT || 5000;
const cors = require('cors');
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

function verifyToken(req, res, next) {
    const headerToken = req.headers.authorization;
    if (!headerToken) {
        return res.status(401).send({ message: 'unauthorized access' })
    }
    const recievedToken = headerToken.split(' ')[1];
    jwt.verify(recievedToken, process.env.Token_Secret, function (err, decoded) {
        if (err) {
            return res.status(403).send({ message: 'forbidden' })
        }
        console.log(decoded)
        req.decoded = decoded;
        next();
    })
}

const uri = `mongodb+srv://${process.env.dbuserName}:${process.env.dbPassWord}@cluster0.rczhy.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
    try {
        await client.connect();
        const LaptopStock = client.db('Star-Stock').collection('All-Laptops');
        const addedItems = client.db('Star-Stock').collection('Added-Laptops')

        // JWT
        app.post('/getToken', async (req, res) => {
            const adder = req.body;
            const accessToken = jwt.sign(adder, process.env.Token_Secret, { expiresIn: '1d' });
            res.send({ accessToken });
        })


        // to get all products
        app.get('/laptops', async (req, res) => {
            const query = {};
            const cursor = LaptopStock.find(query);
            const laptops = await cursor.toArray();
            res.send(laptops);
        })

        // addedProducts collection
        app.post('/myItems', async (req, res) => {
            const newItem = req.body;
            const result = await addedItems.insertOne(newItem);
            res.send(result);
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

        // for my items
        app.get('/myItems', verifyToken, async (req, res) => {
            
            const decodedEmail = req.decoded.email;
            const email = req.query.email;
            if (email === decodedEmail) {
                const query = { email: email };
                const cursor = addedItems.find(query);
                const myItems = await cursor.toArray();
                res.send(myItems);
            }
            else {
                res.status(403).send({ message: 'Forbidden' })
            }
        })
        // 
        app.get('/myItmes/:id', verifyToken, async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const product = await addedItems.findOne(query);
            res.send(product);
        })

        // delete a product
        app.delete('/laptops/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) }
            const result = await LaptopStock.deleteOne(query);
            res.send(result)
        });
        // delete from my items
        app.delete('/myItems/:id',verifyToken, async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) }
            const result = await addedItems.deleteOne(query);
            
            res.send(result);
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