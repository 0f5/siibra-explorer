import { BehaviorSubject, Subject } from "rxjs";
import { SxplrTemplate } from "../sapi/sxplrTypes";
import { CCSNavState, SyncCustomCS } from "./const";
import { IDS } from "../sapi";
import { shareReplay } from "rxjs/operators";
import { arrayEqual } from "src/util/array";

const isAxisAligned = arrayEqual(null, true)

export class BigBrainSliceCS implements SyncCustomCS {
  label: string = "BigBrain slice index"
  onValueUpdate(values: string[]): void {
    if (values.length !== 1) {
      return
    }
    const match = /[0-9]{1,4}/.exec(values[0])
    if (!match) {
      return
    }
    const sliceNr = parseInt(match[0])
    const ytransl = sliceNr * 0.02 - 70.01
    this.#sub.next({
      position: [this.#currCoord[0], ytransl, this.#currCoord[2]],
      orientation: [0, 0, 0, 1],
    })

  }
  onViewerUpdate(tmpl: SxplrTemplate, navstate: CCSNavState): string[] {
    if (tmpl?.id !== IDS.TEMPLATES.BIG_BRAIN) {
      return null
    }
    if (!navstate) {
      return null
    }
    this.#currCoord = navstate.position
    const axisAlignedFlag = isAxisAligned(navstate.orientation, [0, 0, 0, 1])
    const val = [`${axisAlignedFlag ? '' : '(Oblique) '}Slice ${Math.ceil((navstate.position[1] + 70.010) / 0.02)}`]
    this.#value.next(val)
    return val
  }
  #currCoord: [number, number, number] = [0, 0, 0]
  #sub = new Subject<CCSNavState>()
  emitChangeViewerNav$ = this.#sub.asObservable()
  #value = new BehaviorSubject<string[]>(null)
  value$ = this.#value.pipe(
    shareReplay(1)
  )
}
