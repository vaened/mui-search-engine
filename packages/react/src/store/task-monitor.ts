/**
 * @author enea dhack <contact@vaened.dev>
 * @link https://vaened.dev DevFolio
 */

export type TaskMonitor = {
  capture(condition?: boolean): void;
  release(condition?: boolean): void;
  isHydrating(): boolean;
  whenReady(name: string, callback: () => void): void;
};

export function createTaskMonitor(): TaskMonitor {
  let count = 0;
  let pending = new Map<string, () => void>();

  const flush = () => {
    if (count !== 0 || pending.size <= 0) {
      return;
    }

    const tasks = Array.from(pending.values());
    pending.clear();

    tasks.forEach((task) => task());
  };

  return {
    capture() {
      count++;
    },
    release() {
      if (count <= 0) {
        return;
      }

      count--;

      if (count === 0) {
        flush();
      }
    },
    isHydrating() {
      return count > 0;
    },

    whenReady(name: string, task: () => void) {
      if (count === 0) {
        task();
      } else {
        pending.set(name, task);
      }
    },
  };
}
