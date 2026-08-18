import React from "react";
import { render } from "@testing-library/react-native";
import DownloadProgressStep from "@/components/check-updates/DownloadProgressStep";

jest.mock("@expo/vector-icons/Ionicons", () => "Ionicons");
jest.mock("@/lib/i18n", () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

describe("<DownloadProgressStep />", () => {
  const dummyYear = {
    year: 2026,
    languages: [],
  };

  test("renders progress percentage and year correctly", async () => {
    const { getByText } = await render(
      <DownloadProgressStep
        progress={50}
        year={dummyYear as any}
        selectedVersionLabels={["NIV", "Amharic 1954"]}
      />
    );

    expect(getByText("50%")).toBeTruthy();
    expect(getByText("2026")).toBeTruthy();
    expect(getByText("2")).toBeTruthy();
  });

  test("safely handles 0% and invalid progress values", async () => {
    const { getByText } = await render(
      <DownloadProgressStep
        progress={NaN}
        year={dummyYear as any}
        selectedVersionLabels={[]}
      />
    );

    expect(getByText("0%")).toBeTruthy();
  });
});
