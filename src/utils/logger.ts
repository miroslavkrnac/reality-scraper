export const log = (...args: any[]): void => {
	// biome-ignore lint/suspicious/noConsole: Intended in logger
	console.log(...args);
};
