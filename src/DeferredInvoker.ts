import {clearTimeout} from "node:timers";

/**
 * `DeferredInvoker` manages asynchronous operations with expiration capabilities, allowing actions to be deferred until a specified timeout.
 * It uses tokens to track and resolve these deferred actions.
 */
export default class DeferredInvoker<T> {
    public readonly token: string;

    private static readonly store = new Map<string, DeferredInvoker<any>>;
    private static readonly TOKEN_DEFAULT_CHARSET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

    private readonly call: (expired: boolean) => void;
    private timer: NodeJS.Timeout | null;

    /**
     * Creates an instance of DeferredInvoker.
     * @param callable The function to be called upon resolution or expiration.
     * @param timeoutMs The timeout in milliseconds after which the callable is considered expired.
     */
    private constructor(callable: ((expired: boolean) => T), timeoutMs: number) {
        this.call = callable;
        this.timer = setTimeout(() => this._resolve(true), timeoutMs);
        this.token = DeferredInvoker.generateToken();
    }

    /**
     * Builds a new DeferredInvoker instance and returns its token.
     * @param next The function to be deferred.
     * @param timeoutMs The timeout in milliseconds.
     * @returns The token associated with the deferred function.
     */
    public static build<T>(next: ((expired: boolean) => T), timeoutMs: number): string {
        const instance = new DeferredInvoker(next, timeoutMs);

        DeferredInvoker.store.set(instance.token, instance);

        return instance.token;
    }

    /**
     * Resolves the deferred action associated with the given token.
     * @param token The token of the deferred action to resolve.
     */
    public static resolve(token: string) {
        DeferredInvoker.store.get(token)?.resolve();
    }

    /**
     * Resolves the deferred action.
     */
    public resolve(): void {
        this._resolve(false);
    }

    /**
     * Internal method to resolve the deferred action, optionally marking it as expired.
     * @param expired Whether the action is resolved due to expiration.
     */
    private _resolve(expired: boolean): void {
        if (this.timer === null) {
            return;
        }

        clearTimeout(this.timer);

        this.timer = null;

        DeferredInvoker.store.delete(this.token);

        this.call(expired);
    }

    /**
     * Generates a random token.
     * @param charset Optional set of characters to be used for the token generation
     * @returns A random token string.
     */
    private static generateToken(charset: string = DeferredInvoker.TOKEN_DEFAULT_CHARSET) {
        let token = '';

        for (let i = 0; i < 8; i++) {
            const index = Math.floor(Math.random() * charset.length);

            token += charset.charAt(index);
        }

        return token;
    }
}