import { validationResult, param, query } from 'express-validator';

export const validateRequest = (req, res, next) => {
    const errors = validationResult(req);

    if (errors.isEmpty()) {
        return next();
    }

    // Format errors for better readability
    const extractedErrors = formatErrors(errors.array());

    return res.status(400).json({
        status: 'error',
        message: 'Validation failed',
        errors: extractedErrors
    });
};

const formatErrors = (errors) => {
    const formattedErrors = {};

    errors.forEach(error => {
        const { param, msg, location } = error;

        if (!formattedErrors[param]) {
            formattedErrors[param] = {
                message: msg,
                location
            };
        }
    });

    return formattedErrors;
};

export const validateMongoId = (paramName, location = 'params') => {
    return [
        param(paramName)
            .exists().withMessage(`${paramName} is required`)
            .isMongoId().withMessage(`${paramName} must be a valid MongoDB ID`)
    ];
};

export const validatePagination = (maxLimit = 100) => {
    // Using imported query instead of require
    return [
        query('page')
            .optional()
            .isInt({ min: 1 })
            .withMessage('Page must be a positive integer')
            .toInt(),

        query('limit')
            .optional()
            .isInt({ min: 1, max: maxLimit })
            .withMessage(`Limit must be between 1 and ${maxLimit}`)
            .toInt()
    ];
};

/**
 * Create validation chains for date range parameters
 * @returns {Array} Array of validation chains
 */
export const validateDateRange = () => {
    // Using imported query instead of require
    return [
        query('startDate')
            .optional()
            .isISO8601()
            .withMessage('startDate must be a valid ISO 8601 date')
            .toDate(),

        query('endDate')
            .optional()
            .isISO8601()
            .withMessage('endDate must be a valid ISO 8601 date')
            .toDate(),

        // Custom validator to ensure endDate is after startDate
        query('endDate')
            .optional()
            .custom((endDate, { req }) => {
                const { startDate } = req.query;
                if (startDate && endDate && new Date(endDate) <= new Date(startDate)) {
                    throw new Error('endDate must be after startDate');
                }
                return true;
            })
    ];
};

export const requireAtLeastOne = (fields, message) => {
    return (req, res, next) => {
        const hasAtLeastOne = fields.some(field =>
            req.body[field] !== undefined && req.body[field] !== null && req.body[field] !== ''
        );

        if (!hasAtLeastOne) {
            return res.status(400).json({
                status: 'error',
                message: message || `At least one of these fields is required: ${fields.join(', ')}`
            });
        }

        next();
    };
};

export const sanitizeRequest = () => {
    return (req, res, next) => {
        // Sanitize request body
        if (req.body) {
            sanitizeObject(req.body);
        }

        // Sanitize query parameters
        if (req.query) {
            sanitizeObject(req.query);
        }

        // Sanitize URL parameters
        if (req.params) {
            sanitizeObject(req.params);
        }

        next();
    };
};

const sanitizeObject = (obj) => {
    for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
            const value = obj[key];

            if (typeof value === 'object' && value !== null) {
                // Recursively sanitize nested objects
                sanitizeObject(value);
            } else if (typeof value === 'string') {
                // Sanitize strings to prevent NoSQL injection
                obj[key] = sanitizeString(value);
            }
        }
    }
};

const sanitizeString = (str) => {
    // Remove MongoDB operators
    // Fixed the regex to properly escape special characters
    return str.replace(/\$|\{|\}|\[|\]|$$|$$|\\/g, '');
};

export default validateRequest;