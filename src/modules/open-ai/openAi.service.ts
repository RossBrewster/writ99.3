import { Injectable, OnModuleInit } from '@nestjs/common';
   import { ConfigService } from '@nestjs/config';
   import OpenAI from 'openai';

   @Injectable()
   export class OpenAiService implements OnModuleInit {
     private openai: OpenAI;

     constructor(private configService: ConfigService) {}

     onModuleInit() {
        const apiKey = this.configService.get<string>('OPENAI_API_KEY');
        if (!apiKey) {
          throw new Error('OPENAI_API_KEY is not set in the environment variables');
        }
        this.openai = new OpenAI({ apiKey });
      }

     async streamChatCompletion(messages: any[]) {
       try {
         const stream = await this.openai.chat.completions.create({
           model: 'gpt-4',
           messages: messages,
           stream: true,
         });
         return stream;
       } catch (error) {
         console.error('Error in OpenAI API call:', error);
         throw error;
       }
     }
   }
   