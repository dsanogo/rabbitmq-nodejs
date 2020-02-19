const express = require('express');
const app = express();
const PORT = 3002;

const amqp = require('amqplib/callback_api');

amqp.connect('amqp://localhost:5672', (err, conn) => {
    if(err){
        console.log('Could not connect to the server');
        throw err;
    }

    console.log('Connected to the server');
    conn.createChannel((err1, channel) => {
        if(err1){
            console.log('Could not create channel');
            throw err1;
        }

        console.log('Created new channel');
        const queue = 'jobs';
        channel.assertQueue(queue, {
            durable: false
        });

        console.log(`Waiting for new Messages from \`${queue}\` channel`);
        channel.consume(queue, message => {
            console.log(`Received ${message.content.toString()}`);
        },{
            noAck: true
        })
    });
});

app.get('/', (req, res) => {
    res.send('Hello World!');
});

app.listen(PORT, () => {
    console.log('Example app listening on port PORT!');
});