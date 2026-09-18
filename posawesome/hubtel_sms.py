import requests
import frappe

DEFAULT_HUBTEL_URL = "https://smsc.hubtel.com/v1/messages/send"


@frappe.whitelist()
def send_hubtel_sms(customer_name, context, receiver_phone_number=None, sms_message="sms_message"):
	"""Send SMS via Hubtel using SMS Gateway Settings."""
	sms_gateway_settings = frappe.get_doc("SMS Gateway Settings")
	if not sms_gateway_settings.enable:
		return

	client_id = sms_gateway_settings.hubtel_client_id
	client_secret = None
	if sms_gateway_settings.get("hubtel_client_secret"):
		client_secret = sms_gateway_settings.get_password("hubtel_client_secret")
	sender_id = sms_gateway_settings.sender_id
	url = sms_gateway_settings.hubtel_url_end_point or DEFAULT_HUBTEL_URL
	message_body = frappe.render_template(sms_gateway_settings.get(sms_message), context.as_dict())
	receiver_phone_number = (receiver_phone_number or "").strip()

	missing_fields = []
	if not client_id:
		missing_fields.append("Hubtel Client ID")
	if not client_secret:
		missing_fields.append("Hubtel Client Secret")
	if not sender_id:
		missing_fields.append("Sender Id")
	if not receiver_phone_number:
		missing_fields.append("Recipient phone number")
	if not message_body:
		missing_fields.append("SMS Message Body")

	if missing_fields:
		frappe.msgprint(
			f"The following fields are missing in SMS Gateway Settings: {', '.join(missing_fields)}",
			title="Missing Hubtel SMS Settings",
			indicator="red",
		)
		return

	frappe.msgprint(
		f"Sending SMS to {customer_name} phone number ({receiver_phone_number})...",
		title="Notifying Customer",
		indicator="blue",
		alert=True,
	)

	frappe.enqueue(
		send_sms,
		queue="short",
		client_id=client_id,
		client_secret=client_secret,
		sender_id=sender_id,
		receiver_phone_number=receiver_phone_number,
		message_body=message_body,
		url=url,
	)


def send_sms(client_id, client_secret, sender_id, receiver_phone_number, message_body, url=DEFAULT_HUBTEL_URL):
	"""POST a single message to the Hubtel SMS API."""
	try:
		response = requests.post(
			url or DEFAULT_HUBTEL_URL,
			json={
				"From": sender_id,
				"To": receiver_phone_number,
				"Content": message_body,
				"RegisteredDelivery": True,
			},
			auth=(client_id, client_secret),
			timeout=30,
		)

		payload = {}
		try:
			payload = response.json()
		except ValueError:
			payload = {"message": response.text}

		status = payload.get("Status", payload.get("status"))
		error_message = (
			payload.get("Message")
			or payload.get("message")
			or payload.get("StatusDescription")
			or response.text
		)

		if 200 <= response.status_code < 203 and status in (None, 0, "0"):
			frappe.publish_realtime(
				"msgprint",
				{
					"message": "SMS sent successfully via Hubtel!",
					"title": "Success",
					"indicator": "green",
					"alert": "True",
				},
				user=frappe.session.user,
			)
			return

		frappe.publish_realtime(
			"msgprint",
			{
				"message": f"Failed to send SMS via Hubtel: {error_message}",
				"title": "SMS Sending Failed",
				"indicator": "red",
			},
			user=frappe.session.user,
		)
	except Exception as e:
		frappe.log_error(frappe.get_traceback(), "Hubtel SMS Sending Failed")
		frappe.publish_realtime(
			"msgprint",
			{
				"message": f"Failed to send SMS via Hubtel: {str(e)}",
				"title": "SMS Sending Failed",
				"indicator": "red",
			},
			user=frappe.session.user,
		)
