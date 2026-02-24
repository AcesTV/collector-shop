import { IsString, IsNumber, IsOptional, IsArray, IsEnum, Min } from 'class-validator';

export class CreateProductDto {
    @IsString()
    title: string;

    @IsString()
    description: string;

    @IsNumber()
    @Min(0)
    price: number;

    @IsOptional()
    @IsNumber()
    @Min(0)
    shippingCost?: number;

    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    imageUrls?: string[];

    @IsString()
    categoryId: string;

    @IsOptional()
    @IsString()
    shopId?: string;

    @IsOptional()
    @IsString()
    condition?: string;
}

export class UpdateProductDto {
    @IsOptional()
    @IsString()
    title?: string;

    @IsOptional()
    @IsString()
    description?: string;

    @IsOptional()
    @IsNumber()
    @Min(0)
    price?: number;

    @IsOptional()
    @IsNumber()
    @Min(0)
    shippingCost?: number;

    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    imageUrls?: string[];

    @IsOptional()
    @IsString()
    categoryId?: string;

    @IsOptional()
    @IsString()
    condition?: string;
}

export class UpdateProductStatusDto {
    @IsEnum(['approved', 'rejected'])
    status: 'approved' | 'rejected';
}
