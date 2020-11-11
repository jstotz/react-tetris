import { render, screen } from "@testing-library/react";
import React from "react";
import App from "./App";

test("renders pause hint", () => {
  render(<App />);
  const linkElement = screen.getByText(/Press P to pause/i);
  expect(linkElement).toBeInTheDocument();
});
