import debuggerLogger from '../utils/debugger_logger';
import errorLogger from '../utils/error_logger';

const CONTEXT_LOG = 'message-helper';
class MessageHelper {
  static jsonToBuffer(message: Object): Buffer {
    try {
      const jsonBuffered = Buffer.from(JSON.stringify(message));
      debuggerLogger({
        context: CONTEXT_LOG, message: 'Converting JSON to buffer', metadata: { message },
      });
      return jsonBuffered;
    } catch (error) {
      errorLogger({ message: 'Error in convert JSON to Buffer', error });
      throw error;
    }
  }

  static bufferToJson(buffer: Buffer): string {
    try {
      const jsonParsed = JSON.parse(buffer.toString('utf-8'));
      debuggerLogger({
        context: CONTEXT_LOG, message: 'Converting buffer to JSON.',
      });
      return jsonParsed;
    } catch (error) {
      errorLogger({ message: 'Error in convert Buffer to JSON.', error });
      throw error;
    }
  }
}

export default MessageHelper;
