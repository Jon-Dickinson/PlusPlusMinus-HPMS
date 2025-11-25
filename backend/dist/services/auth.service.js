import { prisma } from '../db.js';
import { CityGridGenerator } from './city-grid-generator.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { HttpError } from '../utils/http-error.js';
const SECRET = process.env.JWT_SECRET || 'dev-secret';
/** -----------------------------
 *  REGISTER SERVICE
 * ----------------------------- */
export async function register(data) {
    // --- Uniqueness checks ---
    const [existingUsername, existingEmail] = await Promise.all([
        prisma.user.findUnique({ where: { username: data.username } }),
        prisma.user.findUnique({ where: { email: data.email } }),
    ]);
    if (existingUsername)
        throw new HttpError(409, 'Username already exists');
    if (existingEmail)
        throw new HttpError(409, 'Email already exists');
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
            select: { id: true, role: true },
        });
        if (!mayor)
            throw new HttpError(400, 'Selected mayor does not exist');
        if (mayor.role !== 'MAYOR')
            throw new HttpError(400, 'Selected user is not a MAYOR');
        await prisma.user.update({
            where: { id: user.id },
            data: { mayorId: mayor.id },
        });
    }
    /** -------------------------
     *  MAYOR REGISTRATION FLOW
     * -------------------------*/
    if (data.role === 'MAYOR') {
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
    }
    /** -------------------------
     *  TOKEN GENERATION
     * -------------------------*/
    const token = jwt.sign({ id: user.id, role: user.role }, SECRET, { expiresIn: '7d' });
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
export async function login({ username, email, password }) {
    if (!password)
        throw new HttpError(400, 'Password is required');
    if (!username && !email)
        throw new HttpError(400, 'Username or email is required');
    const where = username ? { username } : { email };
    const user = await prisma.user.findFirst({
        where,
        include: {
            city: true,
            hierarchy: true,
            notes: { orderBy: { createdAt: 'desc' } },
        },
    });
    if (!user)
        throw new HttpError(401, 'Invalid credentials');
    const passwordValid = await bcrypt.compare(password, user.password);
    if (!passwordValid)
        throw new HttpError(401, 'Invalid credentials');
    const token = jwt.sign({ id: user.id, role: user.role }, SECRET, { expiresIn: '7d' });
    // Remove password field
    const { password: _, ...safeUser } = user;
    return {
        token,
        user: safeUser,
    };
}
