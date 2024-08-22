import "reflect-metadata"
import { DataSource } from "typeorm"
const path = require('path')

export const AppDataSource = new DataSource({
    type: "mysql",
    host: "120.79.98.192",
    port: 3306,
    username: "root",
    password: "123456",
    database: "typeorm_test",
    synchronize: true,
    logging: true,
    entities: [path.join(__dirname, "./entity/*{.ts,.js}")],
    migrations: [],
    subscribers: [],
    poolSize: 10,
    connectorPackage: 'mysql2',
    extra: {
        authPlugin: 'sha256_password',
    }
})
