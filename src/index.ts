/* tslint:disable:no-console */

import { IAction, IOptions } from './interfaces'

import { contains } from 'ramda'
import { diff } from 'deep-diff';

const defaultOptions: IOptions = {
  excludedActionTypes: []
}

const log = (action: IAction, currentState: Object, nextState: Object): void => {
  const timestamp: number = new Date().getTime()
  const stateDiff: any[] = diff(currentState, nextState)
  const { type } = action
  console.log(`Redux Fire Logger | Diff from ${type}`, stateDiff, timestamp)
}

const logger = (options: IOptions) => (store: any) => (next: any) => (action: IAction): Object => {
  options = {
    ...defaultOptions,
    ...options
  }
  const currentState: Object = store.getState()
  const result: Object = next(action)
  if (contains(action.type, options.excludedActionTypes)) {
    return result
  }
  log(action, currentState, store.getState())
  return result
}

export default logger