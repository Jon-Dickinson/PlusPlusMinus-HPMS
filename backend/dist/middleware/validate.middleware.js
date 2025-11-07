export const validate = (schema) => (req, res, next) => {
    try {
        // First try to validate the request body directly (common case: schema expects the body shape)
        schema.parse(req.body);
        return next();
    }
    catch (errBody) {
        try {
            // Fallback: some schemas validate an object containing body/query/params
            schema.parse({ body: req.body, query: req.query, params: req.params });
            return next();
        }
        catch (err) {
            return res.status(400).json({ message: 'Validation error', errors: (err.errors || errBody.errors) });
        }
    }
};
