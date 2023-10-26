export default {
	'super-admin': {
		authorizations: ['edit-admins', 'edit-payments', 'edit-members']
	},
	manager: {
		authorizations: ['edit-payments', 'edit-members']
	},
	'payment-manager': {
		authorizations: ['edit-payments']
	},
	'member-manager': {
		authorizations: ['edit-members']
	},
	viewer: {
		authorizations: ['view-payments', 'view-members']
	},
	member: {
		authorizations: []
	}
}
