import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import vm from "node:vm";
import { fileURLToPath } from "node:url";

const repositoryRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const scriptPath = path.join(
	repositoryRoot,
	"posawesome",
	"posawesome",
	"api",
	"pos_profile.js",
);

async function loadPosProfileHandlers() {
	const source = await readFile(scriptPath, "utf8");
	let handlers;
	const frappe = {
		call() {},
		ui: {
			form: {
				on(doctype, events) {
					assert.equal(doctype, "POS Profile");
					handlers = events;
				},
			},
		},
	};

	vm.runInNewContext(source, { frappe }, { filename: scriptPath });
	return handlers;
}

function makeForm(fields_dict) {
	const calls = [];
	return {
		calls,
		fields_dict,
		set_query(fieldname, tableFieldname, queryFactory) {
			if (queryFactory) {
				// Match Frappe v16's child-table path, which throws if the grid is unavailable.
				this.fields_dict[tableFieldname].grid.get_field(fieldname).get_query =
					queryFactory;
				calls.push([fieldname, tableFieldname, queryFactory]);
				return;
			}

			if (this.fields_dict[fieldname]) {
				this.fields_dict[fieldname].get_query = tableFieldname;
				calls.push([fieldname, tableFieldname]);
			}
		},
	};
}

test("POS Profile setup tolerates optional fields and uninitialized grids", async () => {
	const handlers = await loadPosProfileHandlers();
	const frm = makeForm({
		posa_allowed_expense_accounts: {},
		posa_allowed_source_accounts: {},
	});

	assert.doesNotThrow(() => handlers.setup(frm));
	assert.deepEqual(frm.calls, []);
});

test("POS Profile refresh installs queries after grids initialize", async () => {
	const handlers = await loadPosProfileHandlers();
	const childFields = {
		posa_allowed_expense_accounts: {
			grid: { get_field: () => ({}) },
		},
		posa_allowed_source_accounts: {
			grid: { get_field: () => ({}) },
		},
	};
	const frm = makeForm({
		posa_cash_mode_of_payment: {},
		posa_default_expense_account: {},
		posa_back_office_cash_account: {},
		posa_default_source_account: {},
		posa_gift_card_liability_account: {},
		...childFields,
	});

	handlers.refresh(frm);

	assert.equal(frm.calls.length, 7);
	assert.deepEqual({ ...frm.calls[0][1]().filters }, { type: "Cash" });
	assert.deepEqual({ ...frm.calls[1][1]({ company: "Acme" }).filters }, {
		company: "Acme",
		is_group: 0,
		root_type: "Expense",
	});
	assert.deepEqual({ ...frm.calls[5][2]({ company: "Acme" }).filters }, {
		company: "Acme",
		is_group: 0,
		root_type: "Expense",
	});
	assert.deepEqual({ ...frm.calls[6][2]({ company: "Acme" }).filters }, {
		company: "Acme",
		is_group: 0,
		account_type: "Cash",
	});
});

test("POS Profile print format queries include POS Invoice and Sales Invoice", async () => {
	const handlers = await loadPosProfileHandlers();
	const frm = makeForm({
		print_format: {},
		print_format_for_online: {},
		print_format_copy: {},
		si_print_format: {},
		posa_print_format_rules: {
			grid: { get_field: () => ({}) },
		},
	});

	handlers.refresh(frm);

	const expected = [["Print Format", "doc_type", "in", ["POS Invoice", "Sales Invoice"]]];
	assert.equal(frm.calls.length, 5);
	for (const call of frm.calls) {
		const query = call.length === 3 ? call[2] : call[1];
		assert.deepEqual(JSON.parse(JSON.stringify(query().filters)), expected);
	}
	assert.deepEqual(
		frm.calls.map((call) => call[0]),
		[
			"print_format",
			"print_format_for_online",
			"print_format_copy",
			"si_print_format",
			"print_format",
		],
	);
	assert.equal(frm.calls[4][1], "posa_print_format_rules");
});
