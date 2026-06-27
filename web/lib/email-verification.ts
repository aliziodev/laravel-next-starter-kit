/**
 * Whether the UI enforces email verification. Off by default, matching the
 * official Laravel starter kit (which ships `MustVerifyEmail` commented out).
 *
 * To require email verification:
 *   1. set this to `true`, and
 *   2. uncomment the `MustVerifyEmail` contract on the `User` model
 *      (app/Models/User.php) so Fortify sends verification emails.
 */
export const MUST_VERIFY_EMAIL: boolean = false;
