RxJS 是一个组织异步逻辑的库，它有很多 operator，可以极大的简化异步逻辑的编写。

## Nest 的 Interceptor 支持使用 RxJS

可以用它来处理数据源并传递给接收者，数据源为 Observable

```typescript
import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable, tap } from 'rxjs';


// 定义接口耗时统计拦截器
@Injectable()
export class AaaInterceptor implements NestInterceptor {
  constructor(private appService: AppService) {}  // 路由级别的`interceptor`可以注入依赖，而全局需要通过 APP_INTERCEPTOR 才可注入依赖， app.useGlobalInterceptors 则不行

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const now = Date.now();
    return next
      .handle()
      .pipe(
        tap(() => console.log(`After... ${Date.now() - now}ms`)),
      );
  }
}

// 在handle中使用
@Controller()
export class AppController {
    @Get()
    @UseInterceptor(AaaInterceptor)
    getHello() {}
}
```

在 Nest 中，常用的 RxJS operator

- map，用来对 controller 返回的数据进行修改
```typescript
import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { map, Observable } from 'rxjs';

@Injectable()
export class MapTestInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(map(data => {
      return {
        code: 200,
        message: 'success',
        data
      }
    }))
  }
}

```

- tab，通常用来添加一些日志、缓存等逻辑
```typescript
import { AppService } from './app.service';
import { CallHandler, ExecutionContext, Injectable, Logger, NestInterceptor } from '@nestjs/common';
import { Observable, tap } from 'rxjs';

@Injectable()
export class TapTestInterceptor implements NestInterceptor {
  constructor(private appService: AppService) {}

  private readonly logger = new Logger(TapTestInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(tap((data) => {
      
      // 这里是更新缓存的操作，这里模拟下
      this.appService.getHello();

      this.logger.log(`log something`, data);
    }))
  }
}
```

- catchError，拦截抛出的异常进行修改
```typescript
import { CallHandler, ExecutionContext, Injectable, Logger, NestInterceptor } from '@nestjs/common';
import { catchError, Observable, throwError } from 'rxjs';

@Injectable()
export class CatchErrorTestInterceptor implements NestInterceptor {
  private readonly logger = new Logger(CatchErrorTestInterceptor.name)

  intercept (context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(catchError(err => {
      this.logger.error(err.message, err.stack)
      return throwError(() => err)
    }))
  }
}
```

- timeout，接口长时间没返回，给用户一个超时响应
```typescript
import { CallHandler, ExecutionContext, Injectable, NestInterceptor, RequestTimeoutException } from '@nestjs/common';
import { catchError, Observable, throwError, timeout, TimeoutError } from 'rxjs';

@Injectable()
export class TimeoutInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      timeout(3000), // 超过3秒没收到消息会抛出 TimeoutError
      catchError(err => { // 在下方捕获并处理
        if(err instanceof TimeoutError) {
          console.log(err);
          return throwError(() => new RequestTimeoutException());
        }
        return throwError(() => err);
      })
    )
  }
}
```