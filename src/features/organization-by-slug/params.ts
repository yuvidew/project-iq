import { parseAsString } from "nuqs/server";

export const organizationBySlugParams = {
    search : parseAsString
        .withDefault("")
        .withOptions({
            clearOnDefault : true
        }),
}
