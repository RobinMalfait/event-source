import yamlify from 'yamlify-object';

function identity<T>(input: T): T {
  return input;
}

export function objectToYaml(object: any): string {
  if (object instanceof Error) {
    return objectToYaml({ ...object });
  }

  const output = yamlify(object, {
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
  });
  const [, ...lines] = output.split('\n');
  return lines.join('\n');
}
