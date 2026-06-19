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

  public ready$ = new BehaviorSubject(false)

  public currentpose$ = new Subject<string>()
  public connected$ = new BehaviorSubject<string>("disconnected (connecting)")

  private vec3: any
  private quat: any
  

  constructor(
    @Optional() @Inject(NEHUBA_INSTANCE_INJTKN) private nehubaInst$: Observable<NehubaViewerUnit>,
    @Inject(DOCUMENT) document: Document,
  ){
    let ws: WebSocket | null = null;

    try {
      ws = new WebSocket("ws://localhost:8765");

      ws.onopen = () => {
        this.connected$.next("connected");
      }
      
      ws.onerror = (event) => {
        console.warn("ViveService: websocket error", event);
        this.connected$.next("disconnected (websocket error)");
      };

      ws.onclose = (event) => {
        console.warn("ViveService: websocket closed", event);
        this.connected$.next("disconnected (websocket closed)");
      };

      ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        this.handleFrame(data);
      };
    } catch (error) {
      console.warn("ViveService: websocket connection failed", error);
    }

    this.ready$.next(true);

  }


  handleFrame(data: any){
    
  }

  private setpose (pose : any){

  }
}
