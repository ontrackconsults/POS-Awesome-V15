<template>
	<v-dialog v-model="isOpen" max-width="600px" persistent>
		<v-card class="pos-themed-card">
			<v-card-title class="text-h6 d-flex align-center">
				<v-icon start color="primary" class="mr-2">mdi-storefront-outline</v-icon>
				{{ __("Switch Branch") }}
			</v-card-title>
			<v-card-text>
				<div class="text-body-2 mb-3">
					{{ __("Select a POS Profile to switch this terminal to another branch.") }}
				</div>
				<v-autocomplete
					:model-value="selectedPosProfile"
					:items="availablePosProfiles"
					item-title="name"
					item-value="name"
					:label="__('POS Profile')"
					variant="outlined"
					density="compact"
					:loading="loadingPosProfiles"
					:disabled="loadingPosProfiles"
					clearable
					data-test="switch-branch-profile"
					@update:model-value="$emit('update:selectedPosProfile', $event)"
				>
					<template #item="{ item, props }">
						<v-list-item v-bind="props">
							<template #prepend>
								<v-icon :color="item.raw.name === currentProfileName ? 'primary' : 'grey'">
									{{
										item.raw.name === currentProfileName
											? "mdi-check-circle"
											: "mdi-circle-outline"
									}}
								</v-icon>
							</template>
							<v-list-item-title>
								{{ item.raw.name }}
							</v-list-item-title>
							<v-list-item-subtitle v-if="item.raw.company">
								{{ item.raw.company }}
							</v-list-item-subtitle>
						</v-list-item>
					</template>
				</v-autocomplete>
				<v-alert
					v-if="selectedPosProfile && selectedPosProfile !== currentProfileName"
					type="info"
					variant="tonal"
					density="compact"
					class="mt-3"
				>
					{{ __("Switching to") }}: <strong>{{ selectedPosProfile }}</strong>
				</v-alert>
			</v-card-text>
			<v-card-actions class="pa-4 pt-0">
				<v-spacer />
				<v-btn
					color="error"
					variant="text"
					:disabled="loadingPosProfiles"
					@click="$emit('close')"
				>
					{{ __("Cancel") }}
				</v-btn>
				<v-btn
					color="primary"
					variant="elevated"
					:disabled="!canSwitch"
					:loading="loadingPosProfiles"
					data-test="switch-branch-confirm"
					@click="$emit('switch')"
				>
					{{ __("Switch Branch") }}
				</v-btn>
			</v-card-actions>
		</v-card>
	</v-dialog>
</template>

<script>
export default {
	name: "SwitchPosProfileDialog",
	props: {
		modelValue: {
			type: Boolean,
			default: false,
		},
		selectedPosProfile: {
			type: String,
			default: null,
		},
		availablePosProfiles: {
			type: Array,
			default: () => [],
		},
		loadingPosProfiles: {
			type: Boolean,
			default: false,
		},
		currentProfileName: {
			type: String,
			default: "",
		},
	},
	emits: ["update:modelValue", "update:selectedPosProfile", "close", "switch"],
	computed: {
		isOpen: {
			get() {
				return this.modelValue;
			},
			set(value) {
				this.$emit("update:modelValue", value);
			},
		},
		canSwitch() {
			return Boolean(
				this.selectedPosProfile &&
					this.selectedPosProfile !== this.currentProfileName &&
					!this.loadingPosProfiles,
			);
		},
	},
};
</script>
