import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { QueuesPort } from 'src/redis/domain/queues.port';
import { QueueName } from 'src/shared/enums/queue-names.enum';

export class QueueService implements QueuesPort {
  constructor() // Inyectar queues
  // @InjectQueue(QueueName.ROUND_SET_JACKPOT)
  // private readonly setJackpotQueue: Queue,
  {}

  async addJob(queueName: QueueName, jobData: any): Promise<void> {
    switch (queueName) {
      // case QueueName.ROUND_SET_JACKPOT:
      //   await this.setJackpotQueue.add(QueueName.ROUND_SET_JACKPOT, jobData);
      //   break;

      default:
        break;
    }
  }
}
