import { createError } from './create-error'

it('should be possible to create an error', () => {
  let error = createError('My Error')

  expect(error).toBeInstanceOf(Error)
  expect(error).toHaveProperty('message')
  expect(error.message).toBe('My Error')
})

it('should be possible to create an error with extra properties', () => {
  let error = createError('My Error', { hello: 'world' })

  expect(error).toBeInstanceOf(Error)
  expect(error).toHaveProperty('message')
  expect(error.message).toBe('My Error')
  expect(error.hello).toBe('world')
})
