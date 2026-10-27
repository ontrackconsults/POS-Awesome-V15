// @vitest-environment jsdom

import { beforeEach, describe, expect, it, vi } from "vitest";
import { createPinia, setActivePinia } from "pinia";
import { defineComponent } from "vue";
import { mount } from "@vue/test-utils";

import { useSwitchPosProfile } from "../src/posapp/composables/pos/shared/useSwitchPosProfile";
import { useUIStore } from "../src/posapp/stores/uiStore";
import { useToastStore } from "../src/posapp/stores/toastStore";

vi.mock("../src/offline/index", () => ({
	setOpeningStorage: vi.fn(),
}));

describe("useSwitchPosProfile", () => {
	beforeEach(() => {
		setActivePinia(createPinia());
		vi.stubGlobal("__", (value: string) => value);
		vi.stubGlobal("frappe", {
			session: { user: "cashier@example.com" },
			boot: { sysdefaults: { company: "Test Co", currency: "GHS" } },
			call: vi.fn(),
		});
	});

	const mountComposable = () => {
		let api: ReturnType<typeof useSwitchPosProfile> | null = null;
		const Comp = defineComponent({
			setup() {
				api = useSwitchPosProfile();
				return () => null;
			},
		});
		mount(Comp);
		return api!;
	};

	it("loads assigned POS profiles when opening the switch dialog", async () => {
		(window as any).frappe.call.mockResolvedValue({
			message: [
				{ name: "Accra Branch", company: "Test Co", currency: "GHS" },
				{ name: "Kumasi Branch", company: "Test Co", currency: "GHS" },
			],
		});
		const uiStore = useUIStore();
		uiStore.setPosProfile({ name: "Accra Branch", company: "Test Co", currency: "GHS" } as any);

		const api = mountComposable();
		await api.handleChangePosProfile();

		expect(api.showPosProfileDialog.value).toBe(true);
		expect((window as any).frappe.call).toHaveBeenCalledWith({
			method: "posawesome.posawesome.api.utilities.get_available_pos_profiles",
			args: { company: "Test Co", currency: "GHS" },
		});
		expect(api.availablePosProfiles.value.map((profile) => profile.name)).toEqual([
			"Accra Branch",
			"Kumasi Branch",
		]);
	});

	it("closes the current shift and opens the selected branch", async () => {
		const reload = vi.fn();
		vi.stubGlobal("location", { reload });
		vi.useFakeTimers();

		(window as any).frappe.call.mockImplementation(async (method: string, args?: any) => {
			const name = typeof method === "string" ? method : method?.method;
			if (name?.includes("check_opening_shift")) {
				return {
					message: {
						pos_opening_shift: {
							name: "SHIFT-1",
							balance_details: [{ mode_of_payment: "Cash", amount: 0 }],
						},
					},
				};
			}
			if (name?.includes("make_closing_shift_from_opening")) {
				return { message: { name: "CLOSING-1" } };
			}
			if (name?.includes("submit_closing_shift")) {
				return { message: { name: "CLOSING-1" } };
			}
			if (name?.includes("create_opening_voucher")) {
				expect(args.pos_profile).toBe("Kumasi Branch");
				return {
					message: {
						pos_profile: { name: "Kumasi Branch", company: "Test Co" },
						pos_opening_shift: { name: "SHIFT-2" },
						company: { name: "Test Co" },
					},
				};
			}
			return { message: [] };
		});

		const uiStore = useUIStore();
		uiStore.setPosProfile({ name: "Accra Branch", company: "Test Co", currency: "GHS" } as any);
		uiStore.setRegisterData({
			pos_opening_shift: { name: "SHIFT-1", balance_details: [] },
		});

		const api = mountComposable();
		api.availablePosProfiles.value = [
			{ name: "Accra Branch", company: "Test Co" },
			{ name: "Kumasi Branch", company: "Test Co" },
		];
		api.selectedPosProfile.value = "Kumasi Branch";
		await api.switchPosProfile();

		expect(useUIStore().posProfile?.name).toBe("Kumasi Branch");
		expect(useToastStore().history[0]?.title).toBe("Branch switched successfully");
		vi.runAllTimers();
		expect(reload).toHaveBeenCalled();
		vi.useRealTimers();
	});
});
