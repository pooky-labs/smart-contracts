export default function labelize<T extends object>(_enum: T, value: T[keyof T]): string {
  const entries = Object.entries(_enum);
  const found = entries.find(([, v]) => v === value);

  if (!found) {
    throw new Error(`Cannot find label of ${value}`);
  }

  return found[0].toLowerCase();
}
