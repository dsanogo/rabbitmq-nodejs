const amqp = require('amqplib/callback_api');

const severities = ['info', 'warning', 'error'];

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
        const exchange = 'direct_logs';
        const exchangeType = 'direct';

        const args = process.argv.slice(2);
        const message = args.slice(1).join(' ') || 'Direct exchage created';        
        const severity = (args.length > 0) ? args[0] : severities[0];
        
        
        channel.assertExchange(exchange, exchangeType , {durable: false});

        channel.publish(exchange, severity , Buffer.from(message));
        console.log(` [x] sent ${message}`);

        const interval = setInterval(() => {
            const newMsg = Math.random().toString(36).substring(7);
            const newSevr = severities[Math.floor(Math.random() * severities.length)];
            channel.publish(exchange, newSevr, Buffer.from(newMsg));
            console.log(` [x] sent ${newMsg}`);
        }, 5000);
    });

    setTimeout(() => {
        console.log('Finished publishing');
        conn.close();
        process.exit(0);
    }, 50000);
});