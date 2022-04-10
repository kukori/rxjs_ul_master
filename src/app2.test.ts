import { map, mergeMap } from 'rxjs/operators';
import { concat, take, from, delay, of, catchError, interval, toArray } from 'rxjs';

describe("siubscribe & assert testing in rxjs", () => {
    it('should compare each emitted value', () => {
        const source = of(1,2,3);
        const final = source.pipe(
            map(value => value * 10)
        )

        const expected = [10,20,30];
        let index = 0;

        final.subscribe(value => {
            expect(value).toEqual(expected[index])
            index++;
        })
    });

    it('should compare emitted values on completion with toArray', () => {
        const source = of(1,2,3);
        const final = source.pipe(
            map(value => value * 10),
            toArray()
        )

        const expected = [10,20,30];

        final.subscribe(value => {
            expect(value).toEqual(expected)
        })
    });

    it('should let u test async operations with done callback', done => {
        const source = of('Ready', 'Set', 'Go!').pipe(
            mergeMap((message, index) => of(message).pipe(
                delay(index * 1000)
            ))
        );

        const expected = ['Ready', 'Set', 'Go!'];
        let index = 0;

        source.subscribe(value => {
            expect(value).toEqual(expected[index])
            index++;
        }, null, done);
    });

    it('should let you test error and error messages', () => {

        const source = of({ firstName: 'Brian', lastName: 'Smith'}, null).pipe(
            map(object => `${object.firstName} ${object.lastName}`),
            catchError(() => {
                throw 'Invalid user!';
            })  
        );
        // # represents the error
        const expected = ['Brian Smith', 'Invalid user!'];
        let index = 0;

        source.subscribe({
            next: value => { expect(value).toEqual(expected[index]); index++;},
            error: error => { expect(error).toEqual(expected[index]); index++;}
        })
    });
});