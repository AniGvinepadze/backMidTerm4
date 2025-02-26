import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const Employees = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    console.log(request.employeeId, 'employ id in decorator');
    return request.employeeId;
  },
);
