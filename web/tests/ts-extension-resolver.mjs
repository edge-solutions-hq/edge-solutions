export async function resolve(specifier, context, nextResolve) {
  if (specifier.startsWith('@/')) {
    const sourceUrl = new URL(`../src/${specifier.slice(2)}`, import.meta.url);

    try {
      return await nextResolve(sourceUrl.href, context);
    } catch (error) {
      if (error?.code !== 'ERR_MODULE_NOT_FOUND') throw error;
      return nextResolve(`${sourceUrl.href}.ts`, context);
    }
  }

  if (specifier.startsWith('.') && context.parentURL?.startsWith('file:')) {
    try {
      return await nextResolve(specifier, context);
    } catch (error) {
      if (error?.code !== 'ERR_MODULE_NOT_FOUND') throw error;
      return nextResolve(`${specifier}.ts`, context);
    }
  }

  return nextResolve(specifier, context);
}

export async function load(url, context, nextLoad) {
  if (!url.endsWith('.json')) return nextLoad(url, context);
  return nextLoad(url, {...context, importAttributes: {...context.importAttributes, type: 'json'}});
}
