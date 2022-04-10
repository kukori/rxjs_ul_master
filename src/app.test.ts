import { TestScheduler } from 'rxjs/testing';

describe("Marble testing rxjs", () => {
    let testScheduler: TestScheduler;

    beforeEach(() => {
        testScheduler = new TestScheduler((actual, expected) => {
            expect(actual).toEqual(expected);
        })
    })

    it('should convert ascii', () => {
        testScheduler.run(helpers => {
            // testing logic
            const { cold, expectObservable, } = helpers;
            const source = cold('--a-b---c')
            const expected = '--a-b---c';
            expectObservable(source).toBe(expected);
        })
    })
});