export function deepMerge(defaults, overrides) {
  if (!overrides || typeof overrides !== "object") return defaults;
  if (Array.isArray(defaults)) {
    return Array.isArray(overrides) && overrides.length ? overrides : defaults;
  }

  const merged = { ...defaults };
  Object.keys(overrides).forEach((key) => {
    const defaultValue = defaults?.[key];
    const overrideValue = overrides[key];
    if (overrideValue === undefined || overrideValue === null || overrideValue === "") return;
    if (
      defaultValue &&
      typeof defaultValue === "object" &&
      !Array.isArray(defaultValue) &&
      typeof overrideValue === "object" &&
      !Array.isArray(overrideValue)
    ) {
      merged[key] = deepMerge(defaultValue, overrideValue);
      return;
    }
    merged[key] = overrideValue;
  });
  return merged;
}
