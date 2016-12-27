import * as firebase from "firebase"

import { IAction, IOptions } from '../interfaces'
import { append, contains, head } from 'ramda'

import { diff } from 'deep-diff'

export default class FirebaseLogger {
  isAuthenticating: boolean = false
  options: IOptions
  diffQueue: Object[] = []
  defaultOptions: IOptions = {
    excludedActionTypes: [],
    firebaseConfig: {
      apiKey: '',
      authDomain: '',
      databaseURL: '',
      storageBucket: '',
      messagingSenderId: ''
    }
  }
  constructor (options? :IOptions) {
    this.options = {
      ...this.defaultOptions,
      ...options
    }
    firebase.initializeApp(this.options.firebaseConfig)
  }
  get db () {
    return firebase.database()
  }
  get fbUser () {
    return firebase.auth().currentUser
  }
  async log (action: IAction, currentState: Object, nextState: Object) {
    const timestamp: number = new Date().getTime()
    const stateDiff: any[] = diff(currentState, nextState)
    const { type } = action
    this.diffQueue = append({
      action,
      timestamp,
      stateDiff
    }, this.diffQueue)

    // A user is authenticating, do nothing but store diffs
    if (this.isAuthenticating) {
      console.log('redux-fire-logger | isAuthenticating...')
      return
    }

    // We have a user, flush immediately
    if (firebase.auth().currentUser ) {
      console.log('redux-fire-logger | Instant flush !')
      return this.flush()
    }

    // A user is needed, authenticating now, then flush
    console.log('redux-fire-logger | Begin user authentication...')
    const user = await this.auth()
    console.log('redux-fire-logger | User authenticated !', user)
    console.log('redux-fire-logger | After auth flush !')
    this.flush()

  }

  flush () {
    while (this.diffQueue.length !== 0) {
      const data = head(this.diffQueue.splice(0, 1))
      console.log('Logging element', data, JSON.stringify(data), this.fbUser.uid)
      this.flush()
    }
  }
  
  startLogger () {
    return (store: any) => (next: any) => (action: IAction): Object => {
      const currentState: Object = store.getState()
      const result: Object = next(action)
      if (contains(action.type, this.options.excludedActionTypes)) {
        return result
      }
      this.log(action, currentState, store.getState())
      return result
    }
  }

  auth () {
    this.isAuthenticating = true
    return new firebase.Promise((resolve, reject) => {
      firebase.auth().signInAnonymously()
        .then(user => {
          this.isAuthenticating = false
          resolve(user)
        })
        .catch(error => {
          this.isAuthenticating = false
          reject(error)
        })
    })
  }
}