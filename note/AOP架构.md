## AOP （Aspect Oriented Programming）面向切面编程

AOP 的好处是可以把一些通用逻辑分离到切面中，保持业务逻辑的纯粹性，这样切面逻辑可以复用，还可以动态的增删。

Express 的中间件的洋葱模型也是一种 AOP 的实现。

在 Nest 中，AOP通过在 `controller` 前后插入一个通用执行逻辑的阶段来实现。

Nest 实现 AOP 一共有五种，包括 `Middleware`、`Guard`、`Pipe`、`Interceptor`、`ExceptionFilter`

## Middleware 中间件
```typescript
async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 全局中间件
  app.use(function(req: Request, res: Response, next: NextFunction) {
    console.log('before', req.url);
    next();
    console.log('after');
  })

  // app.useGlobalInterceptors(new TimeInterceptor())
  // app.useGlobalGuards(new LoginGuard())
  // app.useGlobalPipes(new ValidatePipe());
  // app.useGlobalFilters(new TestFilter());
  await app.listen(3000);
}
bootstrap();


/** controller */
@Controller()
export class AppController {
  constructor() {}

  @Get()
  aaa() {
    return 'aaa'
  }
}

/** 访问 /aaa log */
// before /aaa
// aaa
// after
```

使用 `nest cli` 可以生成 `middleware`  
```bash
nest g middleware log --no-spec --flat
```
```typescript
import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response } from 'express';

@Injectable()
export class LogMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: () => void) {
    console.log('before2', req.url);

    next();

    console.log('after2');
  }
}
```
在 `AppModule` 中使用
```typescript
import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { LogMiddleware } from './log.middleware';

@Module({
  imports: [],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule{

  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LogMiddleware).forRoutes('aaa*'); // 指定生效路由 forRoutes 
  }

}
```


## Guard 路由守卫
用于在调用某个 `Controller` 之前判断权限，返回 `true` 或者 `false` 来决定是否放行，若不放行就不会到达 `Controller` 层

使用 nest-cli 创建 Guard  
```bash
nest g guard login --no-spec --flat
```

```typescript
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Observable } from 'rxjs';

// 需要实现 canActivate 方法
@Injectable()
export class LoginGuard implements CanActivate {
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    console.log('login check') // 默认会返回403
    return false;
  }
}

// 在 Controller 中使用
@Get('aaa')
@UseGuards(LoginGuard)
aaa(): string {
    console.log('aaa...');
    return 'aaa';
}

// 全局使用
app.useGlobalGuards(new LoginGuard())

// 在 AppModule 中全局使用。 这样可以在 LoginGuard 中注入 AppService， 从而调用 AppService 服务
@Module({
    imports: [],
    controllers: [AppControllers],
    providers: [
        AppService,
        {
            provide: APP_GUARD,
            useClass: LoginGuard
        }
    ]
})
```

## Interceptor 拦截器
在调用 `Controller` 前后加入一些逻辑

创建一个 Interceptor
```bash
nest g interceptor time --no-spec --flat
```

```typescript
import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable, tap } from 'rxjs';

@Injectable()
export class TimeInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {

    //和 Middleware 的区别 主要是可以拿到调用的 controller 和 handler：
    console.log(context.getClass(), context.getHandler());

    const startTime = Date.now();

    // Nest 里通过 rxjs 来组织它们，所以可以使用 rxjs 的各种 operator
    return next.handle().pipe(
      tap(() => {
        console.log('time: ', Date.now() - startTime)
      })
    );
  }
}

// 在 Controller 中路由级别使用
@Get('bbb')
@UseInterceptors(TimeInterceptor)
bbb() {
    return 'bbb'
}

// Controller 级别使用
@Controller
@UseInterceptors(TimeInterceptor)
export class AppController{}

// 全局使用
app.useGlobalInterceptors(new TimeInterceptor())

// 全局 AppModule 使用
@Module({
    providers: [
        AppService,
        {
            provide: APP_INTERCEPTOR,
            useClass: TimeInterceptor
        }
    ]
})
```

## Pipe 管道

创建一个 `pipe`
```bash
nest g pipe validate --no-spec --flat
```
```typescript
import { ArgumentMetadata, BadRequestException, Injectable, PipeTransform } from '@nestjs/common';

// Pipe 要实现 PipeTransform 接口，实现 transform 方法。transform可以做校验或转换
@Injectable()
export class ValidatePipe implements PipeTransform {
  transform(value: any, metadata: ArgumentMetadata) {

    if(Number.isNaN(parseInt(value))) {
      throw new BadRequestException(`参数${metadata.data}只能是字符串或者数字`)
    }

    return typeof value === 'number' ? value * 10 : parseInt(value) * 10;
  }
}

// 针对某个参数使用
@Get('ccc')
ccc(@Query('num', ValidatePipe) num: number) {
    return num + 1;
}
// 访问 /ccc?num=2
// 返回 21 （2*10+1）

// 针对整个 Controller 使用
@Controller
@UsePipes(ValidatePipe)

// 全局使用
app.useGlobalPipes(new ValidatePipe())

// 全局AppModule
@Module({
    provides: [
        {
            provide: APP_PIPE,
            useClass: ValidatePipe
        }
    ]
})
```

`nest`内置了一些 pipe
- ValidationPipe
- ParseIntPipe
- ParseBoolPipe
- ParseArrayPipe
- ParseUUIDPipe
- DefaultValuePipe
- ParseEnumPipe
- ParseFloatPipe
- ParseFilePipe


## ExceptionFilter 异常过滤器
创建一个 `ExceptionFilter`
```bash
nest g filter test --no-spec --flat
```
```typescript
import { ArgumentsHost, BadRequestException, Catch, ExceptionFilter } from '@nestjs/common';
import { Response } from 'express';

// 实现 ExceptionFilter 接口，实现 catch 方法，就可以拦截异常了。
@Catch(BadRequestException)
export class TestFilter implements ExceptionFilter {
  catch(exception: BadRequestException, host: ArgumentsHost) {

    // 要拦截的异常通过@Catch装饰器声明，这里为 BadRequestException
    const response: Response = host.switchToHttp().getResponse();

    response.status(400).json({
      statusCode: 400,
      message: 'test: ' + exception.message
    })
  }
}

// 针对单个handler使用
@Get('ccc')
@UseFilters(TestFilter)
ccc(@Query('num', ValidatePipe) num: number) {
    return num + 1
}

// 访问异常
// 访问/ccc?num=aa
{
    "statusCode": 400,
    "message": "test: 参数num只能是字符串或者数字"
}

// 针对某个 controller
@Controller()
@UseFilters(TestFilter)
export class AppController{}

// 全局方式1
app.useGlobalFilters(new HttpExceptionFilter())

// 全局方式2
@Module({
    provides: [
        {
            provide: APP_FILTER,
            useClass: HttpExceptionFilter
        }
    ]
})
```

`nest`内置的一些`http`异常，都是 `HttpException `的子类

- BadRequestException
- UnauthorizedException
- NotFoundException
- ForbiddenException
- NotAcceptableException
- RequestTimeoutException
- ConflictException
- GoneException
- PayloadTooLargeException
- UnsupportedMediaTypeException
- UnprocessableException
- InternalServerErrorException
- NotImplementedException
- BadGatewayException
- ServiceUnavailableException
- GatewayTimeoutException
  
自己扩展http异常
```typescript
export class FxException extends HttpException {
    constructor() {
        super('Fx', HttpStatus.FRBIDDEN)
    }
}
```


## AOP的顺序
![AOP的顺序](./images/AOP.awebp)
