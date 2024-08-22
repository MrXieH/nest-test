import "reflect-metadata"
import { DataSource } from "typeorm"
import { User } from "./entity/User"

export const AppDataSource = new DataSource({
    type: "mysql",
    host: "120.79.98.192",
    port: 3306,
    username: "root",
    password: "123456",
    database: "practice",
    synchronize: true, // 根据实体自动创建表，若表已存在则不会创建
    logging: true,
    entities: [User], // 指定和数据库表对应的实体，也可以通过路径来指定
    migrations: [],
    subscribers: [], // 存放一些生命周期钩子函数
    connectorPackage: 'mysql2', // 驱动包
    poolSize: 10, // 连接池中最大连接数
    extra: {
        authPlugin: 'sha256_password'
    }
})
