import { createParamDecorator } from "@nestjs/common";
import { getClientIp } from "request-ip";

export const IpAddress = createParamDecorator((_, req) => {
  if (req.clientIp) {
    return req.clientIp;
  }

  return getClientIp(req);
});
