import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from './roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
    constructor(private readonly reflector: Reflector) { }
    canActivate(context: ExecutionContext): boolean {
        const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [context.getHandler(), context.getClass()]);
        if (!requiredRoles?.length) return true;
        const { user } = context.switchToHttp().getRequest();
        if (!user?.roles) throw new ForbiddenException('No roles found');
        if (!requiredRoles.some((r) => user.roles.includes(r))) throw new ForbiddenException(`Required: ${requiredRoles.join(', ')}`);
        return true;
    }
}
