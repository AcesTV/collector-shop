import {
    Controller,
    Get,
    Put,
    Delete,
    Body,
    UseGuards,
    Req,
} from '@nestjs/common';
import { UserService } from './user.service';
import { UpdateUserDto } from './dto';
import { KeycloakGuard } from '../auth/keycloak.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller()
export class UserController {
    constructor(private readonly userService: UserService) { }

    // GET / - Health check
    @Get('health')
    health() {
        return { status: 'ok', service: 'user-service' };
    }

    // GET /me - Get current user profile (auto-create if first login)
    @Get('me')
    @UseGuards(KeycloakGuard)
    async getProfile(@Req() req: any) {
        return this.userService.findOrCreate(req.user);
    }

    // PUT /me - Update current user profile
    @Put('me')
    @UseGuards(KeycloakGuard)
    async updateProfile(@Req() req: any, @Body() updateDto: UpdateUserDto) {
        return this.userService.update(req.user.userId, updateDto);
    }

    // DELETE /me - Delete current user account
    @Delete('me')
    @UseGuards(KeycloakGuard)
    async deleteAccount(@Req() req: any) {
        await this.userService.delete(req.user.userId);
        return { message: 'Account deleted successfully' };
    }

    // GET /all - Admin only: list all users
    @Get('all')
    @UseGuards(KeycloakGuard, RolesGuard)
    @Roles('admin')
    async findAll() {
        return this.userService.findAll();
    }
}
