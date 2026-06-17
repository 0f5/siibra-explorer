import { Component } from "@angular/core";
import { map } from "rxjs/operators";
import { ViveService } from "../service";

@Component({
  selector: 'vive-control-signal',
  templateUrl: './viveSignal.template.html',
  styleUrls: [
    './viveSignal.style.css'
  ]
})
export class ViveSignal{
  constructor(
    private svc: ViveSignal
  ){

  }
}
