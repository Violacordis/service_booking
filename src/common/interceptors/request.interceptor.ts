import { Request, Response, NextFunction } from "express";
import logger from "../utilities/logger/index.js";

export class RequestInterceptor {
  handle(req: Request, res: Response, next: NextFunction) {
    const { headers, body, query } = req;

    const mHeaders = { ...headers };
    const mBody = { ...body };

    delete mHeaders.authorization;
    delete mBody.password;
    delete mBody.newPassword;

    logger.info("%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%");
    logger.info(`headers --> ${JSON.stringify(mHeaders, null, 2)}`);
    if (Object.keys(mBody).length > 0) {
      logger.info(`body --> ${mBody}`);
    }
    if (Object.keys(query).length > 0) {
      logger.info(`query --> ${JSON.stringify(query, null, 2)}`);
    }

    next();
  }

  get middleware() {
    return this.handle.bind(this);
  }
}
