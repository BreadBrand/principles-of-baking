import type { IntlShape } from "react-intl";

export const MAX_DURATION_MINUTES = 7 * 24 * 60;

export type DurationFields = { hours: string; minutes: string };

const WHOLE_NUMBER = /^\d+$/;

const parseWholeNumber = (raw: string): number | null => {
  const trimmed = raw.trim();
  if (trimmed === "") return 0;
  return WHOLE_NUMBER.test(trimmed) ? Number(trimmed) : null;
};

export const toDurationFields = (totalMinutes: number | undefined): DurationFields => {
  if (!totalMinutes || totalMinutes <= 0) return { hours: "", minutes: "" };
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return {
    hours: hours > 0 ? String(hours) : "",
    minutes: minutes > 0 ? String(minutes) : "",
  };
};

export const toTotalMinutes = ({ hours, minutes }: DurationFields): number | null => {
  const wholeHours = parseWholeNumber(hours);
  const wholeMinutes = parseWholeNumber(minutes);
  if (wholeHours === null || wholeMinutes === null) return null;
  const total = wholeHours * 60 + wholeMinutes;
  return total <= MAX_DURATION_MINUTES ? total : null;
};

export const formatDuration = (totalMinutes: number | undefined, intl: IntlShape): string => {
  if (!totalMinutes || totalMinutes <= 0) return "";
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (hours > 0 && minutes > 0) {
    return intl.formatMessage({ id: "duration.hoursMinutes", defaultMessage: "{hours} h {minutes} min" }, { hours, minutes });
  }
  if (hours > 0) {
    return intl.formatMessage({ id: "duration.hours", defaultMessage: "{hours} h" }, { hours });
  }
  return intl.formatMessage({ id: "duration.minutes", defaultMessage: "{minutes} min" }, { minutes });
};
