declare namespace Chai {
  export interface Assertion extends LanguageChains, NumericComparison, TypeComparison {
    revertedMissingRole(subject: unknown, role: string): Chai.AsyncAssertion;
  }
}
