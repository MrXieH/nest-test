## useClass
```javascript
// 简写
@Module({
    imports: [],
    controllers: [AppController],
    providers: [AppService]
})

// 完整写法
@Module({
    imports: [],
    controllers: [AppController],
    providers: [{
        provide: AppService, // provide可以是字符串
        useClass: AppService
    }]
})

// 使用构造器自动注入
export class AppController {
    constructor(private readonly appService: AppService) {}

    @Get()
    getHello(): string {
        return this.appService.getHello()
    }
}

// 不使用构造器，手动注入，如果provide为字符串，则一定需要手动注入
export class AppController {
    @Inject(AppService)
    private readonly appService: AppService

    @Get()
    getHello(): string {
        return this.appService.getHello()
    }
}
```

## useValue
```javascript
@Module({
    imports: [],
    controllers: [AppController],
    providers: [{
        provide: 'AppService',
        useValue: : {
            name: 'AppServiceValue',
            value: 123
        }
    }]
})
```

## useFactory 动态创建
```javascript
@Module({
    imports: [],
    controllers: [AppController],
    providers: [{
        provide: 'AppService',
        useFactory() { // useFactory支持异步
            return {
                name: 'AppServiceValue',
                value: 123
            }
        }
    }]
})
```

## useExisting 指定provide别名
```javascript
@Module({
    imports: [],
    controllers: [AppController],
    providers: [{
        provide: 'AppService',
        useExisting: 'AppServiceName'
    }]
})
```