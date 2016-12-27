/* tslint:disable:no-console */

import { IAction, IOptions } from './interfaces'

import FirebaseLogger from './utils/firebase'
import { contains } from 'ramda'
import { diff } from 'deep-diff';

export default FirebaseLogger