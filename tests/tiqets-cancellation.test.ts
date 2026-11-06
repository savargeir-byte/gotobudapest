import assert from "node:assert/strict";
import test from "node:test";
import { isFlexiblePolicy } from "../lib/marketplace/util";

test("only a policy that says flexible or refundable counts as free cancellation; non-refundable never does", () => {
  for (const p of ["flexible", "refundable", "full_refund", "Free refund up to 24h"]) assert.equal(isFlexiblePolicy(p), true, p);
  for (const p of ["non-refundable", "non_refundable", "nonrefundable", "no refund", "not refundable", "never", "", "standard"]) assert.equal(isFlexiblePolicy(p), false, p);
});
