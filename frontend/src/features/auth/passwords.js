export const MIN_PASSWORD_LENGTH = 8;

/** Client-side checks that don't need a round trip. The server re-validates length. */
export function passwordPairError({ password, confirmPassword }) {
  if (password.length < MIN_PASSWORD_LENGTH)
    return `Password must be at least ${MIN_PASSWORD_LENGTH} characters.`;
  if (password !== confirmPassword) return "Passwords don't match.";
  return null;
}
