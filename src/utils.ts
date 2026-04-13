import chalk from 'chalk';

export const getColoredValue = (value: number): string => {
  if (value < 20) {
    return chalk.red(value.toString());
  } else if (value < 40) {
    return chalk.yellow(value.toString());
  } else if (value < 60) {
    return chalk.blue(value.toString());
  } else {
    return chalk.green(value.toString());
  }
};