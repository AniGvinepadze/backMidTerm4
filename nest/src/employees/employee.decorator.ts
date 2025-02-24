import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const Employee = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    console.log(request.employeeId, 'employid rew');
    return request.employeeId;
  },
);
