import { IsEmail, IsNotEmpty, MinLength, Matches } from 'class-validator';

export class CreateUserDto {
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @MinLength(6, { message: 'A senah deve ter pelo menos 6 caracteres' })
  @Matches(/(?=.*\d)/, { message: 'A senha deve conter pelo menos um número' })
  @Matches(/(?=.*[a-z])/, {
    message: 'A senha deve conter pelo menos uma letra minúscula',
  })
  @Matches(/(?=.*[A-Z])/, {
    message: 'A senha deve conter pelo menos uma letra maiúscula',
  })
  @Matches(/(?=.*\W)/, {
    message: 'A senha deve conter pelo menos um caractere especial',
  })
  password: string;

  @IsNotEmpty()
  name: string;
}
