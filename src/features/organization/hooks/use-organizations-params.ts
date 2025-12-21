import {useQueryStates} from "nuqs";
import { organizationParams } from "../params";

export const useOrganizationsParams = () => {
    return useQueryStates(organizationParams)
}