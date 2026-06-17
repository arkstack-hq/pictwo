import { describe, it } from 'vitest'

import { Arkstack } from '@arkstack/contract'
import { app } from '../src/core/bootstrap'
import { existsSync } from 'node:fs'
import path from 'node:path'
import request from 'parasito'

const rwd = path.join(process.cwd(), '/templates/express')
if (existsSync(rwd)) Arkstack.setRootDir(rwd)

describe('SDK docs page', () => {
    it('renders the /docs page', async () => {
        await request(app).get('/docs').contains('Pictwo SDK')
    })
})
