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

export function objectToYaml(object: any): string {
  if (object instanceof Error) {
    return objectToYaml({ ...object });
  }

  let output = yamlify(object, YAMLIFY_OPTIONS);
  let [, ...lines] = output.split('\n');
  return lines.join('\n');
}
