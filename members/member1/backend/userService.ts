import bcrypt from 'bcryptjs';
import { db } from '../../../server/src/config/db.js';
import { validatePasswordStrength } from '../../../shared/utils/index.js';

export class UserService {
  /**
   * Retrieves list of users with search and pagination
   */
  static async getUsers(params: {
    page?: number;
    limit?: number;
    search?: string;
    role?: string;
  }) {
    const page = Math.max(1, params.page || 1);
    const limit = Math.min(100, Math.max(1, params.limit || 10));

    let users = await db.user.findMany({
      where: params.role ? { role: params.role } : undefined,
    });

    if (params.search) {
      const q = params.search.toLowerCase();
      users = users.filter(
        (u: any) =>
          u.name.toLowerCase().includes(q) ||
          u.email.toLowerCase().includes(q) ||
          (u.phone && u.phone.toLowerCase().includes(q))
      );
    }

    const total = users.length;
    const startIndex = (page - 1) * limit;
    const paginated = users.slice(startIndex, startIndex + limit).map((u: any) => {
      const { passwordHash: _, ...safeUser } = u;
      return safeUser;
    });

    return {
      users: paginated,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Admin-only: Creates a new internal STAFF account
   */
  static async createStaff(data: {
    email: string;
    password: string;
    name: string;
    phone?: string;
  }) {
    const pwdCheck = validatePasswordStrength(data.password);
    if (!pwdCheck.isValid) {
      throw new Error(pwdCheck.message);
    }

    const existing = await db.user.findUnique({
      where: { email: data.email.toLowerCase().trim() },
    });
    if (existing) {
      throw new Error('An account with this email already exists.');
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(data.password, salt);

    const staffUser = await db.user.create({
      data: {
        email: data.email.toLowerCase().trim(),
        passwordHash,
        name: data.name.trim(),
        role: 'STAFF',
        phone: data.phone,
        isActive: true,
      },
    });

    const { passwordHash: _, ...safeUser } = staffUser;
    return safeUser;
  }

  /**
   * Retrieves user by ID with optional profile
   */
  static async getUserById(id: string) {
    const user = await db.user.findUnique({ where: { id } });
    if (!user) {
      throw new Error('User not found.');
    }

    const customerProfile = await db.customerProfile.findUnique({
      where: { userId: user.id },
    });

    const { passwordHash: _, ...safeUser } = user;
    return { ...safeUser, customerProfile };
  }

  /**
   * Updates profile information for the authenticated user or admin
   */
  static async updateProfile(
    userId: string,
    data: {
      name?: string;
      phone?: string;
      companyName?: string;
      address?: string;
      city?: string;
      state?: string;
      zipCode?: string;
      country?: string;
      taxId?: string;
    }
  ) {
    const user = await db.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new Error('User not found.');
    }

    if (data.name !== undefined || data.phone !== undefined) {
      await db.user.update({
        where: { id: userId },
        data: {
          name: data.name !== undefined ? data.name : user.name,
          phone: data.phone !== undefined ? data.phone : user.phone,
        },
      });
    }

    let customerProfile = await db.customerProfile.findUnique({ where: { userId } });
    if (customerProfile) {
      customerProfile = await db.customerProfile.update({
        where: { userId },
        data: {
          companyName: data.companyName ?? customerProfile.companyName,
          address: data.address ?? customerProfile.address,
          city: data.city ?? customerProfile.city,
          state: data.state ?? customerProfile.state,
          zipCode: data.zipCode ?? customerProfile.zipCode,
          country: data.country ?? customerProfile.country,
          taxId: data.taxId ?? customerProfile.taxId,
        },
      });
    }

    return this.getUserById(userId);
  }

  /**
   * Retrieves all customers with profiles (for sales, quotations, and staff)
   */
  static async getCustomers() {
    return db.customerProfile.findMany();
  }
}
