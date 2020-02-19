const express = require('express');
const app = express();
const PORT = 3000;

const amqp = require('amqplib/callback_api');

amqp.connect('amqp://localhost:5672', (err, connection) => {
    if (err) {
        console.log('Could not connect to the server');
        throw err;
    }

    console.log('Successfully connected to the server');
    connection.createChannel((err1, channel) => {
        if(err1){
            console.log('Could not create a channel');
            throw err1;
        }

        console.log('Successfully created channel');
        const queue = 'jobs';
        const message = {
            id: 2,
            message: "Hello world"
        };

        channel.assertQueue(queue, {
            durable: false
        });

        channel.sendToQueue(queue, Buffer.from(JSON.stringify(message)));

        console.log('Hey Sent job');
    });
    
    setTimeout(() => {
        console.log('Closing connection');
        connection.close();
        process.exit(0);
    }, 10000);
});

app.get('/', (req, res) => {
    res.send('Hello World!');
});

app.listen(PORT, () => {
    console.log(`Publisher running on ${PORT}`);
});

//Run app, then load http://localhost:port in a browser to see the output.