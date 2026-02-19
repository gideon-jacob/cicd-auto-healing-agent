import { create } from 'zustand'

interface DemoState {
    count: number
    increase: () => void
    decrease: () => void
    reset: () => void
}

export const useDemoStore = create<DemoState>((set) => ({
    count: 0,
    increase: () => set((state) => ({ count: state.count + 1 })),
    decrease: () => set((state) => ({ count: state.count - 1 })),
    reset: () => set({ count: 0 }),
}))
