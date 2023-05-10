import { rest } from 'msw'

//1. Type-1.
export const requestHandler = [
  // Handles a POST /login request
  rest.post('/login', () => 'function that would return the mocked response'),

  // Handles a GET /user request
  rest.get('/user', null),
]


//2. Type-1. Best.
// req, an information about a matching request;
// res, a functional utility to create the mocked response;
// ctx, a group of functions that help to set a status code, headers, body, etc. of the mocked response.

export const responseResolver = [
  rest.post('/login', (req, res, ctx) => {
    // Persist user's authentication in the session
    sessionStorage.setItem('is-authenticated', 'true')

    return res(
      // Respond with a 200 status code
      ctx.status(200),
    )
  }),

  rest.get('/user', (req, res, ctx) => {
    // Check if the user is authenticated in this session
    const isAuthenticated = sessionStorage.getItem('is-authenticated')

    if (!isAuthenticated) {
      // If not authenticated, respond with a 403 error
      return res(
        ctx.status(403),
        ctx.json({
          errorMessage: 'Not authorized',
        }),
      )
    }

    // If authenticated, return a mocked user details
    return res(
      ctx.status(200),
      ctx.json({
        username: 'admin',
      }),
    )
  }),
]
