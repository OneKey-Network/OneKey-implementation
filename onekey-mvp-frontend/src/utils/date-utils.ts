import { parse } from 'tinyduration';
import { Duration } from 'tinyduration/src';

export const parseDuration = (isoString: string): number | null => {
  try {
    const duration = parse(isoString);
    return durationToSeconds(duration);
  } catch (e) {
    return null;
  }
};

const durationToSeconds = (duration: Duration): number | null => {
  if (duration === null || duration.negative) {
    // Negative values are not allowed
    return null;
  }
  let durationInSeconds = 0;
  if (duration.years) {
    durationInSeconds += duration.years * 31536000;
  }
  if (duration.months) {
    durationInSeconds += duration.months * 2628000;
  }
  if (duration.weeks) {
    durationInSeconds += duration.weeks * 604800;
  }
  if (duration.days) {
    durationInSeconds += duration.days * 86400;
  }
  if (duration.hours) {
    durationInSeconds += duration.hours * 3600;
  }
  if (duration.minutes) {
    durationInSeconds += duration.minutes * 60;
  }
  if (duration.seconds) {
    durationInSeconds += duration.seconds;
  }
  return durationInSeconds;
};
