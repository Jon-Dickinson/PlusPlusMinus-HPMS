function makeReqId() {
    return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}
export function requestLogger(req, res, next) {
    const id = makeReqId();
    req.requestId = id;
    console.log(`[${id}] ${req.method} ${req.path}`);
    next();
}
