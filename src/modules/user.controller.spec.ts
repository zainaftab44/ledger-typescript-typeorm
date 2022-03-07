import { Test } from '@nestjs/testing';
import { User } from '../repositories/User.entity';
import { INestApplication } from '@nestjs/common';
import { Repository } from 'typeorm';
import * as request from 'supertest';
import { UserModule } from './user.module';
import { TypeOrmModule } from '@nestjs/typeorm';

describe('UserController', () => {
    let app: INestApplication;
    let repository: Repository<User>;

    beforeAll(async () => {

        const module = await Test.createTestingModule({
            imports: [
                UserModule,
                TypeOrmModule.forRoot({
                    type: "postgres",
                    host: '127.0.0.1',
                    port: 5432,
                    username: 'root',
                    password: 'root',
                    database: 'test',
                    autoLoadEntities: true
                })
            ]

        }).compile();

        app = module.createNestApplication();
        await app.init();

        repository = module.get('UserRepository');
    });
    beforeEach(async () => {
        await repository.query(`DELETE FROM public.user;`);
    })

    afterAll(async () => {
        await app.close();
    });

    describe('POST /user', () => {
        it('should successfully create user"', async () => {
            const { body } = await request.agent(app.getHttpServer())
                .post('/user')
                .send({ name: "zain", balance: 100 })
            expect(body).toEqual({
                id: expect.any(Number),
                name: "zain",
                balance: 100,
            });
        });

        it('should create user when no balance sent"', async () => {
            const { body } = await request.agent(app.getHttpServer())
                .post('/user')
                .send({ name: "jack" })
            expect(body).toEqual({
                id: expect.any(Number),
                name: "jack",
                balance: 0,
            });
        });

    });

    describe('update balance', () => {
        it('should deposit balance to user account"', async () => {
            await request.agent(app.getHttpServer())
                .post('/user')
                .send({ name: "zain", balance: 900 })
            const { body } = await request.agent(app.getHttpServer())
                .post('/user/deposit')
                .send({ name: "zain", amount: 100 })
            expect(body).toEqual({
                id: expect.any(Number),
                name: "zain",
                balance: 1000,
            })
        });

        it('should withdraw balance from user account"', async () => {
            await request.agent(app.getHttpServer())
                .post('/user')
                .send({ name: "zain", balance: 900 })
            const { body } = await request.agent(app.getHttpServer())
                .post('/user/withdraw')
                .send({ name: "zain", amount: 100 })
            expect(body).toEqual({
                id: expect.any(Number),
                name: "zain",
                balance: 800,
            })
        });
    });


    describe('transfer amount', () => {
        it('users are able to transfer balance"', async () => {
            await request.agent(app.getHttpServer())
                .post('/user')
                .send({ name: "zain", balance: 1000 })
            await request.agent(app.getHttpServer())
                .post('/user')
                .send({ name: "jack", balance: 1000 })
            const { body } = await request.agent(app.getHttpServer())
                .post('/user/transfer')
                .send({ senderName: "zain", receiverName: "jack", amount: 400 })
            expect(body).toEqual({
                message: 'Transfer successful'
            })
        });

        it('failed transaction insufficient balance"', async () => {
            await request.agent(app.getHttpServer())
                .post('/user')
                .send({ name: "zain", balance: 1000 })
            await request.agent(app.getHttpServer())
                .post('/user')
                .send({ name: "jack", balance: 1000 })
            const { body } = await request.agent(app.getHttpServer())
                .post('/user/transfer')
                .send({ senderName: "zain", receiverName: "jack", amount: 4000 })
            expect(body).toEqual({
                message: "Insufficient balance to perform transaction"
            })
        });
    });
});
