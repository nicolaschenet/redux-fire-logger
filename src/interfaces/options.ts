interface IOptions {
  // Prevent the logger to send an event when it encounters these types
  // Please note that changes induced by these actions may be lost if no different action is dispatched after them
  excludedActionTypes: string[]
  firebaseConfig: {
    apiKey: string
    authDomain: string
    databaseURL: string
    storageBucket: string
    messagingSenderId: string
  }
}

export default IOptions