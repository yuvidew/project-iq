import { useQueryStates } from "nuqs"
import { taskParams } from "../params"

export const useTaskParams = () => {
    return useQueryStates(taskParams);
};