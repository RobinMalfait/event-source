import yamlify from 'yamlify-object';

let YAMLIFY_OPTIONS = {
  indent: '  ',
  colors: {
    date: identity,
    error: identity,
    symbol: identity,
    string: identity,
    number: identity,
    boolean: identity,
    null: identity,
    undefined: identity,
  },
};

function identity<T>(input: T): T {
  return input;
}

export function objectToYaml<T extends Object>(object: T): string {
  if (object instanceof Error) {
    return objectToYaml({ ...object });
  }

  return yamlify(object, YAMLIFY_OPTIONS)
    .split('\n')
    .slice(1)
    .join('\n');
}
