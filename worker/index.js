const keys = require('./keys');
const redis = require('redis');

const redisClient = redis.createClient( {
    host: keys.redisHost,
    port: keys.redisPort,
    retry_strategy: () => 1000
});
const subcriptionToRedis = redisClient.duplicate();

function fib(index) {
    if (index <=0) return 0;
    if (index < 3) return 1;
    var result = 0;
    var resultAnt1 = 1;
    var resultAnt2 = 1;
    for (i=2; i<index; i++) {
        result = resultAnt2 + resultAnt1;
        resultAnt2 = resultAnt1;
        resultAnt1 = result;
    }
    return result;
}


subcriptionToRedis.on ('message', (channel, message) => {
    //hash con indice message y le metemos el fib
    redisClient.hset('values', message, fib(parseInt(message)));
});

subcriptionToRedis.subscribe('insert');