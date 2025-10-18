// Test file to verify all dependencies are properly installed and configured
import { create } from 'zustand';
import { z } from 'zod';

// Test Zustand store creation
interface TestState {
  count: number;
  increment: () => void;
}

const useTestStore = create<TestState>((set) => ({
  count: 0,
  increment: () => set((state) => ({ count: state.count + 1 })),
}));

// Test Zod schema
const testSchema = z.object({
  name: z.string(),
  email: z.string().email(),
});

console.log('All dependencies are properly configured!');

export { useTestStore, testSchema };
export type { TestState };