import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { User, UserDocument } from '@api/users/schema/user.schema';
import { AuthUserDto } from './dto/auth-user.dto';
import { ConfigService } from '@nestjs/config';
import { RoleService } from '@api/roles/role.service';
import {
  CustomBadRequestException,
  CustomUnauthorizedException,
  CustomNotFoundException,
} from '@api/common/exceptions/custom-exceptions';
import { EmailService } from '@api/email/email.service';
import { EmailTemplateType } from '@api/email/schema/email-template.schema';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private jwtService: JwtService,
    private configService: ConfigService,
    private roleService: RoleService,
    private emailService: EmailService,
  ) {}

  async register(registerDto: RegisterDto) {
    const { firstName, lastName, email, password } = registerDto;

    // Validate input
    if (!firstName || !lastName || !email || !password) {
      throw new CustomBadRequestException(
        'All fields are required',
        'missingFields',
      );
    }

    // Check if user exists
    const existingUser = await this.userModel.findOne({ email });
    if (existingUser && existingUser.isEmailVerified) {
      throw new CustomUnauthorizedException(
        'User with this email already exists',
        'userAlreadyExists',
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    const userRole = await this.roleService.findOneByName('user');

    // Generate verification token
    const verificationToken = uuidv4();

    if (existingUser && !existingUser.isEmailVerified) {
      existingUser.firstName = firstName;
      existingUser.lastName = lastName;
      existingUser.verificationToken = verificationToken;
      existingUser.isEmailVerified = false;
      existingUser.password = hashedPassword;
      existingUser.roles = userRole ? [userRole] : [];
      await existingUser.save();
    } else {
      // Create new user with verification token and unverified status
      const user = new this.userModel({
        firstName,
        lastName,
        email,
        password: hashedPassword,
        roles: userRole ? [userRole] : [],
        isEmailVerified: false,
        verificationToken,
      });
      await user.save();
    }

    // Generate verification URL
    const publicUrl = this.configService.get('PUBLIC_URL') || '';
    const verificationUrl = `${publicUrl}/verify-email?token=${verificationToken}`;

    // Send verification email
    await this.emailService.sendEmail({
      to: email,
      templateType: EmailTemplateType.VERIFY_EMAIL,
      templateData: {
        firstName,
        lastName,
        verificationLink: verificationUrl,
        verificationCode: verificationToken,
        expirationMinutes: 1440, // 24 hours
        appName: this.configService.get('APP_NAME') || 'BroGlow',
        currentYear: new Date().getFullYear(),
      },
    });

    return {
      success: true,
      message:
        'Registration initiated. Please check your email to verify your account.',
      email,
    };
  }

  async verifyEmail(
    token: string,
  ): Promise<{ success: boolean; message: string }> {
    // Find user with the verification token
    const user = await this.userModel.findOne({ verificationToken: token });

    if (!user) {
      throw new CustomBadRequestException(
        'Invalid verification token',
        'invalidToken',
      );
    }

    // Update user as verified
    user.isEmailVerified = true;
    user.verificationToken = undefined; // Clear the token
    await user.save();

    // Send welcome email
    await this.emailService.sendEmail({
      to: user.email,
      templateType: EmailTemplateType.WELCOME,
      templateData: {
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        appName: this.configService.get('APP_NAME') || 'BroGlow',
        loginUrl: this.configService.get('PUBLIC_URL')
          ? `${this.configService.get('PUBLIC_URL')}/login`
          : '/login',
        currentYear: new Date().getFullYear(),
      },
    });

    return {
      success: true,
      message: 'Email verified successfully. You can now log in.',
    };
  }

  async login(
    loginDto: LoginDto,
  ): Promise<{ token: string; refreshToken: string; user: AuthUserDto }> {
    const { email, password } = loginDto;

    // Find user
    const user = await this.userModel.findOne({ email });
    if (!user) {
      throw new CustomUnauthorizedException(
        'Invalid credentials',
        'invalidCredentials',
      );
    }

    // Check if email is verified (except for users created via Google)
    if (!user.googleId && !user.isEmailVerified) {
      throw new CustomUnauthorizedException(
        'Email not verified. Please check your inbox and verify your email before logging in.',
        'emailNotVerified',
      );
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new CustomUnauthorizedException(
        'Invalid credentials',
        'invalidCredentials',
      );
    }

    const payload = { sub: user._id, email: user.email };
    // Generate JWT token
    const { token, refreshToken } = await this.generateTokens(payload);
    await this.updateRefreshToken(user._id.toString(), refreshToken);

    return { token, refreshToken, user: new AuthUserDto(user) };
  }

  async exchangeGoogleCodeForToken(code: string) {
    const userInfoResponse = await fetch(
      'https://www.googleapis.com/oauth2/v2/userinfo',
      {
        headers: { Authorization: `Bearer ${code}` },
      },
    );

    const userInfo = await userInfoResponse.json();
    if (!userInfoResponse.ok) {
      throw new Error(`Google user info error: ${JSON.stringify(userInfo)}`);
    }

    const user = await this.userModel.findOne({ googleId: userInfo.id });

    if (!user) {
      throw new Error(`User not found!`);
    }

    const payload = { sub: user._id, email: user.email };
    // Generate JWT token
    const { token, refreshToken } = await this.generateTokens(payload);
    await this.updateRefreshToken(user._id.toString(), refreshToken);

    return { token, refreshToken, user: new AuthUserDto(user) };
  }

  async refresh(
    refreshToken: string,
  ): Promise<{ token: string; refreshToken: string }> {
    if (!refreshToken) {
      throw new CustomUnauthorizedException(
        'Refresh token is required',
        'refreshTokenRequired',
      );
    }

    try {
      const payload = await this.jwtService.verifyAsync(refreshToken, {
        secret: this.configService.get('JWT_REFRESH_SECRET'),
      });

      const user = await this.userModel.findById(payload.sub);
      if (!user || user.refreshToken !== refreshToken) {
        throw new CustomUnauthorizedException(
          'Invalid refresh token',
          'invalidRefreshToken',
        );
      }

      const tokens = await this.generateTokens({
        sub: user._id,
        email: user.email,
      });
      await this.updateRefreshToken(user._id.toString(), tokens.refreshToken);

      return tokens;
    } catch (error) {
      console.error(error);

      throw new CustomUnauthorizedException(
        'Invalid refresh token',
        'invalidRefreshToken',
      );
    }
  }

  async logout(userId: string) {
    await this.updateRefreshToken(userId, null);
    return { message: 'Logged out successfully' };
  }

  async generateTokens(payload: any) {
    const token = this.jwtService.sign(payload);
    const refreshToken = this.jwtService.sign(payload, {
      secret: this.configService.get('JWT_REFRESH_SECRET'),
      expiresIn: '7d',
    });

    return { token, refreshToken };
  }

  async updateRefreshToken(userId: string, refreshToken: string | null) {
    const hashedToken = refreshToken ? refreshToken : null;
    await this.userModel.findByIdAndUpdate(userId, {
      refreshToken: hashedToken,
    });
  }

  async sendOtp(email: string): Promise<{ message: string }> {
    const user = await this.userModel.findOne({ email });

    if (!user) {
      throw new CustomNotFoundException('User not found', 'userNotFound');
    }

    const otp = this.generateOtp();
    user.otp = otp;
    user.otpExpiration = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes
    await user.save();

    // Send OTP email
    await this.emailService.sendEmail({
      to: email,
      templateType: EmailTemplateType.FORGOT_PASSWORD,
      templateData: {
        firstName: user.firstName,
        lastName: user.lastName,
        otp,
        expirationMinutes: 5,
        appName: this.configService.get('APP_NAME') || 'BroGlow',
        currentYear: new Date().getFullYear(),
      },
    });

    return { message: 'OTP sent to your email' };
  }

  async resetPasswordWithOtp(
    email: string,
    otp: string,
    newPassword: string,
  ): Promise<{ message: string }> {
    const user = await this.userModel.findOne({
      email,
      otp,
      otpExpiration: { $gt: new Date() },
    });

    if (!user) {
      throw new CustomBadRequestException(
        'Invalid or expired OTP',
        'invalidOtp',
      );
    }

    user.password = await bcrypt.hash(newPassword, 10);
    user.otp = undefined;
    user.otpExpiration = undefined;
    await user.save();

    // Send password changed confirmation email
    await this.emailService.sendEmail({
      to: email,
      templateType: EmailTemplateType.CHANGE_PASSWORD,
      templateData: {
        firstName: user.firstName,
        lastName: user.lastName,
        appName: this.configService.get('APP_NAME') || 'BroGlow',
        supportEmail:
          this.configService.get('SUPPORT_EMAIL') || 'support@BroGlow.co',
        currentYear: new Date().getFullYear(),
      },
    });

    return { message: 'Password reset successfully' };
  }

  private generateOtp(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }
}
