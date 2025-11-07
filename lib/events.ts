type Callback = (...args: any[]) => void;
const listeners: Record<string, Callback[]> = {};

export function on(event: string, cb: Callback) {
    if (!listeners[event]) listeners[event] = [];
    listeners[event].push(cb);
    return () => off(event, cb);
}

export function off(event: string, cb: Callback) {
    if (!listeners[event]) return;
    listeners[event] = listeners[event].filter(c => c !== cb);
}

export function emit(event: string, ...args: any[]) {
    const cbs = listeners[event] || [];
    for (const cb of cbs.slice()) cb(...args);
}

export default { on, off, emit };
