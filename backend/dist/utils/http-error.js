export class HttpError extends Error {
    status;
    constructor(status, message) {
        super(message);
        this.status = status;
        Object.setPrototypeOf(this, HttpError.prototype);
    }
}
export default HttpError;
