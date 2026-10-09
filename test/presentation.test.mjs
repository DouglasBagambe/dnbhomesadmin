import test from "node:test";
import assert from "node:assert/strict";
import {
  safeNext,
  canAccess,
  ugandaDate,
  friendlyError,
} from "../lib/presentation.mjs";
test("redirects accept internal destinations and reject external or browser-normalized escape paths", () => {
  for (const value of [
    null,
    "https://evil.example",
    "//evil.example",
    "/\\evil.example",
    "/\nevil",
  ])
    assert.equal(safeNext(value), "/dashboard");
  assert.equal(
    safeNext("/properties?status=draft"),
    "/properties?status=draft",
  );
});
test("operations navigation preserves the complete role matrix", () => {
  const routes = [
    "/dashboard",
    "/properties",
    "/agents",
    "/agencies",
    "/bookings",
    "/inquiries",
    "/audit",
    "/admins",
  ];
  const policy = {
    editor: ["/dashboard", "/properties"],
    admin: [
      "/dashboard",
      "/properties",
      "/agents",
      "/agencies",
      "/bookings",
      "/inquiries",
      "/audit",
    ],
    super_admin: [
      "/dashboard",
      "/properties",
      "/agents",
      "/agencies",
      "/bookings",
      "/inquiries",
      "/audit",
      "/admins",
    ],
  };
  for (const [role, allowed] of Object.entries(policy))
    for (const href of routes)
      assert.equal(
        canAccess(role, href),
        allowed.includes(href),
        `${role} ${href}`,
      );
  assert.equal(canAccess(undefined, "/dashboard"), false);
});
test("viewings display Uganda time regardless of host timezone", () => {
  assert.match(ugandaDate("2026-10-20T09:30:00Z", true), /12:30/);
  assert.equal(ugandaDate("invalid"), "—");
});
test("UI errors never reveal backend credentials, URLs or stack content", () => {
  const value = friendlyError(
    new Error("mongodb://secret:password@internal:27017 Stack trace"),
  );
  assert.equal(value, "Unable to complete this request. Please try again.");
  assert.match(friendlyError(new Error("Session expired")), /sign in/);
});
