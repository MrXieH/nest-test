```bash
nest g filter hello --flat --no-spec
```

```typescript
import { ArgumentsHost, BadRequestException, Catch, ExceptionFilter } from '@nestjs/common';

@Catch(BadRequestException) // 要捕获的异常
export class HelloFilter implements ExceptionFilter {
  catch(exception: BadRequestException, host: ArgumentsHost) {
    debugger;
    const http = host.switchToHttp();
    const response = http.getResponse<Response>();

    const statusCode = exception.getStatus();

    response.status(statusCode).json({   // 自定义响应
       code: statusCode,
       message: exception.message,
       error: 'Bad Request',
       xxx: 111
    })
  }
}

// main.ts
app.useGlobalFilters(new HelloFilter());
```

```typescript
// 拦截所有 HttpException 异常
import { ArgumentsHost, BadRequestException, Catch, ExceptionFilter, HttpException } from '@nestjs/common';
import { Response } from 'express';

@Catch(HttpException)
export class HelloFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const http = host.switchToHttp();
    const response = http.getResponse<Response>();

    const statusCode = exception.getStatus();

    const res = exception.getResponse() as { message: string[] };
    
    response.status(statusCode).json({
       code: statusCode,
       message: res?.message?.join ? res?.message?.join(',') : exception.message,   // 若使用了 Pipe 进行验证，则取Pipe中报错的信息
       error: 'Bad Request',
       xxx: 111
    })
  }
}
```

引用 filter
```typescript
// APP_FILTER 全局引用 支持注入依赖
@Module({
    provides: [
        {
            provide: APP_FILTER,
            useClass: HelloFilter
        }
    ]
})

// 全局引用，不支持注入依赖
// main.ts
app.useGlobalFilters(new HelloFilter());

// 在handler或controller上引用
@UseFilters(HelloFilter)
```
