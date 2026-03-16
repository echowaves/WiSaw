## 1. Compute responsive segment width

- [x] 1.1 Add a `segmentWidth` derived value from screen `width` capped at 90 (e.g., `Math.min(90, Math.floor(width * 0.22))`) in the component body
- [x] 1.2 Replace the three hardcoded `width: 90` values on segment buttons with `segmentWidth`
