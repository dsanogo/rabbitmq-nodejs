const amqp = require('amqplib/callback_api');
amqp.connect('amqp://localhost:5672', (err, connection) => {
    if(err){
        console.log('Could not connect to the rabbit server');
        throw err;
    }
    console.log('Successfully connected to the rabbit server');

    connection.createChannel((err1, channel) => {
        if(err1){
            console.log('Failed to create channel');
            throw err1;
        }

        const exchange = 'logs';
        const exchangeType = 'fanout';
        channel.assertExchange(exchange, exchangeType, {durable: false});

        channel.assertQueue('', {exclusive: true}, (err2, queue) => {
            if(err2){
                console.log('Could not connect to the queue');
                throw err2;
            }
            
            console.log(` [*] Waiting for messages in ${queue.queue}. To exit press CTRL+C`);

            channel.bindQueue(queue.queue, exchange, '');

            channel.consume(queue.queue, message => {
                if(message.content){
                    console.log(` [x] Received ${message.content.toString()}`);
                }
            }, {
                noAck: true
            })
        });
    });
})