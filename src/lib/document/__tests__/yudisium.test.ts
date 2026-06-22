import { describe, it, expect } from "vitest";
import { calculateYudisium } from "../yudisium";

describe("calculateYudisium", () => {
  it('returns "pujian" for IPK >= 3.51', () => {
    expect(calculateYudisium(3.51)).toBe("pujian");
    expect(calculateYudisium(3.75)).toBe("pujian");
    expect(calculateYudisium(4.0)).toBe("pujian");
  });

  it('returns "sangat_memuaskan" for IPK between 3.01 and 3.50', () => {
    expect(calculateYudisium(3.01)).toBe("sangat_memuaskan");
    expect(calculateYudisium(3.25)).toBe("sangat_memuaskan");
    expect(calculateYudisium(3.5)).toBe("sangat_memuaskan");
  });

  it('returns "memuaskan" for IPK between 2.76 and 3.00', () => {
    expect(calculateYudisium(2.76)).toBe("memuaskan");
    expect(calculateYudisium(2.8)).toBe("memuaskan");
    expect(calculateYudisium(3.0)).toBe("memuaskan");
  });

  it('returns empty string for IPK < 2.76', () => {
    expect(calculateYudisium(2.75)).toBe("");
    expect(calculateYudisium(2.5)).toBe("");
    expect(calculateYudisium(0)).toBe("");
  });
});
