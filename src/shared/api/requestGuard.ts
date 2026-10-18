export type RequestGuard = {
  start: () => number;
  isCurrent: (token: number) => boolean;
  drop: () => void;
};

export function createRequestGuard(): RequestGuard {
  let current = 0;

  return {
    start() {
      current += 1;
      return current;
    },
    isCurrent(token: number) {
      return token === current;
    },
    drop() {
      current += 1;
    },
  };
}
