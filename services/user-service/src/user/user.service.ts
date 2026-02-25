import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { UpdateUserDto } from './dto';

@Injectable()
export class UserService {
    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
    ) { }

    async findOrCreate(keycloakUser: {
        userId: string;
        email: string;
        firstName: string;
        lastName: string;
    }): Promise<User> {
        let user = await this.userRepository.findOne({
            where: { keycloakId: keycloakUser.userId },
        });

        if (!user) {
            user = this.userRepository.create({
                keycloakId: keycloakUser.userId,
                email: keycloakUser.email,
                firstName: keycloakUser.firstName,
                lastName: keycloakUser.lastName,
            });
            await this.userRepository.save(user);
        }

        return user;
    }

    async findByKeycloakId(keycloakId: string): Promise<User> {
        const user = await this.userRepository.findOne({
            where: { keycloakId },
        });
        if (!user) {
            throw new NotFoundException('User not found');
        }
        return user;
    }

    async findById(id: string): Promise<User> {
        const user = await this.userRepository.findOne({ where: { id } });
        if (!user) {
            throw new NotFoundException('User not found');
        }
        return user;
    }

    async update(keycloakId: string, updateDto: UpdateUserDto): Promise<User> {
        const user = await this.findByKeycloakId(keycloakId);
        Object.assign(user, updateDto);
        return this.userRepository.save(user);
    }

    async findAll(): Promise<User[]> {
        return this.userRepository.find();
    }

    async delete(keycloakId: string): Promise<void> {
        const user = await this.findByKeycloakId(keycloakId);
        await this.userRepository.remove(user);
    }
}
