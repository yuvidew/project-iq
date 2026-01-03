import { createLoader } from "nuqs/server";
import { organizationBySlugParams } from "../params";

export const organizationBySlugParamsLoader = createLoader(organizationBySlugParams)