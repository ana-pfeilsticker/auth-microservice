import { Controller, Post, Body, BadRequestException } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';

@Controller('users')
export class UsersController {
  constructor(private userService: UsersService) {}

  @Post('register')
  async register(@Body() createUserDto: CreateUserDto) {
    const existingUser = await this.userService.findUserByEmail(
      createUserDto.email,
    );
    if (existingUser) {
      throw new BadRequestException(' Esse email já está em uso');
    }

    const newUser = await this.userService.createUser(createUserDto);

    const { password, ...result } = newUser;

    const confirmationEmailToken =
      await this.userService.generateEmailConfirmationToken(newUser.id);

    await this.userService.sendConfirmationEmail(
      newUser.email,
      confirmationEmailToken,
    );

    return result;
  }
}
