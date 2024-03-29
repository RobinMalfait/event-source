import { objectToYaml } from '~/utils/object-to-yaml'
import { createError } from '~/utils/create-error'

it('should be possible to print an object with a single scalar value', () => {
  let obj = { hello: 'world' }
  expect(objectToYaml(obj)).toMatchSnapshot()
})

it('should be possible to print an object with a multiple scalar values', () => {
  let obj = { hello: 'world', age: 24, interesting: true }
  expect(objectToYaml(obj)).toMatchSnapshot()
})

it('should be possible to print an object with a nested object', () => {
  let obj = { universe: { hello: 'world' } }
  expect(objectToYaml(obj)).toMatchSnapshot()
})

it('should be possible to print an object as a yaml like structure (simple case)', () => {
  let obj = {
    id: 'some simple id',
    fields: {
      fieldA: ['This field is required', 'This field should be available'],
      fieldB: ['This field is required', 'This field should be a number'],
    },
  }

  expect(objectToYaml(obj)).toMatchSnapshot()
})

it('should be possible to print an error with extra objects to a yaml like structure', () => {
  expect(
    objectToYaml(
      createError('Some error message', {
        with: { extra: { properties: [1, 2, 3] } },
      })
    )
  ).toMatchSnapshot()
})

it('should be possible to print an object as a yaml like structure (more advanced case)', () => {
  let obj = {
    employees: {
      employee: [
        {
          id: '1',
          firstName: 'Tom',
          lastName: 'Cruise',
          photo:
            'https://pbs.twimg.com/profile_images/735509975649378305/B81JwLT7.jpg',
        },
        {
          id: '2',
          firstName: 'Maria',
          lastName: 'Sharapova',
          photo:
            'https://pbs.twimg.com/profile_images/3424509849/bfa1b9121afc39d1dcdb53cfc423bf12.jpeg',
        },
        {
          id: '3',
          firstName: 'James',
          lastName: 'Bond',
          photo:
            'https://pbs.twimg.com/profile_images/664886718559076352/M00cOLrh.jpg',
        },
      ],
    },
  }

  expect(objectToYaml(obj)).toMatchSnapshot()
})
