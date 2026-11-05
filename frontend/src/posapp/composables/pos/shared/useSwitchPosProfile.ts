import { computed, getCurrentInstance, inject, ref } from "vue";
import { storeToRefs } from "pinia";

import { setOpeningStorage } from "../../../../offline/index";
import { useToastStore } from "../../../stores/toastStore.js";
import { useUIStore } from "../../../stores/uiStore.js";
import {
	buildSkippedClosingInvoicesPrompt,
	normalizeClosingShiftPreparationResponse,
} from "./usePosShift";

declare const frappe: any;

type PosProfileOption = {
	name: string;
	company?: string;
	currency?: string;
};

function callErrorMessage(error: any, fallback: string) {
	return (
		error?.message ||
		error?._server_messages ||
		fallback
	);
}

export function useSwitchPosProfile() {
	const instance = getCurrentInstance();
	const proxy: any = instance?.proxy;
	const eventBus: any = proxy?.eventBus || inject("eventBus");
	const toastStore = useToastStore();
	const uiStore = useUIStore();
	const { posProfile, posOpeningShift } = storeToRefs(uiStore);

	const showPosProfileDialog = ref(false);
	const selectedPosProfile = ref<string | null>(null);
	const availablePosProfiles = ref<PosProfileOption[]>([]);
	const loadingPosProfiles = ref(false);

	const currentProfileName = computed(() => posProfile.value?.name || "");

	function closePosProfileDialog() {
		showPosProfileDialog.value = false;
		selectedPosProfile.value = null;
	}

	async function loadAvailablePosProfiles() {
		loadingPosProfiles.value = true;
		try {
			const r = await frappe.call({
				method: "posawesome.posawesome.api.utilities.get_available_pos_profiles",
				args: {
					company: posProfile.value?.company || frappe.boot?.sysdefaults?.company,
					currency: posProfile.value?.currency || frappe.boot?.sysdefaults?.currency,
				},
			});
			availablePosProfiles.value = Array.isArray(r.message) ? r.message : [];
		} catch (error) {
			console.error("Failed to load POS profiles:", error);
			toastStore.show({
				title: __("Failed to load POS profiles"),
				color: "error",
			});
		} finally {
			loadingPosProfiles.value = false;
		}
	}

	function handleChangePosProfile() {
		showPosProfileDialog.value = true;
		selectedPosProfile.value = currentProfileName.value || null;
		return loadAvailablePosProfiles();
	}

	function resolveOpeningShift(shiftResponse: any) {
		if (
			shiftResponse?.message &&
			shiftResponse.message !== "" &&
			shiftResponse.message.pos_opening_shift
		) {
			return shiftResponse.message.pos_opening_shift;
		}
		if (posOpeningShift.value && Object.keys(posOpeningShift.value).length > 0) {
			return posOpeningShift.value;
		}
		if (
			posProfile.value?.pos_opening_shift &&
			Object.keys(posProfile.value.pos_opening_shift).length > 0
		) {
			return posProfile.value.pos_opening_shift;
		}
		return null;
	}

	function selectedCompany() {
		const selected = availablePosProfiles.value.find(
			(profile) => profile.name === selectedPosProfile.value,
		);
		return (
			selected?.company ||
			posProfile.value?.company ||
			frappe.boot?.sysdefaults?.company
		);
	}

	function applySwitchedProfile(data: any) {
		if (!data) {
			return;
		}
		uiStore.setRegisterData(data);
		setOpeningStorage(data);
		eventBus?.emit("register_pos_profile", data);
		if (data.company) {
			eventBus?.emit("set_company", data.company);
		}
		closePosProfileDialog();
		toastStore.show({
			title: __("Branch switched successfully"),
			color: "success",
		});
		window.setTimeout(() => {
			window.location.reload();
		}, 400);
	}

	async function createOpeningForSelectedProfile(balanceDetails: any[]) {
		const newOpeningData = await frappe.call(
			"posawesome.posawesome.api.shifts.create_opening_voucher",
			{
				pos_profile: selectedPosProfile.value,
				company: selectedCompany(),
				balance_details: JSON.stringify(balanceDetails || []),
			},
		);
		if (newOpeningData.message) {
			applySwitchedProfile(newOpeningData.message);
			return true;
		}
		return false;
	}

	async function createNewOpeningShift() {
		try {
			await createOpeningForSelectedProfile([]);
		} catch (error) {
			console.error("Failed to create new opening shift:", error);
			toastStore.show({
				title: __("Failed to create new opening shift"),
				detail: callErrorMessage(error, __("Unknown error")),
				color: "error",
			});
		} finally {
			loadingPosProfiles.value = false;
		}
	}

	async function switchPosProfile() {
		if (!selectedPosProfile.value || selectedPosProfile.value === currentProfileName.value) {
			return;
		}

		loadingPosProfiles.value = true;
		try {
			const currentShiftData = await frappe.call(
				"posawesome.posawesome.api.shifts.check_opening_shift",
				{
					user: frappe.session.user,
				},
			);
			const openingShiftData = resolveOpeningShift(currentShiftData);
			if (!openingShiftData) {
				await createNewOpeningShift();
				return;
			}

			const balanceDetails = Array.isArray(openingShiftData.balance_details)
				? openingShiftData.balance_details
				: [];
			const closingData = await frappe.call(
				"posawesome.posawesome.doctype.pos_closing_shift.pos_closing_shift.make_closing_shift_from_opening",
				{
					opening_shift: JSON.stringify(openingShiftData),
				},
			);

			const closingResponse = normalizeClosingShiftPreparationResponse(closingData.message);
			const closingShift = closingResponse.closing_shift;
			if (!closingShift) {
				toastStore.show({
					title: __("Failed to prepare closing shift"),
					color: "error",
				});
				return;
			}

			const skippedPrintedInvoices = Array.isArray(closingResponse.skipped_printed_invoices)
				? closingResponse.skipped_printed_invoices
				: [];
			if (skippedPrintedInvoices.length) {
				const confirmed = window.confirm(buildSkippedClosingInvoicesPrompt(skippedPrintedInvoices));
				if (!confirmed) {
					return;
				}
			}

			await frappe.call(
				"posawesome.posawesome.doctype.pos_closing_shift.pos_closing_shift.submit_closing_shift",
				{
					closing_shift: JSON.stringify(closingShift),
				},
			);

			try {
				await createOpeningForSelectedProfile(balanceDetails);
			} catch (openError) {
				console.warn(
					"Opening shift with previous balances failed; retrying empty balances",
					openError,
				);
				await createOpeningForSelectedProfile([]);
			}
		} catch (error) {
			console.error("Failed to switch POS profile:", error);
			toastStore.show({
				title: __("Failed to switch branch"),
				detail: callErrorMessage(error, __("Unknown error")),
				color: "error",
			});
		} finally {
			loadingPosProfiles.value = false;
		}
	}

	return {
		showPosProfileDialog,
		selectedPosProfile,
		availablePosProfiles,
		loadingPosProfiles,
		currentProfileName,
		handleChangePosProfile,
		closePosProfileDialog,
		switchPosProfile,
	};
}
