const amqp = require('amqplib/callback_api');
amqp.connect('amqp://localhost:5672', (err, conn) => {
    if(err){
        console.log('Could not connect to the rabbit server');
        throw err;
    };
    console.log('Successfully connected to the rabbit server');
    conn.createChannel((err1, channel) => {
        if(err1){
            console.log('Could not create a channel');
            throw err1;
        }
        console.log('Successfully created a channel');
        const exchange = 'logs';
        const message = process.argv.slice(2).join(' ') || 'Exchange created successfully';
        const exchnageType = 'fanout';

        channel.assertExchange(exchange, exchnageType , {durable: false});

        channel.publish(exchange, '', Buffer.from(message));
        console.log(` [x] sent ${message}`);

        const interval = setInterval(() => {
            const newMsg = Math.random().toString(36).substring(7);

            channel.publish(exchange, '', Buffer.from(newMsg));
            console.log(` [x] sent ${newMsg}`);
        }, 5000);

        // clearInterval(interval); 
        // setTimeout(() => {
        //     channel.publish(exchange, '', Buffer.from("Now sending a new one"));
        //     console.log(` [x] sent ${message}`);
        // }, 5000);
    });

    setTimeout(() => {
        console.log('Finished publishing');
        conn.close();
        process.exit(0);
    }, 50000);
});