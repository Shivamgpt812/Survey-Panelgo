export {};

declare global {
  interface Window {
    google: {
      accounts: {
        id: {
          initialize: (config: {
            client_id: string;
            callback: (response: { credential: string }) => void;
          }) => void;
          prompt: () => void;
          renderButton: (
            container: HTMLElement,
            options: {
              theme?: string;
              size?: string;
              text?: string;
              width?: string;
            }
          ) => void;
        };
      };
    };
  }
}
