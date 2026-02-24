import { IsString, IsOptional, IsArray, IsBoolean } from 'class-validator';

export class CreateUserDto {
    @IsString()
    keycloakId: string;

    @IsString()
    email: string;

    @IsString()
    firstName: string;

    @IsString()
    lastName: string;

    @IsOptional()
    @IsString()
    avatarUrl?: string;

    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    interests?: string[];
}

export class UpdateUserDto {
    @IsOptional()
    @IsString()
    firstName?: string;

    @IsOptional()
    @IsString()
    lastName?: string;

    @IsOptional()
    @IsString()
    avatarUrl?: string;

    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    interests?: string[];

    @IsOptional()
    @IsBoolean()
    notifyNewArticle?: boolean;

    @IsOptional()
    @IsBoolean()
    notifyPriceChange?: boolean;

    @IsOptional()
    @IsBoolean()
    notifyByEmail?: boolean;
}
