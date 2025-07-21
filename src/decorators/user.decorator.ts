import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { User as UserType } from '@prisma/client';


export const User = createParamDecorator(
  (data: keyof UserType, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user: UserType = request.user
    return data ? user?.[data] : user
  },
);
