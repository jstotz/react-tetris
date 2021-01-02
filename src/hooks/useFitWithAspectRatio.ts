import { RefObject } from "react";
import useDimensions from "react-cool-dimensions";

// Returns the largest width and height that fits within the container element's
// dimensions, maintaining the given aspect ratio. The returned dimenions update
// if the container element is resized. The returned ref should be attached to
// the container element.
export default function useFitWithAspectRatio<T extends HTMLElement>(
  aspectRatioWidth: number,
  aspectRatioHeight: number
): { ref: RefObject<T>; width: number; height: number } {
  const {
    ref,
    width: containerWidth,
    height: containerHeight,
  } = useDimensions<T>();

  let height: number;
  let width = containerHeight * (aspectRatioWidth / aspectRatioHeight);
  if (width > containerWidth) {
    width = containerWidth;
    height = containerWidth * (aspectRatioHeight / aspectRatioWidth);
  } else {
    height = containerHeight;
  }
  return { ref, width, height };
}
