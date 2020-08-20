import { Channel, Replies, ConsumeMessage } from 'amqplib';
import { defaultsDeep } from 'lodash';
import Queue from './queue';
import MessageHelper from '../helpers/message_helper';
import { consumerOptions } from '../types/consumer';
import debuggerLogger from '../utils/debugger_logger';
import ConsumerError from '../errors/ConsumerError';

export default class Consumer {
  private channel: Channel

  private options: consumerOptions

  private context: string

  constructor(channel: Channel, options: consumerOptions) {
    this.context = this.constructor.name.toLowerCase();
    this.options = defaultsDeep({}, options, { context: this.context });
    this.channel = channel;
    this.createQueue();
  }

  public consume(callback: Function): Promise<Replies.Consume> {
    const { queue: { name: queueName } } = this.options;
    return this.channel.consume(queueName,
      (messageReceived) => this.onConsumeMessage(messageReceived, callback));
  }

  private createQueue(): Promise<void> {
    const queueOptions = {
      name: this.options.queue.name,
      bindings: this.options.bindings,
      prefetch: this.options.prefetch,
      assertQueueOptions: this.options.queue.options,
    };
    return new Queue(this.channel, queueOptions).create();
  }

  private async onConsumeMessage(messageReceived: ConsumeMessage, callback: Function) {
    const { queue: { name: queueName } } = this.options;
    let message = '';

    if (messageReceived) {
      debuggerLogger({ context: this.context, message: 'Consumer started.' });
      try {
        message = MessageHelper.bufferToJson(messageReceived.content);

        await Promise.resolve(callback(message));
        debuggerLogger({
          context: this.context,
          message: 'Message was consumed.',
          metadata: {
            queueName,
            message,
          },
        });
        this.channel.ack(messageReceived);
      } catch (error) {
        debuggerLogger({
          context: this.context,
          message: 'Error on consume message',
          metadata: {
            queueName: this.options.queue.name,
            message,
          },
        });
        this.channel.reject(
          messageReceived,
          this.options.queue.requeue === false
            ? this.options.queue.requeue
            : true,
        );
        throw new ConsumerError({
          logMessage: 'Error on consume message',
          error,
        });
      }
    }
  }
}
