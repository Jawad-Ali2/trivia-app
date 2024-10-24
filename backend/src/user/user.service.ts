import { Injectable, NotFoundException } from '@nestjs/common';
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

  findOne(id: string) {
    return this.userRepository.findOneBy({ id });
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    const user = await this.userRepository.findOneBy({ id });

    console.log(updateUserDto)

    user.username = updateUserDto.username;
    user.role = updateUserDto.role;
    this.userRepository.save(user);
    return `This action updates a #${id} user`;
  }

  async remove(id: string) {

    const user = await this.userRepository.findOneBy({id});

    if(user){
      this.userRepository.delete(user.id);
    }

    throw new NotFoundException();
    return `This action removes a #${id} user`;
  }
}
