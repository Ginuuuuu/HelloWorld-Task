

export const createUserCheckScheme = {
    sname: {
        notEmpty: {
            errorMessage: "User name must not be empty"
        },
        /* user name length validation */
        isLength: {
            options: {min:4, max:12},
            errorMessage: "User name character requirment didn't met"
        },
        /* To check whether the requested is in string format or not */
        isString: {
            errorMessage: "User name must be a string"
        }
    },
    /* adding age validation */
    age: {
        notEmpty: {
            errorMessage: "Age must not be empty"
        },
        isInt: {
            options: {min:16},
            errorMessage: "User must be 16+"
        }
    }
};