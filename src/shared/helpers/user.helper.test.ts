import { describe, expect, it } from "vitest";

import { displayNameFrom, initialsFrom } from "@/shared/helpers/user.helper";

describe("initialsFrom", () => {
  it("takes one letter per word from a dotted address", () => {
    expect(initialsFrom("juan.vidal@universidad.edu.co")).toBe("JV");
  });

  it.each([
    ["juan_vidal@x.co", "JV"],
    ["juan-vidal@x.co", "JV"],
    ["juan+vidal@x.co", "JV"]
  ])("handles %s", (email, expected) => {
    expect(initialsFrom(email)).toBe(expected);
  });

  it("takes the first two letters of a single-word address", () => {
    // One letter in a small circle reads as an accident rather than a name.
    expect(initialsFrom("test@universidad.edu.co")).toBe("TE");
    expect(initialsFrom("adviser@universidad.edu.co")).toBe("AD");
  });

  it("uses only the first two words of a longer name", () => {
    expect(initialsFrom("ana.maria.lopez@x.co")).toBe("AM");
  });

  it("works on a bare name with no address", () => {
    expect(initialsFrom("Administrador")).toBe("AD");
  });

  it("uppercases regardless of input", () => {
    expect(initialsFrom("JUAN.vidal@x.co")).toBe("JV");
  });

  it("falls back to ? rather than rendering an empty circle", () => {
    // An avatar with no letters looks broken; the account menu still has to render.
    for (const value of ["", "   ", "@universidad.edu.co", null, undefined]) {
      expect(initialsFrom(value)).toBe("?");
    }
  });

  it("survives a one-letter local part", () => {
    expect(initialsFrom("a@x.co")).toBe("A");
  });
});

describe("displayNameFrom", () => {
  it("returns the local part", () => {
    expect(displayNameFrom("juan.vidal@universidad.edu.co")).toBe("juan.vidal");
  });

  it("falls back for a missing email", () => {
    expect(displayNameFrom(null)).toBe("Usuario");
    expect(displayNameFrom("")).toBe("Usuario");
  });
});
