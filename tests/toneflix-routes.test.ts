import { describe, expect, it } from 'vitest'

import { Arkstack } from '@arkstack/contract'
import { app } from '../src/core/bootstrap'
import { existsSync } from 'node:fs'
import path from 'node:path'
import request from 'parasito'

/**
 * We use this test at the monorepo level,
 * this asertion allows us to scope the test to work with the monorepo setup
 * If you created your app with `create arkstack`, this can safely be removed.
 */
const rwd = path.join(process.cwd(), '/templates/express')
if (existsSync(rwd)) Arkstack.setRootDir(rwd)

describe('Lorem Toneflix-compatible /images routes', () => {
    it('serves a random image on the bare /images route', async () => {
        const res = await request(app).get('/images')

        expect(res.status).toBe(200)
        expect(res.header['x-image-category']).toBeDefined()
    })

    it('serves a random image for a known category', async () => {
        const res = await request(app).get('/images/avatar')

        expect(res.status).toBe(200)
        expect(res.header['x-image-category']).toBe('avatar')
    })

    it('404s for an unknown category', async () => {
        const res = await request(app).get('/images/not-a-real-category')

        expect(res.status).toBe(404)
    })
})
