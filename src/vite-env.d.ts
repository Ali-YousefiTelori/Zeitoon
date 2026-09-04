/// <reference types="vite/client" />

declare global {
	interface Window {
		electronNotifications?: {
			show: (payload: { title: string; body: string; route: string }) => void;
			configure: (enabled: boolean, intervalHours: number) => Promise<boolean>;
			onClick: (callback: (payload: { route: string }) => void) => () => void;
		};
	}
}

export {};
