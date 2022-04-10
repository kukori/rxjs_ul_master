import { TestScheduler } from 'rxjs/testing';
import { map } from 'rxjs/operators';
import { concat, take, from, delay, of, catchError, interval } from 'rxjs';

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
    });

    it('values should match', () => {
        testScheduler.run(helpers => {
            const { cold, expectObservable, } = helpers;
            const source = cold('--a-b---c', { a: 1, b: 2, c: 3 })
            const final = source.pipe(
                map((value: any) => value * 10)
            )
            const expected = '--a-b---c';
            expectObservable(final).toBe(expected, { a: 10, b: 20, c: 30 });
        })
    });

    it('should let you identify sub points', () => {
        testScheduler.run(helpers => {
            const { cold, expectObservable, expectSubscriptions } = helpers;
            const sourceOne = cold('-a---b-|');
            const sourceTwo = cold('-c---d-|');
            const final = concat(sourceOne, sourceTwo);

            const expected = '-a---b--c---d-|';
            // ^ means subscribing ! means completing
            const sourceOneExpectedSub = '^------!';
            const sourceTwoExpectedSub = '-------^------!';

            expectObservable(final).toBe(expected);
            expectSubscriptions(sourceOne.subscriptions).toBe(sourceOneExpectedSub);
            expectSubscriptions(sourceTwo.subscriptions).toBe(sourceTwoExpectedSub);
        })
    });

    it('should let you test hot observables', () => {
        testScheduler.run(helpers => {
            const { hot, expectObservable } = helpers;
            const source = hot('--a-b-^-c');
            const final = source.pipe(take(1));
            const expected = '--(c|)';

            expectObservable(final).toBe(expected);
        })
    });

    it('should let you test sync operations', () => {
        testScheduler.run(helpers => {
            const { expectObservable } = helpers;
            const source = from([1,2,3,4,5]);
            // parenthesis means that all the values emitted at the same time
            const expected = '(abcde|)';

            expectObservable(source).toBe(expected, { a: 1, b: 2, c: 3, d: 4, e: 5 });
        })
    });

    it('should let you test async operations', () => {
        testScheduler.run(helpers => {
            const { expectObservable } = helpers;
            const source = from([1,2,3,4,5]);
            const final = source.pipe(delay(200))
            const expected = '200ms (abcde|)';

            expectObservable(final).toBe(expected, { a: 1, b: 2, c: 3, d: 4, e: 5 });
        })
    });

    it('should let you test error and error messages', () => {
        testScheduler.run(helpers => {
            const { expectObservable } = helpers;
            const source = of({ firstName: 'Brian', lastName: 'Smith'}, null).pipe(
                map(object => `${object.firstName} ${object.lastName}`),
                catchError(() => {
                    throw { message: 'Invalid user!'};
                })  
            );
            // # represents the error
            const expected = '(a#)'
            expectObservable(source).toBe(expected, { a: 'Brian Smith' }, { message: 'Invalid user!'});
        })
    });

    it('should let you test snapshots of streams that do not complete', () => {
        testScheduler.run(helpers => {
            const { expectObservable } = helpers;
            const source = interval(1000).pipe(
                map(value => `${value + 1}sec`),
            );
            const expected = '1s a 999ms b 999ms c';
            // the expected has to match the values emmitted before subscription
            const unsubscribe = '4s !'

            expectObservable(source, unsubscribe).toBe(expected, { a: '1sec', b: '2sec', c: '3sec' });
        })
    });
});