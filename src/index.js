import localByDefault from 'postcss-modules-local-by-default';
import modulesParser from 'postcss-modules-parser';
import modulesScope from 'postcss-modules-scope';
import modulesValues from 'postcss-modules-values';
import postcss from 'postcss';

export const appendStyles = function() {
  const style = document.createElement('style');
  style.textContent = boundStyles.call(this).join('\n');
  document.head.appendChild(style);
};

const boundStyles = function() {
  return Array.isArray(this) ? this : styles;
};

let id = 1;
let instance;
export const css = function(strings, ...keys) {
  let options = {};
  Array.isArray(strings) ||
    ([options, strings, keys] = [strings, keys[0], keys.slice(1)]);
  keys.length &&
    !options.ignoreInterpolation &&
    console.warn(
      '`csstag` discourages from using string interpolation in tagged templates, because it makes it impossible to strip off csstag module on bundling using `babel-plugin-csstag`. To suppress this warning pass an option `ignoreInterpolation`.'
    );
  instance ||
    (instance = postcss([
      ...(options.pluginsBefore || []),
      modulesValues(options.modulesValues),
      localByDefault(options.localByDefault),
      modulesScope(options.modulesScope),
      modulesParser(options.modulesParser),
      ...(options.plugins || []),
    ]));
  const result = instance.process(
    strings
      .map((string, index) => (index ? keys[index - 1] : '') + string)
      .join(''),
    {
      from: (options.prefix || 'style') + id++,
      ...options.process,
    }
  );
  boundStyles.call(this).push(result.toString());
  return result.root.tokens;
};

export const resetStyles = function() {
  const boundStyles = boundStyles.call(this);
  return boundStyles.splice(0, boundStyles.length);
};

export const styles = [];

export default css;
