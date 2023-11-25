```typescript
// 定义
import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response } from 'express';

@Injectable()
export class AaaMiddleware implements NestMiddleware {
    @Inject(AppService) // class的写法可以使用依赖注入
    use(req: Request, res: Response, next: () => void) {
        console.log('brefore');
        next(); // next 调用下一个 middleware
        console.log('after');
    }
}
```
