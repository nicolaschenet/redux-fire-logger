/* tslint:disable:no-console */

import { IAction } from './interfaces'
import { diff } from 'deep-diff'

const logger = (options: Object = {}) => (store: any) => (next: any) => (action: IAction): Object => {
  const currentState: Object = store.getState()
  const result: Object = next(action)
  const nextState: Object = store.getState()
  console.log(`diff from ${action.type}`, diff(currentState, nextState), options)
  return result
}

export default logger