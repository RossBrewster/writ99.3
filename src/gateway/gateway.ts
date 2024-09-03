import { MessageBody, SubscribeMessage, WebSocketGateway, WebSocketServer, ConnectedSocket } from "@nestjs/websockets";
import { OnModuleInit, Inject } from "@nestjs/common";
import { Server, Socket } from "socket.io";
import { ClaudeService } from '../modules/claude/claude.service';

interface ContentBlock {
  type: string;
  text?: string;
}

interface Message {
  role: string;
  content: string | ContentBlock[];
}

@WebSocketGateway({
  cors: {
    origin: 'http://localhost:5173', // Your frontend URL
    methods: ['GET', 'POST'],
    credentials: true,
  },
  namespace: '/',
  port: 3001
})
export class MyGateway implements OnModuleInit {
  @WebSocketServer()
  server: Server;

  constructor(@Inject(ClaudeService) private claudeService: ClaudeService) {}

  onModuleInit() {
    this.server.on('connection', (socket) => {
      console.log(`Client connected: ${socket.id}`);
    });
  }

  @SubscribeMessage('sendMessage')
  async handleMessage(@MessageBody() data: { messages: Message[] }, @ConnectedSocket() client: Socket) {
    console.log(`Received messages:`, data.messages);
    
    try {
      const stream = await this.claudeService.streamChatCompletion(data.messages);
      
      let currentMessage: Message = { role: 'assistant', content: [] };
      let currentContentBlock: ContentBlock | null = null;

      for await (const event of stream) {
        switch (event.type) {
          case 'message_start':
            currentMessage = event.message;
            client.emit('messageStart', { role: currentMessage.role });
            break;
          
          case 'content_block_start':
            currentContentBlock = event.content_block;
            break;
          
          case 'content_block_delta':
            if (currentContentBlock && event.delta.type === 'text_delta') {
              if (currentContentBlock.type === 'text') {
                currentContentBlock.text = (currentContentBlock.text || '') + event.delta.text;
                client.emit('contentDelta', { text: event.delta.text });
              }
            }
            break;
          
          case 'content_block_stop':
            if (currentContentBlock) {
              if (Array.isArray(currentMessage.content)) {
                currentMessage.content.push(currentContentBlock);
              } else {
                currentMessage.content = [currentContentBlock];
              }
              currentContentBlock = null;
            }
            break;
          
          case 'message_delta':
            // Handle any message-level updates if needed
            break;
          
          case 'message_stop':
            client.emit('messageComplete', currentMessage);
            break;
          
          // Handle other event types as needed
        }
      }
    } catch (error) {
      console.error('Error in Claude API call:', error);
      client.emit('error', { message: 'An error occurred during the API call' });
    }
  }
}