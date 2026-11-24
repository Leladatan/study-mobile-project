const DELAY_MS = 700;

const failOnce = new Set<string>();

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

export const favoriteDemoService = {
  failNext(id: string): void {
    failOnce.add(id);
  },

  async set(id: string, _next: boolean): Promise<void> {
    const shouldFail = failOnce.has(id);
    if (shouldFail) failOnce.delete(id);

    await wait(DELAY_MS);

    if (shouldFail) {
      throw new Error('Учебный отказ подтверждения избранного');
    }
  },
};
