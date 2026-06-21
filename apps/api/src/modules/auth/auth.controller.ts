import { Body, Controller, Get, Headers, Patch, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ChangePasswordDto } from './dto/change-password.dto';
import { CompleteOnboardingDto } from './dto/complete-onboarding.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { ResendVerificationDto } from './dto/resend-verification.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { VerifyEmailDto } from './dto/verify-email.dto';
import { VerifyEmailPublicDto } from './dto/verify-email-public.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  register(@Body() body: RegisterDto) {
    return this.authService.register(body);
  }

  @Post('login')
  login(@Body() body: LoginDto) {
    return this.authService.login(body);
  }

  @Post('admin/login')
  adminLogin(@Body() body: LoginDto) {
    return this.authService.adminLogin(body);
  }

  @Post('verify-email')
  verifyEmail(@Headers('authorization') authorizationHeader: string | undefined, @Body() body: VerifyEmailDto) {
    return this.authService.verifyEmail(authorizationHeader, body);
  }

  @Post('verify-email-public')
  verifyEmailPublic(@Body() body: VerifyEmailPublicDto) {
    return this.authService.verifyEmailPublic(body);
  }

  @Post('resend-verification')
  resendVerification(@Headers('authorization') authorizationHeader: string | undefined) {
    return this.authService.resendVerification(authorizationHeader);
  }

  @Post('resend-verification-public')
  resendVerificationPublic(@Body() body: ResendVerificationDto) {
    return this.authService.resendVerificationPublic(body);
  }

  @Post('forgot-password')
  forgotPassword(@Body() body: ForgotPasswordDto) {
    return this.authService.forgotPassword(body);
  }

  @Post('reset-password')
  resetPassword(@Body() body: ResetPasswordDto) {
    return this.authService.resetPassword(body);
  }

  @Post('change-password')
  changePassword(
    @Headers('authorization') authorizationHeader: string | undefined,
    @Body() body: ChangePasswordDto,
  ) {
    return this.authService.changePassword(authorizationHeader, body);
  }

  @Patch('profile')
  updateProfile(
    @Headers('authorization') authorizationHeader: string | undefined,
    @Body() body: UpdateProfileDto,
  ) {
    return this.authService.updateProfile(authorizationHeader, body);
  }

  @Post('onboarding')
  completeOnboarding(
    @Headers('authorization') authorizationHeader: string | undefined,
    @Body() body: CompleteOnboardingDto,
  ) {
    return this.authService.completeOnboarding(authorizationHeader, body);
  }

  @Get('me')
  me(@Headers('authorization') authorizationHeader?: string) {
    return this.authService.me(authorizationHeader);
  }
}
