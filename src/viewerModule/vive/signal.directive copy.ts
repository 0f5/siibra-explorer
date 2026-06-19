import { ComponentFactoryResolver, Directive, ViewContainerRef } from "@angular/core";
import { ViveSignal } from "./viveSignal/viveSignal.component";

@Directive({
  selector: '[leap-control-view-ref]'
})
export class ViveControlViewRef {
  constructor(
    private vcr: ViewContainerRef,
    private cfr: ComponentFactoryResolver,
  ){
    const cf = this.cfr.resolveComponentFactory(ViveSignal)
    this.vcr.createComponent(cf)
  }
}
