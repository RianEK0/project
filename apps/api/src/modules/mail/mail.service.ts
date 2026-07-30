import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);

  constructor(private readonly configService: ConfigService) {}

  async sendMail(to: string, subject: string, html: string): Promise<void> {
    this.logger.log(
      `Mail prepared for ${to} via ${this.configService.get<string>('SMTP_HOST')} with subject "${subject}"`,
    );

    if (process.env.NODE_ENV !== 'production') {
      this.logger.debug(html);
    }
  }
}

