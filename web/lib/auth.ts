import { cache } from "react";
import { getUser as baseGetUser } from "next-sanctum/server";

/**
 * Server-side authenticated user, de-duplicated per request via React `cache()`
 * so calling it in a route-group layout and a page during the same render costs
 * a single API request. `cache()` is RSC-scoped, so it lives in the app's render
 * layer rather than inside the framework-agnostic next-sanctum package.
 */
export const getUser: typeof baseGetUser = cache(baseGetUser);
