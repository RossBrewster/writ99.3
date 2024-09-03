import { Controller, Post, Body, Res } from '@nestjs/common';
import { Response } from 'express';
import { OpenAiService } from './openAi.service';

@Controller('openai')
export class OpenAiController {
  constructor(private readonly openAiService: OpenAiService) {}

  @Post('chat')
  async streamChatCompletion(@Body() body: { messages: any[] }, @Res() res: Response) {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    try {
        const stream = await this.openAiService.streamChatCompletion(body.messages);
  
        // Initialize the console output
        process.stdout.write('Streaming: ');
  
        for await (const chunk of stream) {
          const content = chunk.choices[0]?.delta?.content || '';
          if (content) {
            // Send to client
            res.write(`data: ${JSON.stringify({ content })}\n\n`);
  
            // Log to console on the same line
            process.stdout.write(content);
          }
        }
  
        // End the console output
        process.stdout.write('\n');
  
        res.write('data: [DONE]\n\n');
        res.end();
      } catch (error) {
      console.error('Error in streamChatCompletion:', error);
      res.status(500).json({ error: 'An error occurred while processing the request' });
    }
  }
}
