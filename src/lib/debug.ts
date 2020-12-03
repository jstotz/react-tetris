import { Grid } from "./core";

export function gridToString(grid: Grid): string {
  return grid
    .map((row) =>
      row
        .map((cell) => {
          switch (cell.type) {
            case "piece":
              return cell.shape;
            case "empty":
              return "#";
            case "preview":
              return "P";
            default:
              throw new Error("unexpected cell type");
          }
        })
        .join("")
    )
    .join("\n");
}

export function logGrid(grid: Grid): void {
  console.log(gridToString(grid));
}
