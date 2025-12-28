import { ProjectPriority, ProjectStatus } from "@/generated/prisma";
import { PAGINATION } from "@/lib/config";
import { parseAsInteger, parseAsString, parseAsStringEnum } from "nuqs/server";

const projectStatusValues = Object.values(ProjectStatus) as ProjectStatus[];
const projectPriorityValues = Object.values(ProjectPriority) as ProjectPriority[];

export const projectParams = {
    page : parseAsInteger
        .withDefault(PAGINATION.DEFAULT_PAGE)
        .withOptions({
            clearOnDefault : true
        }),
    pageSize : parseAsInteger
        .withDefault(PAGINATION.DEFAULT_PAGE_SIZE)
        .withOptions({
            clearOnDefault : true
        }),
    search : parseAsString
        .withDefault("")
        .withOptions({
            clearOnDefault : true
        }),
    status : parseAsStringEnum(projectStatusValues)
        .withOptions({
            clearOnDefault : true
        }),
    priority : parseAsStringEnum(projectPriorityValues)
        .withOptions({
            clearOnDefault : true
        }),
}
