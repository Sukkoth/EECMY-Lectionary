import { getDayLabels, translations } from "../lib/i18n";

describe("i18n helpers", () => {
  describe("getDayLabels", () => {
    it("returns English single-letter weekday labels for calendar grid", () => {
      const days = getDayLabels("en");
      expect(days.length).toBe(7);
      expect(days[0]).toBe("S");
      expect(days[1]).toBe("M");
    });

    it("returns Amharic single-letter weekday labels for calendar grid", () => {
      const days = getDayLabels("am");
      expect(days.length).toBe(7);
      expect(days[0]).toBe("እ");
      expect(days[1]).toBe("ሰ");
    });

    it("returns Afaan Oromoo single-letter weekday labels for calendar grid", () => {
      const days = getDayLabels("om");
      expect(days.length).toBe(7);
      expect(days[0]).toBe("D");
    });

    it("unhappy path: falls back to English for unknown/unsupported language code", () => {
      const days = getDayLabels("unknown_lang" as any);
      expect(days.length).toBe(7);
      expect(days[0]).toBe("S");
    });
  });

  describe("translations object integrity", () => {
    it("contains required translation keys across all supported languages", () => {
      expect(translations.en.appTitle).toBe("EECMY Lectionary");
      expect(translations.am.appTitle).toBeTruthy();
      expect(translations.om.appTitle).toBeTruthy();
    });
  });
});
