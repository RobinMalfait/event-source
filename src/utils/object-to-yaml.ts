import yamlify from 'yamlify-object';

const YAMLIFY_OPTIONS = {
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

export function objectToYaml(object: any): string {
  if (object instanceof Error) {
    return objectToYaml({ ...object });
  }

  const output = yamlify(object, YAMLIFY_OPTIONS);
  const [, ...lines] = output.split('\n');
  return lines.join('\n');
}
