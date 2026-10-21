import test from "node:test";
import assert from "node:assert/strict";
import { whatsappUrl, unusualTransition } from "../lib/operations.mjs";
import { friendlyError } from "../lib/presentation.mjs";
test("contact actions accept valid international or Uganda mobile numbers and reject arbitrary links", () => {
  assert.equal(whatsappUrl("+256 700 000 001"), "https://wa.me/256700000001");
  assert.equal(whatsappUrl("0700000001"), "https://wa.me/256700000001");
  for (const value of ["abc", "javascript:alert(1)", "123", "+0123456789"])
    assert.equal(whatsappUrl(value), null);
});
test("viewing outcome reversals require an intentional override", () => {
  assert.equal(unusualTransition("pending", "confirmed"), false);
  assert.equal(unusualTransition("completed", "pending"), true);
  assert.equal(unusualTransition("rejected", "completed"), true);
  assert.equal(unusualTransition("confirmed", "pending"), true);
  assert.equal(unusualTransition("completed", "completed"), false);
});
test("safe backend validation is visible while arbitrary internal errors remain hidden", () => {
  const safe = new Error("Choose an active agency");
  safe.safeMessage = true;
  assert.equal(friendlyError(safe), "Choose an active agency");
  assert.equal(
    friendlyError(new Error("private database connection value")),
    "Unable to complete this request. Please try again.",
  );
});
