import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Anthropic from '@anthropic-ai/sdk';

interface Message {
  role: string;
  content: string | { type: string; text?: string }[];
}

@Injectable()
export class ClaudeService implements OnModuleInit {
  private anthropic: Anthropic;

  constructor(private configService: ConfigService) {}

  onModuleInit() {
    const apiKey = this.configService.get<string>('ANTHROPIC_API_KEY');
    if (!apiKey) {
      throw new Error('ANTHROPIC_API_KEY is not set in the environment variables');
    }
    this.anthropic = new Anthropic({ apiKey });
  }

  async streamChatCompletion(messages: Message[]) {
    const stream = await this.anthropic.messages.create({
      model: 'claude-3-5-sonnet-20240620',
      max_tokens: 1024,
      messages: this.formatMessages(messages),
      stream: true,
    });

    return stream;
  }

  private formatMessages(messages: Message[]): Anthropic.MessageParam[] {
    return messages.map(msg => ({
      role: msg.role === 'user' ? 'user' : 'assistant',
      content: typeof msg.content === 'string' ? msg.content : this.formatContent(msg.content),
    }));
  }

  private formatContent(content: { type: string; text?: string }[]): string {
    return content.map(block => block.text || '').join(' ');
  }
}