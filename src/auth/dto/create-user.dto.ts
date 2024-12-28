import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({
    description: 'Nome do usuário',
    example: 'User 132',
  })
  name: string;

  @ApiProperty({
    description: 'Email do usuário',
    example: 'example123@email.com',
  })
  email: string;

  @ApiProperty({
    description: 'Senha do usuário',
    example: 'test',
  })
  password: string;
}
