import { TestDirectiveDirective } from './test-directive.directive';

describe('TestDirectiveDirective', () => {
  it('should create an instance', () => {
    const directive = new TestDirectiveDirective(null, null, null);
    expect(directive).toBeTruthy();
  });
});
