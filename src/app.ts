import { interval, Subject, share, BehaviorSubject, ReplaySubject, AsyncSubject } from "rxjs";
import { tap, scan, pluck, distinctUntilKeyChanged } from 'rxjs/operators';
import { loadingService } from './loadingService'

// SUBJECT:

const observer = {
    next: (value: any) => console.log('next', value),
    error: (error: Error) => console.log('error', error),
    complete: () => console.log('completed'),
}

// const subject = new Subject();
// With behaviorSubject all the emitted values get to the observers
// so not just the ones emitted after the subscription
// const subject = new BehaviorSubject('Hello');

// const subscription = subject.subscribe(observer);

// subject.next('Hello');

// const subscriptionTwo = subject.subscribe(observer);

// subject.next('world');

const interval$ = interval(2000).pipe(
    tap(value => console.log('new interval', value))
)

// interval$.subscribe(observer);
// interval$.subscribe(observer);
// this way we multicast one interval to multiple subscriptions 
// interval$.subscribe(subject)

const loader = document.getElementById('loader');

// const loading = new Subject();
loadingService.loadingStatus.subscribe(isLoading => {
// loading.subscribe(isLoading => {
    if(isLoading) {
        loader.classList.remove('hide');
    } else {
        loader.classList.add('hide');
    }
})

// loading.next(true);
// setTimeout(() => loading.next(false), 3000)

// loadingService.showLoading();
// setTimeout(() => loadingService.hideLoading(), 3000)


// SHARE:
const subject2 = new Subject();
const interval2 = interval(2000).pipe(
    tap(value => console.log('new interval', value))
)

// interval2.subscribe(subject2);

const multicastedInterval = interval2.pipe(
    // share instead of multicast (depricated)
    // share({ connector: () => new Subject(), resetOnError: false, resetOnComplete: true, resetOnRefCountZero: true })
    share()
)

// const subOne = subject2.subscribe(observer);
// const subTwo = subject2.subscribe(observer);
const subOne = multicastedInterval.subscribe(observer);
const subTwo = multicastedInterval.subscribe(observer);

setTimeout(() => {
   subOne.unsubscribe();
   subTwo.unsubscribe();
}, 3000)

// LAB2 application state
export class ObservableStore {
    private store: BehaviorSubject<Object>;
    private stateUpdates: Subject<Object>;

    constructor(initialState: Object) {
        this.store = new BehaviorSubject(
            initialState
        );

        this.stateUpdates = new Subject();
        this.stateUpdates.pipe(
            scan((state, current) => {
                return { ...state, ...current }
            }, initialState)
        ).subscribe(this.store)
    }

    updateState(stateUpdate: Object) {
        this.stateUpdates.next(stateUpdate);
    }

    selectState(stateKey: any) {
        return this.store.pipe(
            distinctUntilKeyChanged(stateKey),
            pluck(stateKey)
        )
    }

    stateChanges() {
        return this.store.asObservable();
    }
}

const store = new ObservableStore({
    user: 'Brian',
    isAuthenticated: false
})

store.selectState('user').subscribe(console.log);


store.updateState({
    user: 'joe'
})


// REPLAYSUBJECT:
const replaySubject = new ReplaySubject(2);

replaySubject.next('Hello');
replaySubject.next('Goodbye!');
replaySubject.next('World!');

// const subscription = replaySubject.subscribe(observer);

// SHAREREPLAY:
// shareReplay turns a unicast observable into multicasted observable, utilizing a ReplaySubject behind the scenes.

// ASYNCSUBJECT:
//  AsyncSubject's only emit the final value on completion.
const asyncSubject = new AsyncSubject();

const subscription = asyncSubject.subscribe(observer);
const secondSubscription = asyncSubject.subscribe(observer);

asyncSubject.next('Hello');
asyncSubject.next('World');
asyncSubject.next('Goodbye!');
asyncSubject.next('utolso!');
asyncSubject.complete();