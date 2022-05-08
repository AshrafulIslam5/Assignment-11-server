const express = require('express');
const jwt = require('jsonwebtoken');
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

function verifyToken(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).send({ messgae: 'unauthorized access' })
    }
    const verifingToken = authHeader.split(' ')[1];
    jwt.verify(verifingToken, process.env.Token_Secret, (error, decoded) => {
        if (error) {
            return res.status(403).send({ messgae: 'Forbidden access' })
        }
        req.decoded = decoded;
    })
    next();
}



const uri = `mongodb+srv://${process.env.dbuserName}:${process.env.dbPassWord}@cluster0.rczhy.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
    try {
        await client.connect();
        const LaptopStock = client.db('Star-Stock').collection('All-Laptops');
        const addedItems = client.db('Star-Stock').collection('Added-Laptops')

        // to get all products
        app.get('/laptops', async (req, res) => {
            const query = {};
            const cursor = LaptopStock.find(query);
            const laptops = await cursor.toArray();
            res.send(laptops);
        })


        //

        // json Web Token
        app.post('/token', async (req, res) => {
            const user = req.body;
            console.log(process.env.Token_Secret)
            const token = jwt.sign(user, process.env.Token_Secret, {
                expiresIn: '1d'
            });
            res.send({ token });
            console.log(token)
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
            const query = req.query.email;
            if (query === decodedEmail) {
                const email = { email: query };
                const cursor = addedItems.find(email);
                const myItems = await cursor.toArray();
                res.send(myItems);
            }
            else {
                return res.status(403).send({ messgae: 'Forbidden access' })
            }
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