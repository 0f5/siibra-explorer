import { DOCUMENT } from "@angular/common";
import { Inject, Injectable, Optional } from "@angular/core";
import { BehaviorSubject, EMPTY, interval, Observable, Subject } from "rxjs";
import { distinctUntilChanged, filter, map, switchMap, take, takeUntil } from "rxjs/operators";
import { NehubaViewerUnit } from "../nehuba";
import { NEHUBA_INSTANCE_INJTKN } from "../nehuba/util";


const PINCH_THRESHOLD = 0.80
const PALM_Z_THRESHOLD = 0.55
const ROTATION_SPEED = 0.0001
const ZOOM_SPEED = 40

type Finger = {
  extended: boolean
}

type Hand = {
  pinchStrength: number
  palmNormal: [number, number, number]
  palmVelocity: [number, number, number]

  thumb: Finger
  indexFinger: Finger
  middleFinger: Finger
  ringFinger: Finger
  pinky: Finger
}


@Injectable()
export class ViveService{

  constructor(
    @Optional() @Inject(NEHUBA_INSTANCE_INJTKN) private nehubaInst$: Observable<NehubaViewerUnit>,
    @Inject(DOCUMENT) document: Document,
  ){

    const ws = new WebSocket("ws://localhost:8765");

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      //handleFrame(data);
    };
  }


  handleFrame(data: any){
    
  }

  ⁄
  private setpose (pose : any){
    
  }
}
