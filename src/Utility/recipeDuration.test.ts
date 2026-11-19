import { describe, it, expect } from "vitest";
import { formatDuration, MAX_DURATION_MINUTES, toDurationFields, toTotalMinutes } from "./recipeDuration";
import { intl } from "../test/intl";

describe("toDurationFields", () => {
  it("splits minutes into hours and minutes", () => {
    expect(toDurationFields(150)).toEqual({ hours: "2", minutes: "30" });
  });

  it("leaves minutes blank when the time is whole hours", () => {
    expect(toDurationFields(120)).toEqual({ hours: "2", minutes: "" });
  });

  it("leaves hours blank when the time is under an hour", () => {
    expect(toDurationFields(45)).toEqual({ hours: "", minutes: "45" });
  });

  it("returns blank fields for zero or a missing time", () => {
    expect(toDurationFields(0)).toEqual({ hours: "", minutes: "" });
    expect(toDurationFields(undefined)).toEqual({ hours: "", minutes: "" });
  });
});

describe("toTotalMinutes", () => {
  it("adds hours and minutes", () => {
    expect(toTotalMinutes({ hours: "2", minutes: "30" })).toBe(150);
  });

  it("treats blank fields as zero", () => {
    expect(toTotalMinutes({ hours: "", minutes: "" })).toBe(0);
    expect(toTotalMinutes({ hours: "3", minutes: "" })).toBe(180);
    expect(toTotalMinutes({ hours: "", minutes: "20" })).toBe(20);
  });

  it("allows minutes above 59 and carries them into the total", () => {
    expect(toTotalMinutes({ hours: "1", minutes: "90" })).toBe(150);
  });

  it("ignores surrounding whitespace", () => {
    expect(toTotalMinutes({ hours: " 2 ", minutes: " 5" })).toBe(125);
  });

  it("returns null for negative values", () => {
    expect(toTotalMinutes({ hours: "-1", minutes: "" })).toBeNull();
    expect(toTotalMinutes({ hours: "", minutes: "-5" })).toBeNull();
  });

  it("returns null for decimals and text", () => {
    expect(toTotalMinutes({ hours: "1.5", minutes: "" })).toBeNull();
    expect(toTotalMinutes({ hours: "two", minutes: "" })).toBeNull();
    expect(toTotalMinutes({ hours: "", minutes: "1e2" })).toBeNull();
  });

  it("accepts exactly the maximum and rejects anything above it", () => {
    expect(toTotalMinutes({ hours: String(MAX_DURATION_MINUTES / 60), minutes: "" })).toBe(MAX_DURATION_MINUTES);
    expect(toTotalMinutes({ hours: String(MAX_DURATION_MINUTES / 60), minutes: "1" })).toBeNull();
  });

  it("round-trips with toDurationFields", () => {
    for (const total of [1, 59, 60, 61, 150, 1440, MAX_DURATION_MINUTES]) {
      expect(toTotalMinutes(toDurationFields(total))).toBe(total);
    }
  });
});

describe("formatDuration", () => {
  it("formats hours and minutes", () => {
    expect(formatDuration(150, intl)).toBe("2 h 30 min");
  });

  it("formats whole hours without minutes", () => {
    expect(formatDuration(120, intl)).toBe("2 h");
  });

  it("formats under an hour as minutes only", () => {
    expect(formatDuration(45, intl)).toBe("45 min");
  });

  it("returns an empty string for zero or a missing time", () => {
    expect(formatDuration(0, intl)).toBe("");
    expect(formatDuration(undefined, intl)).toBe("");
  });
});
