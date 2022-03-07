import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../repositories/User.entity';

@Injectable()
export class UserService {

  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>
  ) {
  };

  async createUser(name: string, balance: number | undefined): Promise<User> {
    const user = new User()
    user.name = name
    if (balance) user.balance = balance
    return await this.userRepository.save(user);
  }

  async getUser(name: string): Promise<User | undefined> {
    let user: User = await this.userRepository.findOne({ where: { name: name } });
    return user
  }

  async getBalance(name: string): Promise<number> {
    return await this.userRepository.findOne({ where: { name: name } }).then(user => { return user.balance; });
  }

  async updateBalance(user: User, balance: number): Promise<User> {
    user.balance += balance;
    return await this.userRepository.save(user)
  }
}
