declare module 'playwright-extra-plugin-stealth' {
  const StealthPlugin: any;
  export default StealthPlugin;
}

declare module 'playwright-extra' {
  import { Browser, Page, BrowserContext } from 'playwright';
  
  interface PlaywrightExtra {
    use(plugin: any): void;
    launch(options?: any): Promise<Browser>;
  }
  
  export const chromium: PlaywrightExtra;
  export const firefox: PlaywrightExtra;
  export const webkit: PlaywrightExtra;
} 