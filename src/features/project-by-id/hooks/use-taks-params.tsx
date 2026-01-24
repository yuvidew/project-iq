import { useQueryStates } from "nuqs"
import { documentParams, taskParams } from "../params"


export const useTaskParams = () => {
    return useQueryStates(taskParams);
};

export const useDocumentParams = () => {
    return useQueryStates(documentParams);
}