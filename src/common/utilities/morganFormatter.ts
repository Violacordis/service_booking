import chalk from 'chalk';

const colorStatus = (status: number) => {
  if (status >= 500) return chalk.red(status);
  if (status >= 400) return chalk.yellow(status);
  if (status >= 300) return chalk.cyan(status);
  if (status >= 200) return chalk.green(status);
  return chalk.white(status);
};

export const morganFormat = (tokens: any, req: any, res: any) => {
  const status = res.statusCode;
  const coloredStatus = colorStatus(status);

  return [
    chalk.magenta(tokens.method(req, res)),
    chalk.white(tokens.url(req, res)),
    coloredStatus,
    chalk.gray(`${tokens['response-time'](req, res)} ms`),
  ].join(' ');
};
