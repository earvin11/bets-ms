import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { QueuesPort } from 'src/redis/domain/queues.port';
import { QueueName } from 'src/shared/enums/queue-names.enum';

export class QueueService implements QueuesPort {
  constructor(
    @InjectQueue(QueueName.CREATE_DEBIT_TRANSACTION)
    private readonly createDebitTransaction: Queue,
  ) {}

  async addJob(queueName: QueueName, jobData: any): Promise<void> {
    switch (queueName) {
      case QueueName.CREATE_DEBIT_TRANSACTION:
        await this.createDebitTransaction.add(
          QueueName.CREATE_DEBIT_TRANSACTION,
          jobData,
        );
        break;

      default:
        break;
    }
  }
}
