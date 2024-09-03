import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const User = createParamDecorator(
    (data: unknown, ctx: ExecutionContext) => {
      const request = ctx.switchToHttp().getRequest();
      // Ensure that the id is included in the user object
      return {
        id: request.user.userId,  // Use userId instead of id
        ...request.user
      };
    },
  );


export const TestUser = createParamDecorator(
    (data: unknown, ctx: ExecutionContext) => {
      const request = ctx.switchToHttp().getRequest();
      return request.user || { id: parseInt(request.headers['x-user-id'] || '0') };
    },
  );
  
  