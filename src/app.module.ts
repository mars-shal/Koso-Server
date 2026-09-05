import { Module } from '@nestjs/common';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { ClientsModule } from './clients/clients.module.js';
import { ProjectsModule } from './projects/projects.module.js';
import { MeetingsModule } from './meetings/meetings.module.js';
import { LogsModule } from './logs/logs.module.js';
import { PaymentsModule } from './payments/payments.module.js';
import { DocumentsModule } from './documents/documents.module.js';
import { MilestonesModule } from './milestones/milestones.module.js';
import { PaymentLinksModule } from './payment-links/payment-links.module.js';
import { TransactionsModule } from './transactions/transactions.module.js';
import { AiModule } from './ai/ai.module.js';
import { ResumeModule } from './resume/resume.module.js';

@Module({
  imports: [
    ClientsModule,
    ProjectsModule,
    MeetingsModule,
    LogsModule,
    PaymentsModule,
    DocumentsModule,
    MilestonesModule,
    PaymentLinksModule,
    TransactionsModule,
    AiModule,
    ResumeModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
