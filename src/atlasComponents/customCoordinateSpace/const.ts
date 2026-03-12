import { InjectionToken } from "@angular/core";
import { SxplrTemplate } from "../sapi/sxplrTypes";
import { Observable } from "rxjs";

export const CUSTOM_SYNC_COORDINATE_SPACE = new InjectionToken("CUSTOM_SYNC_COORDINATE_SPACE")
export const CUSTOM_ASYNC_COORDINATE_SPACE = new InjectionToken("CUSTOM_ASYNC_COORDINATE_SPACE")

export type CCSNavState = {
  position: [number, number, number],
  orientation: [number, number, number, number]
}

export type SyncCustomCS = {
  label: string
  descmd?: string

  onViewerUpdate(tmpl: SxplrTemplate, navstate: CCSNavState): string[]
  onValueUpdate(value: string[]): void
  value$: Observable<string[]|null>
  emitChangeViewerNav$: Observable<Partial<CCSNavState>>
}
