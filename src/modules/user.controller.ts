import { BadRequestException, Body, ConflictException, Controller, Get, HttpStatus, Param, Post } from '@nestjs/common';
import { UserService } from './user.service';
import { User } from '../repositories/User.entity';
import { userdto } from '../dto/userdto';

@Controller('user/')
export class UserController {
    constructor(private readonly userService: UserService) { }

    @Get('balance/:name')
    async getBalance(@Body() Body, @Param('name') name: string): Promise<Object> {
        let balance: number = await this.userService.getBalance(name);
        return { 'balance': balance }
    }

    @Post()
    createUser(@Body() body: userdto): Promise<User> {
        if (body.name !== undefined) {
            return this.userService.createUser(body.name, body.balance);
        } else
            throw new BadRequestException();
    }

    @Post("deposit")
    async deposit(@Body() body): Promise<User> {
        let user: User = await this.userService.getUser(body.name)
        let amount: number = parseInt(body.amount)
        if (amount > 0)
            return await this.userService.updateBalance(user, amount);
        else
            throw new BadRequestException();
    }

    @Post("withdraw")
    async withdraw(@Body() body): Promise<User> {
        let user: User = await this.userService.getUser(body.name)
        let amount: number = parseInt(body.amount)
        if (user.balance >= amount)
            return await this.userService.updateBalance(user, amount * -1);
        else
            throw new BadRequestException();
    }

    @Post('transfer/')
    async transfer(@Body() body): Promise<Object> {
        let sender: User = await this.userService.getUser(body.senderName)
        let receiver: User = await this.userService.getUser(body.receiverName)
        let amount: number = parseInt(body.amount);
        if (sender.balance >= amount) {
            this.userService.updateBalance(sender, amount * -1)
            this.userService.updateBalance(receiver, amount)
            return { message: "Transfer successful" }
        } else
            throw new BadRequestException({message:"Insufficient balance to perform transaction"});
    }
}
