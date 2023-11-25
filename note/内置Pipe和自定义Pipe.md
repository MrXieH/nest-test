## Pipe 是在参数传给 handler 之前对参数做一些验证和转换的 class

内置的Pipe:

- ValidationPipe
- ParseIntPipe
- ParseBoolPipe
- ParseArrayPipe
- ParseUUIDPipe
- DefaultValuePipe
- ParseEnumPipe
- ParseFloatPipe
- ParseFilePipe

```typescript
@Controller()
export class AppController {
    constructor() {}
    
    @Get()
    getHello(@Query('aa', ParseIntPipe) aa: string): string { // 若aa不能被parseInt，则会报错
        return aa + 1
    }

    @Get()
    getHello(@Query('bb', new ParseIntPipe({  // 自定义报错内容
        exceptionFactory: msg => {
            console.log(msg)
            threw new HttpException('xxx ' + msg, HttpStatus.NOT_IMPLEMENTED)
        },
        errorHttpStatusCode: HttpStatus.NOT_FOUND
    })) bb: string): string {
        return bb + 1
    }
}
```

`class-validator` 包可以用装饰器和非装饰器两种方式对class属性做验证的库  
```typescript
import { validate } from 'class-validator'

class User extends BaseContent {
    @MinLength(10)
    @MaxLength(20)
    name: string;

    @Contains('hello')
    welcome: string;
}

let user = new User()

user.name = '1'
user.welcome = '123'

validate(user).then(errors => {
    // 数据校验
})
```

`class-transformer` 包可以把普通对象转为某个 class 的实例
```typescript
import { plainToInstance } from 'class-transformer'
const object = plainToInstance(class, instance)
```

## ValidationPipe
需安装以上两个包
```typescript
// 校验body中的数据
import { IsInt } from 'class-validator'

export class Ooo { // dto类
    name: string

    @Init()
    age: number // 此时若age传入浮点数将会报错
}

@Post('ooo')
ooo(@Body(new ValidationPipe()) obj: Ooo) {}
```

尝试自定义Pipe
```typescript
import { PipeTransform, Injectable, ArgumentMetadata, BadRequestException } from '@nestjs/common';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class MyValidationPipe implements PipeTransform<any> {
  @Inject('validation_options') // pipe可以注入依赖
  async transform(value: any, { metatype }: ArgumentMetadata) {
    if (!metatype) {
      return value;
    }
    const object = plainToInstance(metatype, value);
    const errors = await validate(object);
    if (errors.length > 0) {
      throw new BadRequestException('参数验证失败');
    }
    return value;
  }
}

@Post('000')
ooo(@Body(new MyValidationPipe()) obj: Ooo) {}
```

全局Pipe
```typescript
// 需要注入依赖
@Module({
    providers: [
        {
            provide: APP_PIPE,
            useClass: ValidationPipe
        }
    ]
})

// 无法注入依赖
app.useGlobalPipes(new ValidationPipe())
```