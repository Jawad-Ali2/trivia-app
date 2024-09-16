import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  create(createUserDto: CreateUserDto) {
    console.log(createUserDto);

    this.userRepository.save(createUserDto);

    return 'User has been created successfully';
  }

  findAll() {
    return this.userRepository.find();
  }

  findOne(id: number) {
    return this.userRepository.findOneBy({ id });
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    const user = await this.userRepository.findOneBy({ id });

    console.log(updateUserDto)

    user.firstname = updateUserDto.firstname;
    user.lastname = updateUserDto.lastname;
    user.isActive = updateUserDto.isActive;
    this.userRepository.save(user);
    return `This action updates a #${id} user`;
  }

  async remove(id: number) {

    const user = await this.userRepository.findOneBy({id});

    this.userRepository.delete(user);
    return `This action removes a #${id} user`;
  }
}
