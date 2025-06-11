import rateLimit from 'express-rate-limit';

const rateLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    statusCode: 429,
    success: false,
    message: 'Too many requests, please try again later.',
    data: null,
  },
});

export default rateLimiter;
