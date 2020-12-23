import { act, render } from "@testing-library/react";
import React from "react";
import App from "./App";

beforeAll(() => jest.useFakeTimers());

afterAll(() => jest.useRealTimers());

test("renders pause hint", async () => {
  render(<App />);

  // Waits for dynamic "howler" import to finish in useSound hook
  await act(async () => {});
});
