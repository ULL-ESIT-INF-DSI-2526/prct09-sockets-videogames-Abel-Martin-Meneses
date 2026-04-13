import chalk from 'chalk';

/**
 * Returns a colored string based on the value
 * @param value - The value to color
 * @returns The colored string
 */
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