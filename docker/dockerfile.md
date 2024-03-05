## 使用 alpine 的镜像 减少镜像构建后体积

## 多阶段构建
```dockerfile
FROM node:18

WORKDIR /app

COPY package.json . //分阶段缓存，若package.json不变则不会运行 npm install

COPY *.lock .

RUN npm config set registry https://registry.npmmirror.com/

RUN npm install

COPY . .

RUN npm run build

EXPOSE 3000

CMD [ "node", "./dist/main.js" ]

```

## 分阶段构建
如发布到生产时只需要dist目录中的产物，加上生产所需的依赖
```dockerfile
FROM node:18-alpine3.14 as build-stage

WORKDIR /app

COPY package.json .

RUN npm config set registry https://registry.npmmirror.com/

RUN npm install

COPY . .

RUN npm run build

# production stage
FROM node:18-alpine3.14 as production-stage

COPY --from=build-stage /app/dist /app // 从 build-stage 复制打包好的dist文件
COPY --from=build-stage /app/package.json /app/package.json

WORKDIR /app

RUN npm config set registry https://registry.npmmirror.com/

RUN npm install --production // 制定只安装 dependencies 的依赖

EXPOSE 3000

CMD ["node", "/app/main.js"]

```

docker build之后只会留下最后一个阶段的镜像，也就是上述代码中的production-stage


## 参数构建
```dockerfile
FROM node:18-alpine3.14

// ARG 申明参数
ARG aaa
ARG bbb

WORKDIR /app

COPY ./test.js .

// ENV 设置环境变量
ENV aaa=${aaa} \
    bbb=${bbb}

// 此时test.js就能拿到变量
CMD ["node", "/app/test.js"]
```
```bash
# 构建镜像时传入参数
docker build --build-arg aaa=3 --build-arg bbb=4 -t arg-test -f 333.Dockerfile .
```

## CMD与ENTRYPOINT
CMD 可以被 docker run 之后的命令行参数替换
```dockerfile
FROM node:18-alpine3.14

CMD ["echo", "hello"]
```

```bash
docker run arg-test echo "world"
# 输出 world, CMD的命令被替换了
```
ENTRYPOINT 不会被 docker run 之后的命令行参数替换
```dockerfile
FROM node:18-alpine3.14
ENTRYPOINT ["echo", "hello"]
```

```bash
docker run arg-test echo "world"
# 输出 hello echo world, ENTRYPOINT的命令不会被替换
```

两者可以配合使用
```dockerfile
FROM node:18-alpine3.14

ENTRYPOINT ["echo", "hello"]

CMD ["world"]
```
```bash
docker run arg-test
# 输出 hello world

docker run arg-test echo "x"
# 输出 hello x，CMD部分被替换，可以当做默认参数使用
```

## COPY与ADD
ADD会把tar.gz文件解压到容器内
COPY会把整个tar.gz复制到容器内而不会进行解压