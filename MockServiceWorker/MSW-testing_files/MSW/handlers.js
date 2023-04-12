import { rest } from 'msw'

export const handlers= [
  // rest.get('/message', (req, res, ctx) => {
  rest.get('https://rest-endpoint.example', (req, res, ctx) => {
    return res(
      ctx.json({
        message: 'it works :)'
      })
    )
  }),
]