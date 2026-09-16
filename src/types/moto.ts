export type UUID = string;
export type ISODateTime = string;

export interface EntityMeta {
  id: UUID;
  organizationId: UUID;
  businessUnitId: UUID;
  createdAt: ISODateTime;
  updatedAt: ISODateTime;
}

export enum RepairOrderStatus { Draft="draft", DroppedOff="dropped_off", InService="in_service", WaitingApproval="waiting_approval", WaitingParts="waiting_parts", Ready="ready", Completed="completed", Cancelled="cancelled" }
export enum LaborType { FlatRate="flat_rate", ActualTime="actual_time" }
export enum PaymentPreference { Cash="cash", Card="card", ACH="ach", Other="other", Unknown="unknown" }
export enum InspectionType { Intake="intake", Service="service", Final="final" }
export enum InspectionResult { Good="good", Monitor="monitor", Service="service", Fail="fail", NA="na" }
export enum ServiceOperationStatus { NotStarted="not_started", InProgress="in_progress", Checked="checked", Adjusted="adjusted", Replaced="replaced", Completed="completed", NA="na" }
export enum FindingSeverity { Information="information", Monitor="monitor", ServiceSoon="service_soon", Immediate="immediate" }
export enum FindingStatus { Open="open", Corrected="corrected", Deferred="deferred", ConvertedToRecommendation="converted_to_recommendation" }
export enum RecommendationPriority { Monitor="monitor", NextService="next_service", Soon="soon", Immediate="immediate" }
export enum RecommendationStatus { Open="open", Approved="approved", Deferred="deferred", Completed="completed", Declined="declined" }
export enum RoadTestItemResult { Normal="normal", Abnormal="abnormal", NA="na" }
export enum RoadTestResult { Pass="pass", Fail="fail", NotPerformed="not_performed" }
export enum QCResult { Pass="pass", Fail="fail", NA="na" }
export enum MeasurementSource { Measured="measured", Estimated="estimated", Specification="specification" }
export enum ServiceHistoryEventType { Service="service", Repair="repair", Adjustment="adjustment", Finding="finding", Recommendation="recommendation", RoadTest="road_test" }

export interface Measurement { id: UUID; label: string; value: number; unit: string; source: MeasurementSource; specification?: number|string|null; note?: string|null; }
export interface BeforeAfterMeasurement { label:string; unit:string; before?:number|null; specification?:number|string|null; after?:number|null; }

export interface Motorcycle extends EntityMeta { customerId:UUID; vin:string; year:number; make:string; model:string; trim?:string|null; engine?:string|null; color?:string|null; licensePlate?:string|null; currentMileage:number; frontTireSize?:string|null; rearTireSize?:string|null; notes?:string|null; openRecommendations?:Recommendation[]; serviceHistory?:MotorcycleServiceHistoryEntry[]; }

export interface RepairOrder extends EntityMeta { roNumber:string; customerId:UUID; motorcycleId:UUID; technicianId:UUID; status:RepairOrderStatus; serviceTemplateId?:UUID|null; serviceName:string; mileageIn:number; mileageOut?:number|null; customerRequest?:string|null; technicianNotes?:string|null; laborType:LaborType; laborRate:number; estimatedLaborHours:number; actualLaborHours?:number|null; customerSuppliedFluids:boolean; customerSuppliedParts:boolean; paymentPreference:PaymentPreference; droppedOffAt?:ISODateTime|null; startedAt?:ISODateTime|null; completedAt?:ISODateTime|null; motorcycle?:Motorcycle; inspections?:Inspection[]; serviceOperations?:ServiceOperation[]; findings?:Finding[]; recommendations?:Recommendation[]; roadTest?:RoadTest|null; qualityControl?:QualityControl|null; }

export interface Inspection extends EntityMeta { repairOrderId:UUID; technicianId:UUID; type:InspectionType; startedAt?:ISODateTime|null; completedAt?:ISODateTime|null; items:InspectionItem[]; }
export interface InspectionItem { id:UUID; inspectionId:UUID; category:string; component:string; required:boolean; result:InspectionResult|null; measurement?:Measurement|null; technicianNote?:string|null; customerVisibleNote?:string|null; mediaIds:UUID[]; completedAt?:ISODateTime|null; }

export interface FluidServiceDetail { product?:string|null; viscosity?:string|null; quantity?:number|null; quantityUnit?:string|null; customerSupplied:boolean; drained:boolean; refilled:boolean; drainPlugInspected?:boolean; drainPlugORingReplaced?:boolean; magneticDebris?:string|null; finalLevelVerified:boolean; }
export interface ServiceOperation extends EntityMeta { repairOrderId:UUID; technicianId:UUID; category:string; component:string; operation:string; required:boolean; status:ServiceOperationStatus; specification?:string|null; measurements:BeforeAfterMeasurement[]; fluid?:FluidServiceDetail|null; technicianNote?:string|null; mediaIds:UUID[]; startedAt?:ISODateTime|null; completedAt?:ISODateTime|null; }

export interface Finding extends EntityMeta { repairOrderId:UUID; motorcycleId:UUID; technicianId:UUID; category:string; component:string; description:string; severity:FindingSeverity; status:FindingStatus; measurement?:Measurement|null; technicianNote?:string|null; customerVisibleNote?:string|null; correctedDuringService:boolean; correctiveAction?:string|null; correctedAt?:ISODateTime|null; mediaIds:UUID[]; recommendationId?:UUID|null; }
export interface Recommendation extends EntityMeta { motorcycleId:UUID; sourceRepairOrderId:UUID; findingId?:UUID|null; component:string; description:string; priority:RecommendationPriority; status:RecommendationStatus; createdMileage:number; recommendedByMileage?:number|null; recommendedByDate?:ISODateTime|null; technicianNote?:string|null; customerVisibleNote?:string|null; estimatedLaborHours?:number|null; estimatedPartsAmount?:number|null; mediaIds:UUID[]; completedRepairOrderId?:UUID|null; completedMileage?:number|null; completedAt?:ISODateTime|null; }

export interface RoadTest extends EntityMeta { repairOrderId:UUID; technicianId:UUID; startedAt?:ISODateTime|null; completedAt?:ISODateTime|null; startMileage?:number|null; endMileage?:number|null; items:RoadTestItem[]; overallResult:RoadTestResult|null; notPerformedReason?:string|null; technicianNote?:string|null; }
export interface RoadTestItem { id:UUID; roadTestId:UUID; component:string; required:boolean; result:RoadTestItemResult|null; note?:string|null; }
export interface QualityControl extends EntityMeta { repairOrderId:UUID; technicianId:UUID; items:QCItem[]; completed:boolean; completedAt?:ISODateTime|null; }
export interface QCItem { id:UUID; qualityControlId:UUID; category:string; component:string; check:string; required:boolean; result:QCResult|null; measurement?:Measurement|null; note?:string|null; completedAt?:ISODateTime|null; }

export interface MotorcycleServiceHistoryEntry { id:UUID; motorcycleId:UUID; repairOrderId:UUID; eventType:ServiceHistoryEventType; date:ISODateTime; mileage:number; title:string; summary?:string|null; sourceEntityType?:"repair_order"|"service_operation"|"finding"|"recommendation"|"road_test"; sourceEntityId?:UUID|null; }
