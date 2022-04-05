/**
 * Transform a date into a timestamp IN SECONDS, rounded to an integer
 * @param date
 */
export const getTimeStampInSec = (date: Date = new Date()) => Math.round(date.getTime() / 1000);

/**
 * Transform a timestamp IN SECONDS into a date object
 * @param timestampInSec
 */
export const getDate = (timestampInSec: number) => new Date(timestampInSec * 1000);
