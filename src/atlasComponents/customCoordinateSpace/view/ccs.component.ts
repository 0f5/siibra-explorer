import { ChangeDetectionStrategy, Component, EventEmitter, inject, Input, Output } from "@angular/core";
import { CCSNavState, SyncCustomCS } from "../const";
import { SxplrTemplate } from "src/atlasComponents/sapi/sxplrTypes";
import { BehaviorSubject, combineLatest, Subject } from "rxjs";
import { DestroyDirective } from "src/util/directives/destroy.directive";
import { debounceTime, filter, map, shareReplay, switchMap, takeUntil } from "rxjs/operators";
import { FormControl, FormGroup } from "@angular/forms";

function guardArrLen<T>(v: T[]): v is [T, T, T] {
  return v.length === 3
}
function guardArrLen4<T>(v: T[]): v is [T, T, T, T] {
  return v.length === 4
}

@Component({
  selector: 'custom-coordinate-space',
  templateUrl: './ccs.template.html',
  styleUrls: [
    './ccs.style.scss'
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  hostDirectives: [
    DestroyDirective,
  ]
})

export class CustomCoordinateSpaceView {

  #ondestroy = inject(DestroyDirective).destroyed$

  #ccs$ = new BehaviorSubject<SyncCustomCS>(null)
  @Input()
  set ccs(val: SyncCustomCS) {
    this.#ccs$.next(val)
  }
  ccs$ = this.#ccs$.pipe(
    filter(v => !!v),
    shareReplay(1),
  )

  #template = new BehaviorSubject<SxplrTemplate>(null)

  @Input()
  set template(val: SxplrTemplate) {
    this.#template.next(val)
  }

  #position = new BehaviorSubject<[number, number, number]>(null)
  @Input()
  set position(val: number[]) {
    if (!val) {
      return
    }
    if (!guardArrLen(val)) {
      return
    }
    this.#position.next(val)
  }

  #orientation = new BehaviorSubject<[number, number, number, number]>(null)
  @Input()
  set orientation(val: number[]) {
    if (!val) {
      return
    }
    if (!guardArrLen4(val)) {
      return
    }
    this.#orientation.next(val)
  }

  @Output()
  requestViewerNavChange = new EventEmitter<Partial<CCSNavState>>()

  #viewerState$ = combineLatest([
    this.#template,
    this.#position,
    this.#orientation,
  ]).pipe(
    shareReplay(1),
  )

  #formgroup = new Subject<FormGroup>()

  // on every (debounced) update of template/position, the formgroup is destroyed and recreated. 
  // so we effective do the react mantra. 
  // check performance implications
  containerView$ = this.ccs$.pipe(
    switchMap(ccs => this.#viewerState$.pipe(
      map(([template, position, orientation]) => ccs.onViewerUpdate(template, { orientation, position })),
      map(values => {
        if (!values) {
          return null
        }
        const formGroup = new FormGroup(values.map(v => new FormControl(v)))

        this.#formgroup.next(formGroup)
        formGroup.valueChanges.pipe(
          takeUntil(this.#formgroup),
          debounceTime(1000),
        ).subscribe(value => {
          // valuechange is in dict
          // convert to arr
          const arr = []
          for (const key in value){
            arr[key] = value[key]
          }
          ccs.onValueUpdate(arr)
        })
        return {
          ccs,
          formGroup,
        }
      })
    )),
    shareReplay(1),
  )

  constructor(){
    this.ccs$.pipe(
      switchMap(ccs => ccs.emitChangeViewerNav$),
      takeUntil(this.#ondestroy),
    ).subscribe(ev => {
      this.requestViewerNavChange.emit(ev)
    })
  }
}

