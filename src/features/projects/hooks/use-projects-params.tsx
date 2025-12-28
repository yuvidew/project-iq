import { useQueryStates } from "nuqs";
import { projectParams } from "../params";

export const useProjectsParams = () => {
    return useQueryStates(projectParams)
}
