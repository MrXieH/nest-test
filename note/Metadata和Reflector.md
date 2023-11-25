## Metadata 和 Reflect

Nest 的 `Reflect` 与 es6 的 `Reflect` 不同，因为nest的api还没进入标准

```typescript
// 无法像es6中一样使用
// nest中使用如下

Reflect.defineMetadata(metadataKey, metadataValue, target); // 为target设置元数据

Reflect.defineMetadata(metadataKey, metadataValue, target, propertyKey);  // 为target中的属性设置元数据


let result = Reflect.getMetadata(metadataKey, target);  // 获取target的元数据

let result = Reflect.getMetadata(metadataKey, target, propertyKey); // 获取target属性的元数据
```

元数据存在类或者对象，用类似 [[metadata]] 的 key 来存储

```typescript
// 使用装饰器来设置 metadata

function Type(type) {
    return Reflect.metadata("design:type", type);
}
function ParamTypes(...types) {
    return Reflect.metadata("design:paramtypes", types);
}
function ReturnType(type) {
    return Reflect.metadata("design:returntype", type);
}

@ParamTypes(String, Number)
class Guang {
  constructor(text, i) {
  }

  @Type(String)
  get name() { return "text"; }

  @Type(Function)
  @ParamTypes(Number, Number)
  @ReturnType(Number)
  add(x, y) {
    return x + y;
  }
}

// 获取源数据
let obj = new Guang("a", 1);
Reflect.getMetadata("design:paramtypes", obj, "add");  // [Number, Number]
```

Nest 的实现原理就是通过`装饰器`给 `class` 或者`对象`添加`元数据`，然后初始化的时候取出这些元数据，进行`依赖的分析`，然后创建对应的实例对象就可以了。如 `@Module`、`@Controller` 和 `@Injectable`

**typescript开启 `emitDecoratorMetadata` 时会自动添加一些类型相关的元数据，然后运行的时候通过这些元数据来实现依赖的扫描，对象的创建等等功能。**

- 配合 guard 和 interceptor 使用
```typescript
// controller
@Controller()
export class AppController {
    @Get()
    @UseInterceptor(AaaInterceptor)
    @UseGuards(AaaGuard)
    @SetMetadata('roles', ['admin'])
    getHello() {}
}


// guard
@Injectable()
export class AaaGuard implements CanActivate {
    constructor(private reflector: Reflector) {}

    canActivate(
        context: ExecutionContext
    ): boolean {
        console.log(this.reflector.get('roles', context.getHandler()))
    }
}

// interceptor
@Injectable()
export class AaaInterceptor implements NestInterceptor {
  @Inject(Reflector)
  private reflector: Reflector;

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    console.log('interceptor');

    console.log(this.reflector.get('roles', context.getHandler()))  // get metadata
    console.log(this.reflector.get('roles', context.getClass()))

    console.log('getAll', this.reflector.getAll('roles', [context.getHandler(), context.getClass()])); // 返回一个数组
    console.log('getAllAndMerge', this.reflector.getAllAndMerge('roles', [context.getHandler(), context.getClass()])); // 返回数据合并成一个对象
    console.log('getAllAndOverride', this.reflector.getAllAndOverride('roles', [context.getHandler(), context.getClass()])); // 返回第一个非空数据

    return next.handle();
  }
}
```
