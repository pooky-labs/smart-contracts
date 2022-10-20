export default function numeric<V>([key]: [string, V]) {
  return isNaN(parseInt(key));
}
