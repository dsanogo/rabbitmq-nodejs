const amqp = require('amqplib/callback_api');

const args = process.argv.slice(2);

if (args.length == 0) {
  console.log("Usage: receive_logs_direct.js [info] [warning] [error]");
  process.exit(1);
}

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

        const exchange = 'direct_logs';
        const exchangeType = 'direct';

        channel.assertExchange(exchange, exchangeType, {durable: false});

        channel.assertQueue('', {exclusive: true}, (err2, queue) => {
            if(err2){
                console.log('Could not connect to the queue');
                throw err2;
            }
            
            console.log(` [*] Waiting for messages in ${queue.queue}. To exit press CTRL+C`);


            args.forEach( severity => {
                channel.bindQueue(queue.queue, exchange, severity);    
            })

            channel.consume(queue.queue, message => {
                console.log(` [x] Received ${message.content.toString()} with severity ${message.fields.routingKey}`);
            }, {
                noAck: true
            })
        });
    });
})