import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const GetUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): any => {
    const request = ctx.switchToHttp().getRequest<{ user: any }>();
    return request.user;
  },
);
