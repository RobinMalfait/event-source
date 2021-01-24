import { abort } from './abort'
import { createError } from './create-error'

it('should be possible to throw an error with with extra properties using the abort utility', () => {
  expect.assertions(1)

  try {
    abort('My Error', { hello: 'world' })
  } catch (err) {
    expect(err).toEqual(createError('My Error', { hello: 'world' }))
  }
})
