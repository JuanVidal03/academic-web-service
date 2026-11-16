/**
 * Display helpers for the signed-in account.
 *
 * The `User` contract carries no display name -- only an email, a role and a flag -- so
 * everything shown about a person is derived from the email's local part.
 */

/** Separators used in institutional addresses: `juan.vidal`, `juan_vidal`, `juan-vidal`. */
const SEPARATORS = /[.\-_+\s]+/;

/**
 * Up to two uppercase initials for the avatar.
 *
 * Replaces the shadcn placeholder "CN", which showed the same two letters for everyone.
 * A dotted local part gives one letter per word (`juan.vidal` -> JV); a single word gives
 * its first two letters (`test` -> TE), because one letter in a 32px circle reads as an
 * accident rather than a name.
 */
export const initialsFrom = (nameOrEmail: string | null | undefined): string => {
  const local = (nameOrEmail ?? "").trim().split("@")[0];
  if (local === "") {
    return "?";
  }

  const words = local.split(SEPARATORS).filter((word) => word.length > 0);
  if (words.length === 0) {
    return "?";
  }
  if (words.length === 1) {
    return words[0].slice(0, 2).toUpperCase();
  }
  return (words[0][0] + words[1][0]).toUpperCase();
};

/** The email's local part, which is the closest thing to a name we hold. */
export const displayNameFrom = (email: string | null | undefined): string => {
  const local = (email ?? "").trim().split("@")[0];
  return local === "" ? "Usuario" : local;
};
