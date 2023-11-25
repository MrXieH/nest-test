## Dynamic Module
动态生成模块

```typescript
import { DynamicModule, Module } from '@nestjs/common';
import { BbbService } from './bbb.service';
import { BbbController } from './bbb.controller';

@Module({})
export class BbbModule {
  static register(options: Record<string, any>): DynamicModule {
    return {
      module: BbbModule, // 多了一个 module 属性
      controllers: [BbbController],
      providers: [
        {
          provide: 'CONFIG_OPTIONS',
          useValue: options,
        },
        BbbService,
      ],
      exports: []
    };
  }
}

// 应用
@Module({
    imports: [BbbModule.register({})]
})

```
一般约定 `register`、`forRoot` 或 `forFeature`函数
- register：用一次模块传一次配置，比如这次调用是 BbbModule.register({aaa:1})，下一次就是 BbbModule.register({aaa:2}) 了
- forRoot：配置一次模块用多次，比如 XxxModule.forRoot({}) 一次，之后就一直用这个 Module，一般在 AppModule 里 import
- forFeature：用了 forRoot 固定了整体模块，用于局部的时候，可能需要再传一些配置，比如用 forRoot 指定了数据库链接信息，再用 forFeature 指定某个模块访问哪个数据库和表


## 使用 `ConfigurableModuleBuilder` 创建动态模块

```typescript
import { ConfigurableModuleBuilder } from "@nestjs/common";

export interface CccModuleOptions {
    aaa: number;
    bbb: string;
}

// 会自动帮我们创建 register、registerAsync 等函数
export const { ConfigurableModuleClass, MODULE_OPTIONS_TOKEN, OPTIONS_TYPE, ASYNC_OPTIONS_TYPE } = new ConfigurableModuleBuilder<CccModuleOptions>().build();


// 使用
@Controller('ccc')
export class CccController {
    @Inject(MODULE_OPTIONS_TOKEN)
    private options: typeof ASYNC_OPTIONS_TYPE;
}

@Module({
    controllers: [CccController]
})
export class CccModule extends ConfigurableModuleClass{}

@Module({
    imports: [
        CccModule.register({})
    ]
})
```

两种方式都可以