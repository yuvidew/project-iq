import { useQueryStates } from "nuqs"
import { teamsParams } from "../params"

export const useTeamsParams = () => {
    return useQueryStates(teamsParams)
}