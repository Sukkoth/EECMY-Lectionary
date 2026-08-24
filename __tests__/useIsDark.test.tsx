import React from "react";
import { render } from "@testing-library/react-native";
import { Text } from "react-native";
import { useIsDark } from "../lib/useIsDark";
import { useSettings } from "../lib/SettingsContext";

jest.mock("../lib/SettingsContext", () => ({
  useSettings: jest.fn(),
}));

function TestComponent() {
  const isDark = useIsDark();
  return <Text>{isDark ? "DARK" : "LIGHT"}</Text>;
}

describe("useIsDark hook", () => {
  it("returns DARK when settings.theme is dark", async () => {
    (useSettings as jest.Mock).mockReturnValue({
      settings: { theme: "dark" },
    });
    const { getByText } = await render(<TestComponent />);
    expect(getByText("DARK")).toBeTruthy();
  });

  it("returns LIGHT when settings.theme is light", async () => {
    (useSettings as jest.Mock).mockReturnValue({
      settings: { theme: "light" },
    });
    const { getByText } = await render(<TestComponent />);
    expect(getByText("LIGHT")).toBeTruthy();
  });
});
