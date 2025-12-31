import {  TaskStatus } from "@/generated/prisma";
import { PAGINATION } from "@/lib/config";
import { parseAsInteger, parseAsString, parseAsStringEnum } from "nuqs/server";

const TaskStatusValues = Object.values(TaskStatus) as TaskStatus[];


export const taskParams = {
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
    status : parseAsStringEnum(TaskStatusValues)
        .withOptions({
            clearOnDefault : true
        }),
    assigneeId : parseAsString
        .withDefault("")
        .withOptions({
            clearOnDefault : true
        }),
}
