const users = [
	{
		name: 'Tom',
		id: 'saoudhqwodsa'
	},
	{
		name: 'Iarmi',
		id: 'gfsofndwfs'
	}
]

export default {
	Query: {
		users: () => users
	},
	Mutation: {
		createUser: (parent, args) => {
			const newUser = args
			users.push(newUser)
			return newUser
		}
	}
}
