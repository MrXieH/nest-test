```shell
npm install --save winston
npm install --save winston-daily-rotate-file
```
```typescript
import winston from 'winston';
import 'winston-daily-rotate-file';

const logger = winston.createLogger({
    // {
    //     error: 0, 
    //     warn: 1,
    //     info: 2,
    //     http: 3,
    //     verbose: 4,
    //     debug: 5,
    //     silly: 6
    // }
    level: 'debug', // level：打印的日志级别，此处为debug，则debug之前登记的日志都会输出
    format: winston.format.simple(), // 日志格式 simple、json等
    transports: [ // 日志的传输方式
        new winston.transports.Console(), // log
        new winston.transports.File({ // 文件存储
            dirname: 'log', filename: 'test.log', maxsize: 1024
        }),
        new winston.transports.DailyRotateFile({ // 按日期分组
            level: 'info',
            dirname: 'log2',
            filename: 'test-%DATE%.log',
            datePattern: 'YYYY-MM-DD-HH-mm',
            maxSize: '1k'
        }),
        new winston.transports.Http({ // 调用接口（用于日志转发等场景）
            host: 'localhost',
            port: '3000',
            path: '/log'
        })
    ]
});

logger.info('光光光光光光光光光');
logger.error('东东东东东东东东');
logger.debug(66666666);

```

动态添加 transports
```typescript
const console = new winston.transports.Console();
const file = new winston.transports.File({ filename: 'test.log' });

const logger = winston.createLogger({
    level: 'debug',
    format: winston.format.simple()
});

logger.clear();
logger.add(console);
logger.remove(console);
logger.add(file);
```

