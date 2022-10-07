import { deployContracts } from '../deployContracts';

export default function stackFixture() {
  return deployContracts({ log: false, writeInDB: false });
}
