import '@arkstack/http/setup'

import * as express from 'express'

import Application from '../core/app'
import { View } from '@arkstack/view'
import { interopDefault } from '@arkstack/common'

View.boot()

const expressApp = interopDefault(express)()

export const app = new Application(expressApp)
