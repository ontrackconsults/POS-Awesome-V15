import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

const testsDir = path.dirname(fileURLToPath(import.meta.url));
const frontendDir = path.resolve(testsDir, "..");
const source = (...segments: string[]) =>
	readFileSync(path.join(frontendDir, "src", "posapp", ...segments), "utf8");

describe("CartStaffSelect", () => {
	it("uses a compact cart trigger instead of a labeled autocomplete", () => {
		const picker = source("components", "pos", "invoice", "CartStaffSelect.vue");
		const row = source("components", "pos", "invoice", "CartItemRow.vue");
		const styles = source(
			"components",
			"pos",
			"invoice",
			"items-table-styles.css",
		);

		expect(picker).toContain("posa-cart-staff-trigger");
		expect(picker).toContain("{{ selectedLabel || emptyText }}");
		expect(picker).toContain("Search staff");
		expect(picker).not.toContain("v-autocomplete");
		expect(row).toContain("<CartStaffSelect");
		expect(row).not.toContain("posa-cart-staff-select");
		expect(styles).toContain(".posa-cart-staff-trigger");
		expect(styles).toContain(".posa-cart-table__editor-display");
	});
});
