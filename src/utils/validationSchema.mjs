import { isEmpty } from "lodash";

export const createUserCheckScheme = {
    sname: {
        isEmpty: {
            errorMessage: "User name must not be empty"
        }
    }
}