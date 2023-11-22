# IoC(Inversion of Control)
主要通过`依赖注入（Dependency Injection）`、`依赖查找（Dependency Lookup）`来实现

主要的目的是减低计算机代码之间的耦合度，管理对象依赖关系错综复杂的痛点问题。

从主动创建依赖（需要人为整理依赖，增加了代码的耦合性）到被动等待依赖注入，这就是 Inverse of Control，反转控制。

在nest中
```typescript
// @Injectable() 代表这个 class 可注入，也可以被注入
@Injectable()
export class AppService{
    getList() {}
}


//  @Controller，代表这个 class 可以被注入
@Controller()
export class AppController{
    constructor(private readonly appService: AppService) {} // 构造器注入

    @Get()
    getList() {
        return this.AppService.getList()
    }
}

@Controller()
export class AppController{
    constructor() {}

    @Inject(AppService) // 属性注入
    
    @Get()
    getList() {
        return this.AppService.getList()
    }
}
```
通过`@Module` 声明模块，其中 `controllers` 是控制器，只能被注入。  
`providers` 里可以被注入，也可以注入别的对象，`imports`中可以引入别的模块。
```typescript
@Module({
    imports: [],
    controllers: [AppController],
    provides: [AppService]
})
export class AppModule {}
```