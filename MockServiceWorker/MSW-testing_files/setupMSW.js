import { MSWServer } from './MSW/MSWServer.js'

beforeAll(() => MSWServer.listen({ onUnhandledRequest: 'error' }))
afterEach(() => MSWServer.resetHandlers())
afterAll(() => MSWServer.close())