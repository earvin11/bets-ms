import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { CreateBetUseCase } from 'src/bets/application/create-bet.use-case';
import { LoggerPort } from 'src/logging/domain/logger.port';
import { QueueName } from 'src/shared/enums/queue-names.enum';

@Processor(QueueName.BET)
export class CreateBetProcessor extends WorkerHost {
  constructor(
    private readonly loggerPort: LoggerPort,
    private readonly createBetUseCase: CreateBetUseCase,
  ) {
    super();
  }

  async process(job: Job): Promise<any> {
    try {
      return await this.createBetUseCase.run(job.data);
    } catch (error) {
      this.loggerPort.error(`[ERROR] process: ${QueueName.BET}`, error);
      throw error;
    }
  }
}
