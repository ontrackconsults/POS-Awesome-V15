<template>
	<v-menu
		v-model="open"
		location="bottom start"
		:close-on-content-click="false"
		:offset="4"
		:z-index="2500"
		content-class="posa-cart-staff-menu"
	>
		<template #activator="{ props: activatorProps }">
			<button
				v-bind="activatorProps"
				type="button"
				class="posa-cart-table__editor-display posa-cart-staff-trigger"
				:class="{
					'posa-cart-staff-trigger--empty': !selectedLabel,
					'posa-cart-staff-trigger--required': required && !selectedLabel,
					'posa-cart-staff-trigger--open': open,
				}"
				:aria-label="ariaLabel"
				:aria-expanded="open ? 'true' : 'false'"
				data-posa-row-control="service-staff"
				@click.stop
				@mousedown.stop
				@pointerdown.stop
			>
				<v-icon size="16" class="posa-cart-staff-trigger__icon">mdi-account-outline</v-icon>
				<span class="posa-cart-staff-trigger__name">{{ selectedLabel || emptyText }}</span>
				<v-icon size="16" class="posa-cart-staff-trigger__chevron">mdi-chevron-down</v-icon>
			</button>
		</template>

		<v-card class="posa-cart-staff-panel pos-themed-card" @click.stop @mousedown.stop @pointerdown.stop>
			<div class="posa-cart-staff-panel__search">
				<v-text-field
					ref="searchField"
					v-model="query"
					density="compact"
					variant="outlined"
					hide-details
					clearable
					:placeholder="__('Search staff')"
					prepend-inner-icon="mdi-magnify"
					class="pos-themed-input posa-cart-staff-search"
					@keydown.esc.stop.prevent="open = false"
				/>
			</div>
			<v-list density="compact" class="posa-cart-staff-list" role="listbox">
				<v-list-item
					v-if="modelValue"
					class="posa-cart-staff-clear"
					role="option"
					@click="select('')"
				>
					<template #prepend>
						<v-icon size="18">mdi-close</v-icon>
					</template>
					<v-list-item-title>{{ __("Clear") }}</v-list-item-title>
				</v-list-item>
				<v-list-item
					v-for="person in filteredPersons"
					:key="personKey(person)"
					:active="isSelected(person)"
					role="option"
					:aria-selected="isSelected(person) ? 'true' : 'false'"
					@click="select(personValue(person))"
				>
					<template #prepend>
						<v-icon size="18">mdi-account-outline</v-icon>
					</template>
					<v-list-item-title>{{ personLabel(person) }}</v-list-item-title>
				</v-list-item>
				<v-list-item v-if="!filteredPersons.length" disabled>
					<v-list-item-title>{{ __("No staff found") }}</v-list-item-title>
				</v-list-item>
			</v-list>
		</v-card>
	</v-menu>
</template>

<script setup lang="ts">
import { computed, nextTick, ref, watch, type PropType } from "vue";

const __ = (window as any).__ || ((text: string) => text);

type SalesPersonOption = {
	name?: string;
	value?: string;
	sales_person_name?: string;
	title?: string;
};

const props = defineProps({
	modelValue: {
		type: String,
		default: "",
	},
	salesPersons: {
		type: Array as PropType<SalesPersonOption[]>,
		default: () => [],
	},
	label: {
		type: String,
		default: "",
	},
	required: Boolean,
});

const emit = defineEmits(["update:modelValue"]);

const open = ref(false);
const query = ref("");
const searchField = ref<{ focus?: () => void; $el?: HTMLElement } | null>(null);

const emptyText = computed(() => __("Select"));
const ariaLabel = computed(() => props.label || __("Service Staff"));

const personValue = (person: SalesPersonOption) => person?.name || person?.value || "";
const personLabel = (person: SalesPersonOption) =>
	person?.sales_person_name || person?.title || person?.name || person?.value || "";
const personKey = (person: SalesPersonOption) => personValue(person) || personLabel(person);

const isSelected = (person: SalesPersonOption) => {
	const value = String(props.modelValue || "");
	return Boolean(value) && (personValue(person) === value || personLabel(person) === value);
};

const selectedLabel = computed(() => {
	const value = String(props.modelValue || "");
	if (!value) {
		return "";
	}
	const match = (props.salesPersons || []).find(
		(person) => personValue(person) === value || personLabel(person) === value,
	);
	return match ? personLabel(match) : value;
});

const filteredPersons = computed(() => {
	const term = query.value.trim().toLowerCase();
	const people = Array.isArray(props.salesPersons) ? props.salesPersons : [];
	if (!term) {
		return people;
	}
	return people.filter((person) => {
		const haystack = `${personLabel(person)} ${personValue(person)}`.toLowerCase();
		return haystack.includes(term);
	});
});

const focusSearch = async () => {
	await nextTick();
	const field = searchField.value;
	if (field?.focus) {
		field.focus();
		return;
	}
	const input = field?.$el?.querySelector?.("input") as HTMLInputElement | null;
	input?.focus?.();
};

const select = (value: string) => {
	emit("update:modelValue", value);
	query.value = "";
	open.value = false;
};

watch(open, (isOpen) => {
	if (isOpen) {
		query.value = "";
		focusSearch();
		return;
	}
	query.value = "";
});
</script>
