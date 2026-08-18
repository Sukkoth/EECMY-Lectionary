import React from "react";
import { render } from "@testing-library/react-native";
import { stripFormattedTags, FormattedText } from "../lib/formatText";

describe("formatText", () => {
  describe("stripFormattedTags", () => {
    it("strips verse tags <v>1</v> and <v>2</>", () => {
      const input = "<v>1</v> In the beginning <v>2</> was the Word";
      expect(stripFormattedTags(input)).toBe("1 In the beginning 2 was the Word");
    });

    it("strips <red> tags while preserving text inside", () => {
      const input = "Jesus said: <red>I am the way</red>";
      expect(stripFormattedTags(input)).toBe("Jesus said: I am the way");
    });

    it("handles null or undefined input gracefully", () => {
      expect(stripFormattedTags(null)).toBe("");
      expect(stripFormattedTags(undefined)).toBe("");
    });
  });

  describe("<FormattedText /> component", () => {
    it("renders verse numbers and red text correctly", async () => {
      const { getByText } = await render(
        <FormattedText text="<v>1</v> For God so loved <red>the world</red>" />
      );

      expect(getByText(/1/)).toBeTruthy();
      expect(getByText("the world")).toBeTruthy();
    });

    it("returns null when text is empty or null", async () => {
      const { toJSON } = await render(<FormattedText text={null} />);
      expect(toJSON()).toBeNull();
    });
  });
});
