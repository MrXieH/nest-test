## transports
可以通过很多种方式将日志信息输出到不同的地方。例如mongodb、文件、控制台等。

```shell
npm install --save winston
npm install --save winston-daily-rotate-file // 按照日期切割储存日志
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

# 项目集成winston
## 集成前
```typescript
// MyLogger.ts
import { LoggerService, LogLevel } from '@nestjs/common';

export class MyLogger implements LoggerService {
    log(message: string, context: string) {
        console.log(`---log---[${context}]---`, message)
    }

    error(message: string, context: string) {
        console.log(`---error---[${context}]---`, message)
    }

    warn(message: string, context: string) {
        console.log(`---warn---[${context}]---`, message)
    }
}

// main.ts
function bootstrap() {
    const app = await NestFactory.create(AppModule);
    app.useLogger(app.get(MyLogger));
    await app.listen(3000);
}
bootstrap();

// app.controller.ts
import { Logger } from '@nestjs/common'
@Controller()
export class AppController {
    private logger = new Logger()
    @Get()
    hello() {
        this.logger.log('hello world')
    }
}
```

## 集成后
```typescript
// MyLogger.ts
import { ConsoleLogger, LoggerService, LogLevel } from '@nestjs/common';
import * as chalk from 'chalk'; // 打印颜色
import * as dayjs from 'dayjs';
import { createLogger, format, Logger, transports } from 'winston';

export class MyLogger implements LoggerService {

    private logger: Logger;

    constructor() {
        super();
    
        this.logger = createLogger({
            level: 'debug',
            transports: [
                new transports.Console({
                    format: format.combine(
                        format.colorize(),
                        format.printf(({context, level, message, time}) => { // 自定义日志格式
                            const appStr = chalk.green(`[NEST]`);
                            const contextStr = chalk.yellow(`[${context}]`);
        
                            return `${appStr} ${time} ${level} ${contextStr} ${message} `;
                        })
                    ),
                })
            ]
        });
    }

    log(message: string, context: string) {
        const time = dayjs(Date.now()).format('YYYY-MM-DD HH:mm:ss');

        this.logger.log('info', message, { context, time });
    }

    error(message: string, context: string) {
        const time = dayjs(Date.now()).format('YYYY-MM-DD HH:mm:ss');

        this.logger.log('info', message, { context, time });
    }

    warn(message: string, context: string) {
        const time = dayjs(Date.now()).format('YYYY-MM-DD HH:mm:ss');

        this.logger.log('info', message, { context, time });
    }
}


```

## 可以将logger封装成一个module，在appModule引入，就不用每次都new了。