import { IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';

export class RefreshTokenDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(20)
  @MaxLength(200)
  refreshToken!: string;
}
