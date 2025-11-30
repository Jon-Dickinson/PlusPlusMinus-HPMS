import { prisma } from '../db.js';
import { CityGridGenerator } from './city-grid-generator.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { HttpError } from '../utils/http-error.js';

const SECRET = process.env.JWT_SECRET || 'dev-secret';

/** -----------------------------
 *  TYPES
 * ----------------------------- */

export interface RegisterPayload {
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  password: string;
  role: 'ADMIN' | 'MAYOR' | 'VIEWER';
  cityName?: string;
  country?: string;
  mayorType?: 'NATIONAL' | 'CITY' | 'SUBURB';
  mayorId?: number;
}

export interface LoginPayload {
  username?: string;
  email?: string;
  password?: string;
}

/** -----------------------------
 *  REGISTER SERVICE
 * ----------------------------- */

export async function register(data: RegisterPayload) {
  // --- Uniqueness checks ---
  const [existingUsername, existingEmail] = await Promise.all([
    prisma.user.findUnique({ where: { username: data.username } }),
    prisma.user.findUnique({ where: { email: data.email } }),
  ]);

  if (existingUsername) throw new HttpError(409, 'Username already exists');
  if (existingEmail) throw new HttpError(409, 'Email already exists');

  // --- Password hashing ---
  const hashedPassword = await bcrypt.hash(data.password, 10);

  // --- Create base user ---
  const user = await prisma.user.create({
    data: {
      firstName: data.firstName,
      lastName: data.lastName,
      username: data.username,
      email: data.email,
      password: hashedPassword,
      role: data.role,
    },
  });

  /** -------------------------
   *  VIEWER REGISTRATION FLOW
   * -------------------------*/
  if (data.role === 'VIEWER' && data.mayorId) {
    const mayor = await prisma.user.findUnique({
      where: { id: data.mayorId },
      select: { id: true, role: true, hierarchyId: true },
    });

    if (!mayor) throw new HttpError(400, 'Selected mayor does not exist');
    if (mayor.role !== 'MAYOR') throw new HttpError(400, 'Selected user is not a MAYOR');

    await prisma.user.update({
      where: { id: user.id },
      data: {
        mayorId: mayor.id,
        // viewers should inherit their mayor's hierarchy assignment
        hierarchyId: mayor.hierarchyId ?? undefined,
      },
    });
  }

  /** -------------------------
   *  MAYOR REGISTRATION FLOW
   * -------------------------*/
  if (data.role === 'MAYOR') {
    // Ensure the payload includes which hierarchy level this mayor should be
    // assigned to (NATIONAL | CITY | SUBURB). The frontend provides mayorType.
    // We'll either find or create an appropriate HierarchyLevel node and
    // attach the new user to it so hierarchical queries work immediately.
    const levelMap: Record<string, number> = {
      NATIONAL: 1,
      CITY: 2,
      SUBURB: 3,
    };

    const mayorType = data.mayorType ?? 'CITY';
    const level = levelMap[mayorType];

    // Locate an appropriate parent for the new node (if needed) and create
    // a HierarchyLevel for this mayor so downstream services (cities, subordinates)
    // can rely on the hierarchy assignment.
    let parentId: number | null = null;

    if (level === 1) {
      // national -> parent should be admin/root (level 0) if exists
      const root = await prisma.hierarchyLevel.findFirst({ where: { level: 0 } });
      parentId = root?.id ?? null;
    } else if (level === 2) {
      // find any national node to attach this city under
      const national = await prisma.hierarchyLevel.findFirst({ where: { level: 1 } });
      parentId = national?.id ?? null;
    } else if (level === 3) {
      // find any city node to attach this suburb under
      const cityLevel = await prisma.hierarchyLevel.findFirst({ where: { level: 2 } });
      parentId = cityLevel?.id ?? null;
    }

    // Create a new hierarchy level record for this mayor's area
    const levelName = (data.cityName && data.cityName.trim()) || `${mayorType} ${user.username}`;
    const createdHL = await prisma.hierarchyLevel.create({ data: { name: levelName, level, parentId } });

    // Attach hierarchyId to the user so other routes can operate correctly
    await prisma.user.update({ where: { id: user.id }, data: { hierarchyId: createdHL.id } });

    if (!data.cityName || !data.country) {
      throw new HttpError(400, 'cityName and country are required for MAYOR registration');
    }

    // Use CityGridGenerator to keep seeded and dynamic cities identical
    const generator = new CityGridGenerator();
    const cityGrid = generator.generateCityGrid(2); // Level 2 = medium-sized city

    await prisma.city.create({
      data: {
        name: data.cityName,
        country: data.country,
        mayorId: user.id,
        qualityIndex: cityGrid.qualityIndex,
        gridState: JSON.stringify(cityGrid.gridState),
        buildingLog: JSON.stringify(cityGrid.buildingLog),
      },
    });

    // Assign default building permissions to newly-created mayor users so
    // the UI and endpoints like GET /api/hierarchy/buildings/allowed/:userId
    // immediately return allowed categories for their level. This mirrors
    // the seeding logic used in PermissionSeeder.
    try {
      const allCategories = await prisma.buildingCategory.findMany();

      // Determine allowed categories by level using the in-src mapping which is
      // intentionally kept as a mirror of the seeder configuration so runtime
      // code doesn't import files outside of `src` (avoids tsc rootDir errors)
      let allowedCategoryNames: string[] | 'all' = 'all';
      if (level === 2) allowedCategoryNames = [...(await import('../config/seed-config.js')).BUILDING_PERMISSIONS.CITY_LEVEL];
      if (level === 3) allowedCategoryNames = [...(await import('../config/seed-config.js')).BUILDING_PERMISSIONS.SUBURB_LEVEL];

      const allowedCategoryIds = allowedCategoryNames === 'all'
        ? allCategories.map(c => c.id)
        : allCategories.filter(c => allowedCategoryNames.includes(c.name as any)).map(c => c.id);

      for (const categoryId of allowedCategoryIds) {
        await prisma.userPermission.upsert({
          where: { userId_categoryId: { userId: user.id, categoryId } },
          update: { canBuild: true },
          create: { userId: user.id, categoryId, canBuild: true }
        });
      }
    } catch (err) {
      // non-fatal — permissions will be available after seeding if categories
      // don't exist yet. Log and continue.
      console.warn('Failed to assign default building permissions to new mayor:', (err as any)?.message ?? String(err));
    }
  }

  /** -------------------------
   *  TOKEN GENERATION
   * -------------------------*/
  const token = jwt.sign(
    { id: user.id, role: user.role },
    SECRET,
    { expiresIn: '7d' }
  );

  return {
    token,
    user: {
      id: user.id,
      role: user.role,
      username: user.username,
      email: user.email,
    },
  };
}

/** -----------------------------
 *  LOGIN SERVICE
 * ----------------------------- */

export async function login({ username, email, password }: LoginPayload) {
  if (!password) throw new HttpError(400, 'Password is required');
  if (!username && !email) throw new HttpError(400, 'Username or email is required');

  const where = username ? { username } : { email };

  const user = await prisma.user.findFirst({
    where,
    include: {
      city: true,
      hierarchy: true,
      notes: { orderBy: { createdAt: 'desc' } },
    },
  });

  if (!user) throw new HttpError(401, 'Invalid credentials');

  const passwordValid = await bcrypt.compare(password, user.password);
  if (!passwordValid) throw new HttpError(401, 'Invalid credentials');

  const token = jwt.sign(
    { id: user.id, role: user.role },
    SECRET,
    { expiresIn: '7d' }
  );

  // Remove password field
  const { password: _, ...safeUser } = user;

  return {
    token,
    user: safeUser,
  };
}
