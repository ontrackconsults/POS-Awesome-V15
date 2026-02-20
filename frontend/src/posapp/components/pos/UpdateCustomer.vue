<template>
	<v-row justify="center">
		<v-dialog v-model="customerDialog" max-width="600px" persistent>
			<v-card>
				<v-card-title class="d-flex align-center">
					<span v-if="customer_id" class="text-h5 text-primary">{{ __("Update Customer") }}</span>
					<span v-else class="text-h5 text-primary">{{ __("Create Customer") }}</span>
					<v-spacer></v-spacer>
					<v-switch
						v-model="hideNonEssential"
						density="compact"
						inset
						hide-details
						color="primary"
						:label="__('Hide Non Essential Fields')"
					></v-switch>
				</v-card-title>
				<v-card-text class="pa-0">
					<v-container>
						<v-row>
							<v-col cols="12">
								<v-text-field
									density="compact"
									color="primary"
									:label="frappe._('Customer Name') + ' *'"
									hide-details
									class="pos-themed-input"
									v-model="custom_customer_name"
									readonly
									
									
								></v-text-field>
							</v-col>
							<v-col cols="6">
								<v-text-field
									density="compact"
									color="primary"
									:label="frappe._('Customer First Name') + ' *'"
									hide-details
									class="pos-themed-input"
									v-model="customer_first_name"
									required
									@input="updateCustomerName"
								></v-text-field>
							</v-col>
							<v-col cols="6">
								<v-text-field
									density="compact"
									color="primary"
									:label="frappe._('Customer Last Name') + ' *'"
									hide-details
									class="pos-themed-input"
									v-model="customer_last_name"
									required
									@input="updateCustomerName"
								></v-text-field>
							</v-col>
							<!-- <v-col cols="6">
								<v-text-field
									density="compact"
									color="primary"
									:label="frappe._('Tax ID')" 
									class="pos-themed-input"
									hide-details
									v-model="tax_id"
								></v-text-field>
							</v-col> -->
							<v-col cols="6">
								<v-text-field
									density="compact"
									color="primary"
									:label="frappe._('Mobile No') + ' *'"
									class="pos-themed-input"
									:error="mobileNoError"
									:error-messages="mobileNoError ? mobileNoErrorMessage : ''"
									v-model="mobile_no"
									required
									type="tel"
									@input="limitMobileNoForGhana"
								></v-text-field>
							</v-col>
							<v-col cols="12" v-if="!hideNonEssential">
								<v-text-field
									density="compact"
									color="primary"
									:label="__('Address Line 1')"
									hide-details
									class="pos-themed-input"
									v-model="address_line1"
								></v-text-field>
							</v-col>

							<v-col cols="12" sm="6" v-if="!hideNonEssential">
								<v-text-field
									v-model="city"
									variant="outlined"
									density="compact"
									:label="__('City')"
									class="pos-themed-input"
								></v-text-field>
							</v-col>

							<v-col cols="6">
								<v-select
									v-model="custom_country_name"
									:items="countries"
									variant="outlined"
									density="compact"
									:label="__('Country') + ' *'"
									class="pos-themed-input"
									required
									@update:model-value="updateCountryCode"
									
								></v-select>
							</v-col>
							<v-col cols="6">
								<v-text-field
									density="compact"
									color="primary"
									:label="frappe._('Country Code')"
									hide-details
									class="pos-themed-input"
									v-model="custom_country_code"
									readonly
								></v-text-field>
							</v-col>

							<!-- <v-col cols="6">
								<v-text-field
									density="compact"
									color="primary"
									:label="frappe._('Email Id')"
									class="pos-themed-input"
									hide-details
									v-model="email_id"
								></v-text-field>
							</v-col> -->
							<v-col cols="6">
								<v-select
									density="compact"
									label="Gender"
									:items="genders"
									v-model="gender"
									class="pos-themed-input"
								></v-select>¬
							</v-col>
							<v-col cols="6">
								<v-text-field
									density="compact"
									color="primary"
									:label="frappe._('Referral Code')"
									class="pos-themed-input"
									hide-details
									v-model="referral_code"
								></v-text-field>
							</v-col>
							<v-col cols="6">
								<v-text-field
									v-model="birthday"
									:label="frappe._('Birthday (DD-MM-YYYY)')"
									density="compact"
									clearable
									hide-details
									color="primary"
									placeholder="DD-MM-YYYY"
									@update:model-value="formatBirthdayOnInput"
									class="pos-themed-input"
								></v-text-field>
							</v-col>
							<v-col cols="6">
								<v-autocomplete
									clearable
									density="compact"
									auto-select-first
									color="primary"
									:label="frappe._('Customer Group') + ' *'"
									v-model="group"
									:items="groups"
									class="pos-themed-input"
									:no-data-text="__('Group not found')"
									hide-details
									required
									@update:model-value="handleGroupChange"
								>
								</v-autocomplete>
							</v-col>
							<v-col cols="6">
								<v-autocomplete
									clearable
									density="compact"
									auto-select-first
									color="primary"
									:label="frappe._('Territory') + ' *'"
									v-model="territory"
									:items="territorys"
									class="pos-themed-input"
									:no-data-text="__('Territory not found')"
									hide-details
									required
								>
								</v-autocomplete>
							</v-col>
							<v-col cols="6" v-if="loyalty_program">
								<v-text-field
									v-model="loyalty_program"
									:label="frappe._('Loyalty Program')"
									density="compact"
									readonly
									hide-details
									class="pos-themed-input"
								></v-text-field>
							</v-col>
							<v-col cols="6" v-if="loyalty_points">
								<v-text-field
									v-model="loyalty_points"
									:label="frappe._('Loyalty Points')"
									density="compact"
									readonly
									hide-details
									class="pos-themed-input"
								></v-text-field>
							</v-col>
							<v-col cols="6" v-if="reqd_customer_id">
								<v-text-field
									density="compact"
									color="primary"
									:label="frappe._('Customer ID') + ' *'"
									hide-details
									class="pos-themed-input"
									v-model="custom_customer_id"
									required
								></v-text-field>
							</v-col>
							<v-col cols="6" v-else>
								<v-text-field
									density="compact"
									color="primary"
									:label="frappe._('Customer ID')"
									hide-details
									class="pos-themed-input"
									v-model="custom_customer_id"
								></v-text-field>
							</v-col>
						</v-row>
					</v-container>
				</v-card-text>
				<v-card-actions>
					<v-spacer></v-spacer>
					<v-btn color="error" theme="dark" @click="confirm_close">{{ __("Close") }}</v-btn>
					<v-btn color="success" theme="dark" @click="submit_dialog">{{ __("Submit") }}</v-btn>
				</v-card-actions>
			</v-card>
		</v-dialog>

		<!-- Confirmation Dialog -->
		<v-dialog v-model="confirmDialog" max-width="400px">
			<v-card>
				<v-card-title class="text-h5 text-primary">
					{{ __("Confirm Close") }}
				</v-card-title>
				<v-card-text>
					{{ __("Are you sure you want to close? All entered data will be lost.") }}
				</v-card-text>
				<v-card-actions>
					<v-spacer></v-spacer>
					<v-btn color="primary" @click="confirmDialog = false">
						{{ __("Continue Editing") }}
					</v-btn>
					<v-btn color="error" @click="confirmClose">
						{{ __("Yes, Close") }}
					</v-btn>
				</v-card-actions>
			</v-card>
		</v-dialog>
	</v-row>
