const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5002;


const { MongoClient, ServerApiVersion } = require('mongodb');
require('dotenv').config();

//middlewares
app.use(cors({
    origin: [
        'http://localhost:5173', 'https://arbor-food-and-cafe.web.app', 'http://localhost:3000'
    ],
    credentials: true
}));
app.use(express.json());





//mongoDb connect

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.lb6xnzu.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});



async function run() {
    try {
        await client.connect();
        // await client.db("admin").command({ ping: 1 });
        console.log("MongoDB connected");

        const menuCollection = await client.db('arborCafe').collection('menu');
        const bookingDataCollection = await client.db('arborCafe').collection('bookingData');
        const messageCollection = await client.db('arborCafe').collection('message');
        app.get('/menu', async (req, res) => {
            try {
                const result = await menuCollection.find().toArray(); //Fetch all documents

                console.log("Fetched menu result:", result); // Debug log

                if (result.length === 0) {
                    return res.status(404).send({ error: 'No menu found' });
                }

                res.send(result[0]); //Send the first document
            } catch (err) {
                console.error(err);
                res.status(500).send({ error: 'Failed to fetch menu' });
            }
        });
        app.get('/message', async (req, res) => {
            try {
                const result = await messageCollection.find().toArray();
                console.log("Fetched messages:", result);
                if (result.length === 0) {
                    return res.status(404).send({ error: 'No messages found' });
                }
                res.send(result);
            } catch (error) {
                console.error('Error fetching messages:', error);
                res.status(500).send({ error: 'Failed to fetch messages' });
            }
        })
        app.get('/booingData', async (req, res) => {
            try {
                const result = await bookingDataCollection.find().toArray();
                console.log('Fetched data:', result);
                if (result === 0) {
                    return res.status(404).send({ error: 'No booking data found' });
                }
                res.send(result)

            } catch (error) {
                console.error('Error in fetching data: ', error);
                res.status(500).send({ error: 'Failed to fetched the booking data' });

            }
        })

        app.post('/message', async (req, res) => {
            console.log(" Received POST /message request");
            console.log("Request body:", req.body);

            const newMessage = req.body;

            // Add validation
            if (!newMessage.name || !newMessage.email || !newMessage.message) {
                console.log("Validation failed - missing fields");
                return res.status(400).send({ error: 'Missing required fields' });
            }

            try {
                const result = await messageCollection.insertOne(newMessage);
                console.log("Insert result:", result);
                res.status(201).send(result);
            } catch (error) {
                console.error('Error inserting contact data:', error);
                res.status(500).send({
                    error: 'Failed to insert contact data',
                    details: error.message
                });
            }
        });



        app.post('/book-your-table', async (req, res) => {

            const bookingData = req.body;
            if (!bookingData.name || !bookingData.email || !bookingData.phone || !bookingData.people || !bookingData.date || !bookingData.time) {
                return res.status(400).send({ error: 'Missing required fields' });

            }
            try {
                const result = await bookingDataCollection.insertOne(bookingData);
                res.status(201).send(result);
            } catch (error) {
                console.error('Error in inserting booking data:', error);
                res.status(500).send({
                    error: 'Failed to insert booking data',
                    details: error.message
                })
            }

        })






    } catch (err) {
        console.error('MongoDB connection failed:', err);
    }
}

run().catch(console.dir);







app.get('/', (req, res) => {
    res.send('Arbor food and cafe is running');
})

app.listen(port, () => {
    console.log(`Arbor food and cafe is running on port: ${port}`);
})