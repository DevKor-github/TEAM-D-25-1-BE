import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { UserParam } from '@/user/params/user';


export const User = createParamDecorator(
  (data: keyof UserParam, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user: UserParam = request.user
    return data ? user?.[data] : user
  },
);