</template>

<script>
import { isOffline, saveOfflineCustomer } from "../../../offline/index.js";
import { useCustomersStore } from "../../stores/customersStore.js";

export default {
	data: () => ({
		customerDialog: false,
		confirmDialog: false,
		pos_profile: "",
		customer_id: "",
		customer_name: "",
		custom_customer_name: "",
		customer_first_name: "",
		customer_last_name: "",
		custom_customer_id: "",
		custom_country_name: "Ghana",
		custom_country_code: "+233",
		tax_id: "",
		mobile_no: "",
		mobileNoError: false,
		mobileNoErrorMessage: "",
		address_line1: "",
		city: "",
		country: "Pakistan",
		email_id: "",
		referral_code: "",
		birthday: "",
		birthday_menu: false,
		group: "",
		groups: [],
		territory: "",
		territorys: [],
		genders: [],
		customer_type: "Individual",
		gender: "",
		loyalty_points: null,
		loyalty_program: null,
		hideNonEssential: false,
		reqd_customer_id: false,
		countries: [
			"Afghanistan",
			"Albania",
			"Algeria",
			"American Samoa",
			"Andorra",
			"Angola",
			"Anguilla",
			"Antigua and Barbuda",
			"Argentina",
			"Armenia",
			"Aruba",
			"Australia",
			"Austria",
			"Azerbaijan",
			"Bahamas",
			"Bahrain",
			"Bangladesh",
			"Barbados",
			"Belarus",
			"Belgium",
			"Belize",
			"Benin",
			"Bermuda",
			"Bhutan",
			"Bolivia",
			"Bonaire, Sint Eustatius and Saba",
			"Bosnia and Herzegovina",
			"Botswana",
			"Brazil",
			"British Virgin Islands",
			"Brunei",
			"Bulgaria",
			"Burkina Faso",
			"Burundi",
			"Cabo Verde",
			"Cambodia",
			"Cameroon",
			"Canada",
			"Cayman Islands",
			"Central African Republic",
			"Chad",
			"Chile",
			"China",
			"Christmas Island",
			"Cocos (Keeling) Islands",
			"Colombia",
			"Comoros",
			"Congo",
			"Cook Islands",
			"Costa Rica",
			"Côte d'Ivoire",
			"Croatia",
			"Cuba",
			"Curaçao",
			"Cyprus",
			"Czech Republic",
			"Democratic Republic of the Congo",
			"Denmark",
			"Djibouti",
			"Dominica",
			"Dominican Republic",
			"Ecuador",
			"Egypt",
			"El Salvador",
			"Equatorial Guinea",
			"Eritrea",
			"Estonia",
			"Eswatini",
			"Ethiopia",
			"Falkland Islands",
			"Faroe Islands",
			"Fiji",
			"Finland",
			"France",
			"French Guiana",
			"French Polynesia",
			"Gabon",
			"Gambia",
			"Georgia",
			"Germany",
			"Ghana",
			"Gibraltar",
			"Greece",
			"Greenland",
			"Grenada",
			"Guadeloupe",
			"Guam",
			"Guatemala",
			"Guernsey",
			"Guinea",
			"Guinea-Bissau",
			"Guyana",
			"Haiti",
			"Holy See",
			"Honduras",
			"Hong Kong",
			"Hungary",
			"Iceland",
			"India",
			"Indonesia",
			"Iran",
			"Iraq",
			"Ireland",
			"Isle of Man",
			"Israel",
			"Italy",
			"Jamaica",
			"Japan",
			"Jersey",
			"Jordan",
			"Kazakhstan",
			"Kenya",
			"Kiribati",
			"Kuwait",
			"Kyrgyzstan",
			"Laos",
			"Latvia",
			"Lebanon",
			"Lesotho",
			"Liberia",
			"Libya",
			"Liechtenstein",
			"Lithuania",
			"Luxembourg",
			"Macao",
			"Madagascar",
			"Malawi",
			"Malaysia",
			"Maldives",
			"Mali",
			"Malta",
			"Marshall Islands",
			"Martinique",
			"Mauritania",
			"Mauritius",
			"Mayotte",
			"Mexico",
			"Micronesia",
			"Moldova",
			"Monaco",
			"Mongolia",
			"Montenegro",
			"Montserrat",
			"Morocco",
			"Mozambique",
			"Myanmar",
			"Namibia",
			"Nauru",
			"Nepal",
			"Netherlands",
			"New Caledonia",
			"New Zealand",
			"Nicaragua",
			"Niger",
			"Nigeria",
			"Niue",
			"Norfolk Island",
			"North Korea",
			"North Macedonia",
			"Northern Mariana Islands",
			"Norway",
			"Oman",
			"Pakistan",
			"Palau",
			"Palestine",
			"Panama",
			"Papua New Guinea",
			"Paraguay",
			"Peru",
			"Philippines",
			"Pitcairn",
			"Poland",
			"Portugal",
			"Puerto Rico",
			"Qatar",
			"Romania",
			"Russia",
			"Rwanda",
			"Réunion",
			"Saint Barthélemy",
			"Saint Helena, Ascension and Tristan da Cunha",
			"Saint Kitts and Nevis",
			"Saint Lucia",
			"Saint Martin",
			"Saint Pierre and Miquelon",
			"Saint Vincent and the Grenadines",
			"Samoa",
			"San Marino",
			"Sao Tome and Principe",
			"Saudi Arabia",
			"Senegal",
			"Serbia",
			"Seychelles",
			"Sierra Leone",
			"Singapore",
			"Sint Maarten",
			"Slovakia",
			"Slovenia",
			"Solomon Islands",
			"Somalia",
			"South Africa",
			"South Georgia and the South Sandwich Islands",
			"South Korea",
			"South Sudan",
			"Spain",
			"Sri Lanka",
			"Sudan",
			"Suriname",
			"Svalbard and Jan Mayen",
			"Sweden",
			"Switzerland",
			"Syria",
			"Taiwan",
			"Tajikistan",
			"Tanzania",
			"Thailand",
			"Timor-Leste",
			"Togo",
			"Tokelau",
			"Tonga",
			"Trinidad and Tobago",
			"Tunisia",
			"Turkey",
			"Turkmenistan",
			"Turks and Caicos Islands",
			"Tuvalu",
			"Uganda",
			"Ukraine",
			"United Arab Emirates",
			"United Kingdom",
			"United States",
			"United States Minor Outlying Islands",
			"Uruguay",
			"Uzbekistan",
			"Vanuatu",
			"Venezuela",
			"Vietnam",
			"Virgin Islands, British",
			"Virgin Islands, U.S.",
			"Wallis and Futuna",
			"Western Sahara",
			"Yemen",
			"Zambia",
			"Zimbabwe",
		],
	}),
	watch: {
		hideNonEssential(val) {
			if (typeof localStorage !== "undefined") {
				localStorage.setItem("posawesome_hide_non_essential_fields", JSON.stringify(val));
			}
		},
		custom_country_name(newVal) {
			console.log(newVal);	
			// Trigger validation when country changes
			if (newVal === "Ghana") {
				this.limitMobileNoForGhana();
			} else {
				// Clear error when country is not Ghana
				this.mobileNoError = false;
				this.mobileNoErrorMessage = "";
			}
		},
		birthday(newVal) {
			// Check if the user has entered 8 digits without separators (e.g., 04111994)
			if (newVal && /^\d{8}$/.test(newVal)) {
				try {
					const day = newVal.substring(0, 2);
					const month = newVal.substring(2, 4);
					const year = newVal.substring(4);

					// Format it as a hyphenated date for display
					this.birthday = `${day}-${month}-${year}`;

					// Update calendar (implemented below)
					this.updateCalendarDate(day, month, year);
				} catch (error) {
					console.error("Error processing 8-digit date:", error);
				}
			}
			// Check if the date is already in DD-MM-YYYY format
			else if (newVal && /^\d{2}-\d{2}-\d{4}$/.test(newVal)) {
				try {
					const parts = newVal.split("-");
					const day = parts[0];
					const month = parts[1];
					const year = parts[2];

					// Update calendar to show the correct month
					this.updateCalendarDate(day, month, year);
				} catch (error) {
					console.error("Error processing formatted date:", error);
				}
			}
		},

		// Add a watcher for the calendar menu to ensure it shows the right date when opened
		birthday_menu(isOpen) {
			if (isOpen && this.birthday && /^\d{2}-\d{2}-\d{4}$/.test(this.birthday)) {
				try {
					const parts = this.birthday.split("-");
					const day = parts[0];
					const month = parts[1];
					const year = parts[2];

					// Update calendar date when menu opens
					this.$nextTick(() => {
						this.updateCalendarDate(day, month, year);
					});
				} catch (error) {
					console.error("Error updating calendar on menu open:", error);
				}
			}
		},
	},
	computed: {},
	methods: {
		// Add a new method to update calendar date
		updateCalendarDate(day, month, year) {
			// First close the date picker if it's open
			const wasOpen = this.birthday_menu;
			this.birthday_menu = false;

			// Use nextTick to ensure DOM updates
			this.$nextTick(() => {
				// Format date in YYYY-MM-DD format for Vuetify
				const tempDate = `${year}-${month}-${day}`;

				// Try to directly set the calendar's date
				setTimeout(() => {
					if (this.$refs.birthday_menu) {
						this.$refs.birthday_menu.date = tempDate;
						// Optionally reopen menu if it was open
						if (wasOpen) {
							this.birthday_menu = true;
						}
					}
				}, 50);
			});
		},
		confirm_close() {
			// Check if any data has been entered
			if (
				this.customer_name ||
				this.tax_id ||
				this.mobile_no ||
				this.address_line1 ||
				this.email_id ||
				this.referral_code ||
				this.birthday
			) {
				this.confirmDialog = true;
			} else {
				// If no data entered, just close
				this.close_dialog();
			}
		},
		confirmClose() {
			this.confirmDialog = false;
			this.close_dialog();
		},
		close_dialog() {
			this.customerDialog = false;
			this.clear_customer();
		},
		clear_customer() {
			this.customer_name = "";
			this.custom_customer_name = "";
			this.customer_first_name = "";
			this.customer_last_name = "";
			this.custom_customer_id = "";
			this.custom_country_name = "Ghana";
			this.custom_country_code = "";
			this.tax_id = "";
			this.mobile_no = "";
			this.mobileNoError = false;
			this.mobileNoErrorMessage = "";
			this.address_line1 = "";
			this.city = "";
			this.country = (this.pos_profile && this.pos_profile.posa_default_country) || "Pakistan";
			this.email_id = "";
			this.referral_code = "";
			this.birthday = "";
			this.group = frappe.defaults.get_user_default("Customer Group");
			this.territory = frappe.defaults.get_user_default("Territory");
			this.customer_id = "";
			this.customer_type = "Individual";
			this.gender = "";
			this.loyalty_points = null;
			this.loyalty_program = null;
			this.reqd_customer_id = false;
		},
		limitMobileNoForGhana() {
			if (this.custom_country_name === "Ghana") {
				const mobileNo = String(this.mobile_no || "").trim();
				// Show error if mobile number is not exactly 10 digits
				if (mobileNo.length > 0 && mobileNo.length !== 10) {
					this.mobileNoError = true;
					this.mobileNoErrorMessage = __("Mobile number must be exactly 10 digits for Ghana");
				} else {
					this.mobileNoError = false;
					this.mobileNoErrorMessage = "";
				}
			} else {
				this.mobileNoError = false;
				this.mobileNoErrorMessage = "";
			}
		},
		updateCustomerName() {
			const first = this.customer_first_name ? this.customer_first_name.trim() : "";
			const last = this.customer_last_name ? this.customer_last_name.trim() : "";
			const mobile = this.mobile_no ? this.mobile_no.trim() : "";

			// custom_customer_name is just first + last name
			this.custom_customer_name = `${first} ${last}`.trim();

			// customer_name is first + last  (for doctype name)
			this.customer_name = `${first} ${last}`.trim();
		},
		updateCountryCode() {
			// Map country names to country codes
			const countryCodeMap = {
				Afghanistan: "+93",
				Albania: "+355",
				Algeria: "+213",
				"American Samoa": "+1",
				Andorra: "+376",
				Angola: "+244",
				Anguilla: "+1",
				"Antigua and Barbuda": "+1",
				Argentina: "+54",
				Armenia: "+374",
				Aruba: "+297",
				Australia: "+61",
				Austria: "+43",
				Azerbaijan: "+994",
				Bahamas: "+1",
				Bahrain: "+973",
				Bangladesh: "+880",
				Barbados: "+1",
				Belarus: "+375",
				Belgium: "+32",
				Belize: "+501",
				Benin: "+229",
				Bermuda: "+1",
				Bhutan: "+975",
				Bolivia: "+591",
				"Bonaire, Sint Eustatius and Saba": "+599",
				"Bosnia and Herzegovina": "+387",
				Botswana: "+267",
				Brazil: "+55",
				"British Virgin Islands": "+1",
				Brunei: "+673",
				Bulgaria: "+359",
				"Burkina Faso": "+226",
				Burundi: "+257",
				"Cabo Verde": "+238",
				Cambodia: "+855",
				Cameroon: "+237",
				Canada: "+1",
				"Cayman Islands": "+1",
				"Central African Republic": "+236",
				Chad: "+235",
				Chile: "+56",
				China: "+86",
				"Christmas Island": "+61",
				"Cocos (Keeling) Islands": "+61",
				Colombia: "+57",
				Comoros: "+269",
				Congo: "+242",
				"Cook Islands": "+682",
				"Costa Rica": "+506",
				"Côte d'Ivoire": "+225",
				Croatia: "+385",
				Cuba: "+53",
				Curaçao: "+599",
				Cyprus: "+357",
				"Czech Republic": "+420",
				"Democratic Republic of the Congo": "+243",
				Denmark: "+45",
				Djibouti: "+253",
				Dominica: "+1",
				"Dominican Republic": "+1",
				Ecuador: "+593",
				Egypt: "+20",
				"El Salvador": "+503",
				"Equatorial Guinea": "+240",
				Eritrea: "+291",
				Estonia: "+372",
				Eswatini: "+268",
				Ethiopia: "+251",
				"Falkland Islands": "+500",
				"Faroe Islands": "+298",
				Fiji: "+679",
				Finland: "+358",
				France: "+33",
				"French Guiana": "+594",
				"French Polynesia": "+689",
				Gabon: "+241",
				Gambia: "+220",
				Georgia: "+995",
				Germany: "+49",
				Ghana: "+233",
				Gibraltar: "+350",
				Greece: "+30",
				Greenland: "+299",
				Grenada: "+1",
				Guadeloupe: "+590",
				Guam: "+1",
				Guatemala: "+502",
				Guernsey: "+44",
				Guinea: "+224",
				"Guinea-Bissau": "+245",
				Guyana: "+592",
				Haiti: "+509",
				"Holy See": "+379",
				Honduras: "+504",
				"Hong Kong": "+852",
				Hungary: "+36",
				Iceland: "+354",
				India: "+91",
				Indonesia: "+62",
				Iran: "+98",
				Iraq: "+964",
				Ireland: "+353",
				"Isle of Man": "+44",
				Israel: "+972",
				Italy: "+39",
				Jamaica: "+1",
				Japan: "+81",
				Jersey: "+44",
				Jordan: "+962",
				Kazakhstan: "+7",
				Kenya: "+254",
				Kiribati: "+686",
				Kuwait: "+965",
				Kyrgyzstan: "+996",
				Laos: "+856",
				Latvia: "+371",
				Lebanon: "+961",
				Lesotho: "+266",
				Liberia: "+231",
				Libya: "+218",
				Liechtenstein: "+423",
				Lithuania: "+370",
				Luxembourg: "+352",
				Macao: "+853",
				Madagascar: "+261",
				Malawi: "+265",
				Malaysia: "+60",
				Maldives: "+960",
				Mali: "+223",
				Malta: "+356",
				"Marshall Islands": "+692",
				Martinique: "+596",
				Mauritania: "+222",
				Mauritius: "+230",
				Mayotte: "+262",
				Mexico: "+52",
				Micronesia: "+691",
				Moldova: "+373",
				Monaco: "+377",
				Mongolia: "+976",
				Montenegro: "+382",
				Montserrat: "+1",
				Morocco: "+212",
				Mozambique: "+258",
				Myanmar: "+95",
				Namibia: "+264",
				Nauru: "+674",
				Nepal: "+977",
				Netherlands: "+31",
				"New Caledonia": "+687",
				"New Zealand": "+64",
				Nicaragua: "+505",
				Niger: "+227",
				Nigeria: "+234",
				Niue: "+683",
				"Norfolk Island": "+672",
				"North Korea": "+850",
				"North Macedonia": "+389",
				"Northern Mariana Islands": "+1",
				Norway: "+47",
				Oman: "+968",
				Pakistan: "+92",
				Palau: "+680",
				Palestine: "+970",
				Panama: "+507",
				"Papua New Guinea": "+675",
				Paraguay: "+595",
				Peru: "+51",
				Philippines: "+63",
				Pitcairn: "+64",
				Poland: "+48",
				Portugal: "+351",
				"Puerto Rico": "+1",
				Qatar: "+974",
				Romania: "+40",
				Russia: "+7",
				Rwanda: "+250",
				Réunion: "+262",
				"Saint Barthélemy": "+590",
				"Saint Helena, Ascension and Tristan da Cunha": "+290",
				"Saint Kitts and Nevis": "+1",
				"Saint Lucia": "+1",
				"Saint Martin": "+590",
				"Saint Pierre and Miquelon": "+508",
				"Saint Vincent and the Grenadines": "+1",
				Samoa: "+685",
				"San Marino": "+378",
				"Sao Tome and Principe": "+239",
				"Saudi Arabia": "+966",
				Senegal: "+221",
				Serbia: "+381",
				Seychelles: "+248",
				"Sierra Leone": "+232",
				Singapore: "+65",
				"Sint Maarten": "+1",
				Slovakia: "+421",
				Slovenia: "+386",
				"Solomon Islands": "+677",
				Somalia: "+252",
				"South Africa": "+27",
				"South Georgia and the South Sandwich Islands": "+500",
				"South Korea": "+82",
				"South Sudan": "+211",
				Spain: "+34",
				"Sri Lanka": "+94",
				Sudan: "+249",
				Suriname: "+597",
				"Svalbard and Jan Mayen": "+47",
				Sweden: "+46",
				Switzerland: "+41",
				Syria: "+963",
				Taiwan: "+886",
				Tajikistan: "+992",
				Tanzania: "+255",
				Thailand: "+66",
				"Timor-Leste": "+670",
				Togo: "+228",
				Tokelau: "+690",
				Tonga: "+676",
				"Trinidad and Tobago": "+1",
				Tunisia: "+216",
				Turkey: "+90",
				Turkmenistan: "+993",
				"Turks and Caicos Islands": "+1",
				Tuvalu: "+688",
				Uganda: "+256",
				Ukraine: "+380",
				"United Arab Emirates": "+971",
				"United Kingdom": "+44",
				"United States": "+1",
				"United States Minor Outlying Islands": "+1",
				Uruguay: "+598",
				Uzbekistan: "+998",
				Vanuatu: "+678",
				Venezuela: "+58",
				Vietnam: "+84",
				"Virgin Islands, British": "+1",
				"Virgin Islands, U.S.": "+1",
				"Wallis and Futuna": "+681",
				"Western Sahara": "+212",
				Yemen: "+967",
				Zambia: "+260",
				Zimbabwe: "+263",
			};

			this.custom_country_code = countryCodeMap[this.custom_country_name] || "";
		},
		handleGroupChange() {
			if (!this.group) {
				this.reqd_customer_id = false;
				return;
			}
			// Check if customer group has custom_is_insurance field checked
			frappe.db
				.get_value("Customer Group", this.group, "custom_is_insurance")
				.then(
					(r) => {
						// If field exists and is checked (1), make customer ID required
						if (r.message && "custom_is_insurance" in r.message) {
							this.reqd_customer_id = r.message.custom_is_insurance === 1;
						} else {
							// Field doesn't exist or is not checked, customer ID not required
							this.reqd_customer_id = false;
						}
					}
				)
				.catch(() => {
					// If error occurs or field doesn't exist, customer ID not required
					this.reqd_customer_id = false;
				});
		},
		getCustomerGroups() {
			if (this.groups.length > 0) return;
			const vm = this;
			frappe.db
				.get_list("Customer Group", {
					fields: ["name"],
					filters: { is_group: 0 },
					limit: 1000,
					order_by: "name",
				})
				.then((data) => {
					if (data.length > 0) {
						data.forEach((el) => {
							vm.groups.push(el.name);
						});
					}
				});
		},
		getCustomerTerritorys() {
			if (this.territorys.length > 0) return;
			const vm = this;
			frappe.db
				.get_list("Territory", {
					fields: ["name"],
					filters: { is_group: 0 },
					limit: 5000,
					order_by: "name",
				})
				.then((data) => {
					if (data.length > 0) {
						data.forEach((el) => {
							vm.territorys.push(el.name);
						});
					}
				});
		},
		getGenders() {
			const vm = this;
			frappe.db
				.get_list("Gender", {
					fields: ["name"],
					page_length: 10,
				})
				.then((data) => {
					if (data.length > 0) {
						data.forEach((el) => {
							vm.genders.push(el.name);
						});
					}
				});
		},
		formatBirthdayOnInput() {
			// Handle 8-digit format (DDMMYYYY)
			if (this.birthday && /^\d{8}$/.test(this.birthday)) {
				try {
					const day = this.birthday.substring(0, 2);
					const month = this.birthday.substring(2, 4);
					const year = this.birthday.substring(4);
					this.birthday = `${day}-${month}-${year}`;
				} catch (error) {
					console.error("Error formatting date:", error);
				}
			}
		},
		async submit_dialog() {
			const vm = this;
			if (!this.customer_first_name) {
				frappe.throw(__("Customer First Name is required"));
				return;
			}

			if (!this.customer_last_name) {
				frappe.throw(__("Customer Last Name is required"));
				return;
			}

			if (!this.mobile_no) {
				frappe.throw(__("Mobile No is required"));
				return;
			}

			// Validate mobile number length for Ghana - must be exactly 10 digits
			if (this.custom_country_name === "Ghana" && this.mobile_no) {
				const mobileNo = String(this.mobile_no).trim();
				if (mobileNo.length !== 10) {
					frappe.utils.play_sound("error");
					frappe.show_alert({
						message: __("Mobile number must be exactly 10 digits for Ghana"),
						indicator: "error",
					});
					return;
				}
			}

			if (!this.custom_customer_name) {
				frappe.throw(__("Customer Name is required"));
				return;
			}

			if (this.reqd_customer_id && !this.custom_customer_id) {
				frappe.utils.play_sound("error");
				frappe.show_alert({
					message: __("Customer ID is required for this customer group"),
					indicator: "error",
				});
				return;
			}

			if (!this.group) {
				frappe.throw(__("Customer group is required"));
				return;
			}

			if (!this.territory) {
				frappe.throw(__("Customer territory is required"));
				return;
			}

			// Format birthday to YYYY-MM-DD if it exists and is in another format
			let formatted_birthday = null;
			if (this.birthday) {
				try {
					// First check if it's a date without separators (e.g., 04111994 for 04-11-1994)
					if (/^\d{8}$/.test(this.birthday)) {
						const day = this.birthday.substring(0, 2);
						const month = this.birthday.substring(2, 4);
						const year = this.birthday.substring(4);
						formatted_birthday = `${year}-${month}-${day}`;
					}
					// Check if it's in DD-MM-YYYY format
					else if (/^\d{1,2}-\d{1,2}-\d{4}$/.test(this.birthday)) {
						const parts = this.birthday.split("-");
						if (parts.length === 3) {
							const day = parts[0].padStart(2, "0");
							const month = parts[1].padStart(2, "0");
							const year = parts[2];
							formatted_birthday = `${year}-${month}-${day}`;
						}
					}
					// Handle DD/MM/YYYY format
					else if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(this.birthday)) {
						const parts = this.birthday.split("/");
						if (parts.length === 3) {
							const day = parts[0].padStart(2, "0");
							const month = parts[1].padStart(2, "0");
							const year = parts[2];
							formatted_birthday = `${year}-${month}-${day}`;
						}
					}
					// For any other format, try to use the browser's date parsing
					else if (this.birthday) {
						try {
							const date = new Date(this.birthday);
							// Check if the date is valid
							if (!isNaN(date.getTime())) {
								const year = date.getFullYear();
								const month = String(date.getMonth() + 1).padStart(2, "0");
								const day = String(date.getDate()).padStart(2, "0");
								formatted_birthday = `${year}-${month}-${day}`;
							}
						} catch (e) {
							console.error("Failed to parse date:", e);
						}
					}
				} catch (error) {
					console.error("Error formatting date:", error);
					formatted_birthday = null;
				}
			}

			// Create args object to use in callback (use ?? "" so keys are always sent in JSON)
			const args = {
				customer_id: this.customer_id,
				customer_name: this.customer_name,
				custom_customer_name: this.custom_customer_name ?? "",
				custom_customer_first_name: this.customer_first_name ?? "",
				custom_customer_last_name: this.customer_last_name ?? "",
				customer_first_name: this.customer_first_name ?? "",
				customer_last_name: this.customer_last_name ?? "",
				custom_customer_id: this.custom_customer_id,
				custom_country_name: this.custom_country_name,
				custom_country_code: this.custom_country_code,
				tax_id: this.tax_id,
				mobile_no: this.mobile_no,
				address_line1: this.address_line1,
				city: this.city,
				country: this.country,
				email_id: this.email_id,
				referral_code: this.referral_code,
				birthday: formatted_birthday || this.birthday,
				customer_group: this.group,
				territory: this.territory,
				customer_type: this.customer_type,
				gender: this.gender,
			};
			const apiArgs = {
				...args,
				company: vm.pos_profile.company,
				pos_profile_doc: JSON.stringify(vm.pos_profile),
				method: this.customer_id ? "update" : "create",
			};

			const customersStore = useCustomersStore();

			if (isOffline()) {
				saveOfflineCustomer({ args: apiArgs });
				vm.eventBus.emit("show_message", { title: __("Customer saved offline"), color: "warning" });
				args.name = this.customer_name;
				await customersStore.addOrUpdateCustomer({
					name: args.name,
					customer_name: args.customer_name,
					mobile_no: args.mobile_no,
					custom_search_mobile_no: args.mobile_no,
					email_id: args.email_id,
					tax_id: args.tax_id,
					primary_address: args.address_line1,
					custom_customer_id: args.custom_customer_id,
				});
				vm.close_dialog();
				return;
			}
		
			frappe.call({
				method: "posawesome.posawesome.api.customers.create_customer",
				args: apiArgs,
				callback: async (r) => {
					if (!r.exc && r.message.name) {
						let text = __("Customer created successfully.");
						if (vm.customer_id) {
							text = __("Customer updated successfully.");
						}
						vm.eventBus.emit("show_message", {
							title: text,
							color: "success",
						});
						args.name = r.message.name;
						frappe.utils.play_sound("submit");
						const customerDoc = r.message;
						await customersStore.addOrUpdateCustomer({
							name: customerDoc.name,
							customer_name: customerDoc.customer_name || args.customer_name,
							mobile_no: customerDoc.mobile_no || args.mobile_no,
							custom_search_mobile_no: customerDoc.custom_search_mobile_no || args.mobile_no,
							email_id: customerDoc.email_id || args.email_id,
							tax_id: customerDoc.tax_id || args.tax_id,
							primary_address: args.address_line1,
							custom_customer_id: customerDoc.custom_customer_id || args.custom_customer_id,
						});
						vm.close_dialog();
					} else {
						frappe.utils.play_sound("error");
						vm.eventBus.emit("show_message", {
							title: __("Customer creation failed."),
							color: "error",
						});
					}
				},
			});
		},
		onDateSelect() {
			// Close the menu
			this.birthday_menu = false;

			// Format date if it's a JavaScript Date object or full date string (from date picker)
			if (this.birthday) {
				try {
					// Handle both JavaScript Date objects and strings with GMT
					let dateObj;
					if (typeof this.birthday === "object") {
						dateObj = this.birthday;
					} else if (
						typeof this.birthday === "string" &&
						(this.birthday.includes("GMT") || this.birthday.includes("T"))
					) {
						dateObj = new Date(this.birthday);
					} else {
						// Already formatted or something else, leave it
						return;
					}

					const year = dateObj.getFullYear();
					const month = String(dateObj.getMonth() + 1).padStart(2, "0");
					const day = String(dateObj.getDate()).padStart(2, "0");

					// Format as DD-MM-YYYY
					this.birthday = `${day}-${month}-${year}`;
				} catch (error) {
					console.error("Error formatting date from picker:", error);
				}
			}
		},
	},
	created: function () {
		if (typeof localStorage !== "undefined") {
			const saved = localStorage.getItem("posawesome_hide_non_essential_fields");
			if (saved !== null) {
				this.hideNonEssential = JSON.parse(saved);
			}
		}
		this.eventBus.on("open_update_customer", (data) => {
			this.customerDialog = true;
			
			if (data) {
				this.customer_name = data.customer_name;
				this.custom_customer_name = data.custom_customer_name || data.customer_name;
				this.customer_first_name = data.custom_customer_first_name || "";
				this.customer_last_name = data.custom_customer_last_name || "";
				this.custom_customer_id = data.custom_customer_id || "";
				this.custom_country_name = data.custom_country_name || data.country || "Ghana";
				this.custom_country_code = data.custom_country_code || "+233";
				this.customer_id = data.name;
				this.address_line1 = data.address_line1 || "";
				this.city = data.city || "";
				this.country =
					data.country || (this.pos_profile && this.pos_profile.posa_default_country) || "Ghana";
				this.tax_id = data.tax_id;
				this.mobile_no = data.mobile_no;
				this.email_id = data.email_id;
				this.referral_code = data.referral_code;
				this.birthday = data.birthday;
				this.group = data.customer_group;
				this.territory = data.territory;
				this.loyalty_points = data.loyalty_points;
				this.loyalty_program = data.loyalty_program;
				this.gender = data.gender;

				// Check if customer group requires customer ID
				if (this.group) {
					this.handleGroupChange();
				}
			} else {
				this.country = (this.pos_profile && this.pos_profile.posa_default_country) || "Ghana";
			}
		});
		this.eventBus.on("register_pos_profile", (data) => {
			this.pos_profile = data.pos_profile;
			this.country = (this.pos_profile && this.pos_profile.posa_default_country) || "Ghana";
			this.custom_country_name = "Ghana";
			this.custom_country_code = "+233";
		});
		this.eventBus.on("payments_register_pos_profile", (data) => {
			this.pos_profile = data.pos_profile;
			this.country = (this.pos_profile && this.pos_profile.posa_default_country) || "Ghana";
			this.custom_country_name = "Ghana";
		});
		this.getCustomerGroups();
		this.getCustomerTerritorys();
		this.getGenders();
		// set default values for customer group and territory from user defaults
		this.group = frappe.defaults.get_user_default("Customer Group");
		this.territory = frappe.defaults.get_user_default("Territory");
	},
};
</script>

<style scoped></style>
