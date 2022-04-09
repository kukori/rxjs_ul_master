import { interval, Subject, share } from "rxjs";
import { tap } from 'rxjs/operators';
import { loadingService } from './loadingService'

// SUBJECT:

const observer = {
    next: (value: any) => console.log('next', value),
    error: (error: Error) => console.log('error', error),
    complete: () => console.log('completed'),
}

const subject = new Subject();

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


// BEHAVIOURSUBJECT: