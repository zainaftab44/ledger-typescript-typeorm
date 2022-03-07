import { TypeOrmModuleOptions } from "@nestjs/typeorm";
// import { User } from '../repositories/User.entity';

export const typeORMConfig: TypeOrmModuleOptions = {
    type: "postgres",
    host: process.env.POSTGRES_HOST,
    port: parseInt(<string>process.env.POSTGRES_PORT),
    username: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
    database: process.env.POSTGRES_DATABASE,
    // entities: [User],
    entities: ['./**/*.entity.ts'],
    autoLoadEntities: true
}