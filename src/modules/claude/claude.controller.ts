import { Controller, Post, Body, Res } from '@nestjs/common';
import { Response } from 'express';
import { ClaudeService } from './claude.service';
// import { MessageStreamEvent } from '@anthropic-ai/sdk';

@Controller('claude')
export class ClaudeController {
  constructor(private claudeService: ClaudeService) {}

  @Post('chat')
  async streamChatCompletion(@Body() body: { messages: any[] }, @Res() res: Response) {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    try {
      const stream = await this.claudeService.streamChatCompletion(body.messages);
      
      for await (const chunk of stream) {
        let content = '';
        if (chunk.type === 'content_block_start') {
          if (chunk.content_block.type === 'text') {
            content = chunk.content_block.text;
          }
        } else if (chunk.type === 'content_block_delta') {
          if ('text' in chunk.delta) {
            content = chunk.delta.text;
          }
        }
        
        if (content) {
          // Send to client
          res.write(`data: ${JSON.stringify({ content })}\n\n`);

          // Log to console on the same line
          process.stdout.write(content);
        }
      }
      // Add a newline after the response is complete
      process.stdout.write('\n');
    } catch (error) {
      console.error('Error in Claude API call:', error);
      res.write(`data: ${JSON.stringify({ error: 'An error occurred during the API call' })}\n\n`);
    } finally {
      res.end();
    }
  }
}