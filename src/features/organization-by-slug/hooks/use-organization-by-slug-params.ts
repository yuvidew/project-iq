import { useQueryStates } from "nuqs"
import { organizationBySlugParams } from "../params"

export const useOrganizationBySlugParams = () =>{
    return useQueryStates(organizationBySlugParams)
}