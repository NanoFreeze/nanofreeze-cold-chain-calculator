export const Environments = {
  toolbox: import.meta.env.VITE_APP_TOOLBOX,
	things: import.meta.env.VITE_APP_THINGS,
	archives: import.meta.env.VITE_APP_ARCHIVES,
	analitycs: import.meta.env.VITE_APP_ANALITIYCS,
	paper: import.meta.env.VITE_APP_PAPER,
	support: import.meta.env.VITE_APP_SUPPORT,
	tables: import.meta.env.VITE_APP_TABLES,
	appCreator: import.meta.env.VITE_APP_APP_CREATOR,
  this: window.location.protocol.concat("//").concat(window.location.host),
	public: import.meta.env.VITE_APP_PUBLIC,
	templates: import.meta.env.VITE_APP_TEMPLATES,

	auth0: {
		domain: import.meta.env.VITE_AUTH0_DOMAIN,
		clientId: import.meta.env.VITE_AUTH0_CLIENT_ID,
		clientSecret: import.meta.env.VITE_AUTH0_CLIENT_SECRET,
		audience: import.meta.env.VITE_AUTH0_AUDIENCE
	},

	sockets: {
		notifications: import.meta.env.VITE_APP_NOTIFICATIONS_SOCKET,
		tasks: import.meta.env.VITE_APP_TASKS_SOCKET
	},

	firebaseConfig: {
		apiKey: import.meta.env.VITE_FIREBASE_APIKEY,
		authDomain: import.meta.env.VITE_FIREBASE_AUTHDOMAIN,
		databaseURL: import.meta.env.VITE_FIREBASE_DATABASEURL,
		projectId: import.meta.env.VITE_FIREBASE_PROJECTID,
		storageBucket: import.meta.env.VITE_FIREBASE_STORAGEBUCKET,
		messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGINGSENDERID,
		appId: import.meta.env.VITE_FIREBASE_APPID,
	}
}