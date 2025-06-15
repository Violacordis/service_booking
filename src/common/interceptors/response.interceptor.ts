import { Request, Response, NextFunction } from 'express';

export class ResponseInterceptor {
  handle(req: Request, res: Response, next: NextFunction) {
    const originalJson = res.json.bind(res);

    res.json = (data: any) => {
      if (res.statusCode >= 400 || data?.success === false) {
        return originalJson(data);
      }

      const { statusCode = 200, message = 'Request successful' } =
        res.locals.responseMeta || {};
      res.status(statusCode);

      return originalJson({
        success: true,
        message,
        data,
      });
    };

    next();
  }

  get middleware() {
    return this.handle.bind(this);
  }
}
