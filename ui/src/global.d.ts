export {};

declare global {
  interface Window {
    managers: Record<string, any>
  }
}
