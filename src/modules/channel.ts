import {
  Connection as AmqpConnection,
  Channel as AmqpChannel, ConfirmChannel as AmpqConfirmChannel,
} from 'amqplib';
import debuggerLogger from '../utils/debugger_logger';
import { ChannelError } from '../errors';
import { channelTypes, channelStringTypes, channelContexts } from '../interfaces/IChannel';

export default class Channel {
  private connection: AmqpConnection

  private channelTypes: channelTypes

  private channel: AmqpChannel | AmpqConfirmChannel

  private CONTEXT_LOG: string

  constructor(connection: AmqpConnection) {
    this.connection = connection;
    this.channelTypes = {
      default: () => this.connection.createChannel(),
      confirmation: () => this.connection.createConfirmChannel(),
    };
    this.CONTEXT_LOG = this.constructor.name.toLocaleLowerCase();
  }

  public async create(
    type: channelStringTypes = 'default',
    context: channelContexts,
    prefetch: number,
  ): Promise<AmqpChannel | AmpqConfirmChannel> {
    try {
      this.channel = await this.channelTypes[type].bind(this)();
      this.channel.prefetch(prefetch);
      debuggerLogger({ message: `Channel ${context}.${type} created.`, context: this.CONTEXT_LOG });

      return this.channel;
    } catch (error) {
      throw new ChannelError({ error, message: `Error in ${context}.${type} create channel.` });
    }
  }
}
