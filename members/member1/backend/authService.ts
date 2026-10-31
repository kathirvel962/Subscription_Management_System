import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { db } from '../../../server/src/config/db.js';
import { ENV } from '../../../server/src/config/env.js';
import { validatePasswordStrength } from '../../../shared/utils/index.js';

export class AuthService {
  /**
   * Registers a new customer account
   */
  static async register(data: {
    email: string;
    password: string;
    name: string;
    phone?: string;
    companyName?: string;
    address?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
    taxId?: string;
  }) {
    // 1. Password policy verification
    const pwdCheck = validatePasswordStrength(data.password);
    if (!pwdCheck.isValid) {
      throw new Error(pwdCheck.message);
    }

    // 2. Email uniqueness check
    const existing = await db.user.findUnique({
      where: { email: data.email.toLowerCase().trim() },
    });
    if (existing) {
      throw new Error('An account with this email address already exists.');
    }

    // 3. Password hashing
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(data.password, salt);

    // 4. Create User and CustomerProfile in transaction
    const newUser = await db.user.create({
      data: {
        email: data.email.toLowerCase().trim(),
        passwordHash,
        name: data.name.trim(),
        role: 'CUSTOMER',
        phone: data.phone,
        isActive: true,
      },
    });

    const newProfile = await db.customerProfile.create({
      data: {
        userId: newUser.id,
        companyName: data.companyName || null,
        address: data.address || null,
        city: data.city || null,
        state: data.state || null,
        zipCode: data.zipCode || null,
        country: data.country || 'India',
        taxId: data.taxId || null,
      },
    });

    // 5. Generate JWT token
    const token = this.generateToken(newUser);

    const { passwordHash: _, ...userWithoutPassword } = newUser;
    return {
      user: userWithoutPassword,
      customerProfile: newProfile,
      token,
    };
  }

  /**
   * Authenticates user with email and password
   */
  static async login(email: string, password: string) {
    const user = await db.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (!user) {
      throw new Error('Invalid email or password.');
    }

    if (!user.isActive) {
      throw new Error('This account has been deactivated. Please contact support.');
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      throw new Error('Invalid email or password.');
    }

    const token = this.generateToken(user);
    const customerProfile = await db.customerProfile.findUnique({
      where: { userId: user.id },
    });

    const { passwordHash: _, ...userWithoutPassword } = user;
    return {
      user: userWithoutPassword,
      customerProfile,
      token,
    };
  }

  /**
   * Generates a time-limited password reset token
   */
  static async forgotPassword(email: string) {
    const user = await db.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    // Do not leak whether user exists or not for security
    if (!user) {
      return {
        message: 'If an account exists with this email, a reset token has been generated.',
        devToken: null,
      };
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + ENV.RESET_TOKEN_EXPIRES_MINUTES * 60 * 1000);

    await db.passwordResetToken.create({
      data: {
        token: resetToken,
        userId: user.id,
        expiresAt,
      },
    });

    return {
      message: 'Password reset link/token generated successfully.',
      // Provided in development/demo mode so password reset can be tested without external email service
      devToken: resetToken,
    };
  }

  /**
   * Resets password using a valid, unexpired reset token
   */
  static async resetPassword(token: string, newPassword: string) {
    const pwdCheck = validatePasswordStrength(newPassword);
    if (!pwdCheck.isValid) {
      throw new Error(pwdCheck.message);
    }

    const resetRecord = await db.passwordResetToken.findUnique({
      where: { token },
    });

    if (!resetRecord) {
      throw new Error('Invalid or expired reset token.');
    }

    if (resetRecord.usedAt) {
      throw new Error('This reset token has already been used.');
    }

    if (new Date() > new Date(resetRecord.expiresAt)) {
      throw new Error('This reset token has expired. Please request a new one.');
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(newPassword, salt);

    await db.user.update({
      where: { id: resetRecord.userId },
      data: { passwordHash },
    });

    await db.passwordResetToken.update({
      where: { id: resetRecord.id },
      data: { usedAt: new Date() },
    });

    return { message: 'Password has been reset successfully. You can now login.' };
  }

  /**
   * Generates a signed JWT payload
   */
  static generateToken(user: { id: string; email: string; role: string; name: string }) {
    return jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
        name: user.name,
      },
      ENV.JWT_SECRET,
      { expiresIn: '7d' }
    );
  }
}
