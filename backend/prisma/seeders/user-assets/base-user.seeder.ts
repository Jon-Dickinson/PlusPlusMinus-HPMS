/**
 * Base User Seeder
 * 
 * Provides common functionality for all user-specific seeders including
 * password hashing utilities and standard upsert patterns.
 */

import { PrismaClient, User, Role } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { SEED_CONFIG } from '../config.js';

export abstract class BaseUserSeeder {
  protected passwordHash: string | null = null;

  constructor(protected prisma: PrismaClient) {}

  /**
   * Initialize password hash for use across all user creation methods
   */
  protected async initializePasswordHash(): Promise<string> {
    if (!this.passwordHash) {
      this.passwordHash = await bcrypt.hash(SEED_CONFIG.DEFAULT_PASSWORD, 10);
    }
    return this.passwordHash;
  }

  /**
   * Standard upsert pattern for user creation
   */
  protected async upsertUser(userData: {
    username: string;
    firstName: string;
    lastName: string;
    email: string;
    role: Role;
    hierarchyId: number;
    mayorId?: number;
  }): Promise<User> {
    const passwordHash = await this.initializePasswordHash();

    return await this.prisma.user.upsert({
      where: { username: userData.username },
      update: {
        hierarchyId: userData.hierarchyId,
        role: userData.role,
        mayorId: userData.mayorId ?? null
      },
      create: {
        firstName: userData.firstName,
        lastName: userData.lastName,
        username: userData.username,
        email: userData.email,
        password: passwordHash,
        role: userData.role,
        hierarchyId: userData.hierarchyId,
        mayorId: userData.mayorId ?? null
      }
    });
  }

  /**
   * Generate email from username
   */
  protected generateEmail(username: string): string {
    return `${username}@example.com`;
  }

  /**
   * Generate city letter from index (A, B, C...)
   */
  protected getCityLetter(cityIndex: number): string {
    return String.fromCharCode(65 + cityIndex);
  }

  /**
   * Sanitize name for username (lowercase, replace spaces with underscores)
   */
  protected sanitizeForUsername(name: string): string {
    return name.toLowerCase().replace(/\s+/g, '_');
  }
}