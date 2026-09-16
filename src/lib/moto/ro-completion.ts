import { FindingStatus, InspectionResult, QCResult, RecommendationStatus, RepairOrder, RepairOrderStatus, RoadTestItemResult, RoadTestResult, ServiceOperationStatus } from "@/types/moto";

export enum ROCompletionSection { RepairOrder="repair_order", Inspection="inspection", Service="service", Findings="findings", RoadTest="road_test", QualityControl="quality_control" }
export enum ROBlockerCode { MissingMileage="missing_mileage", MissingInspection="missing_inspection", IncompleteInspectionItem="incomplete_inspection_item", FailedInspectionItem="failed_inspection_item", MissingServiceOperation="missing_service_operation", IncompleteServiceOperation="incomplete_service_operation", InvalidServiceNA="invalid_service_na", UnresolvedFinding="unresolved_finding", MissingRoadTest="missing_road_test", IncompleteRoadTest="incomplete_road_test", FailedRoadTest="failed_road_test", MissingRoadTestReason="missing_road_test_reason", MissingQC="missing_qc", IncompleteQCItem="incomplete_qc_item", FailedQCItem="failed_qc_item", InvalidQCNA="invalid_qc_na" }
export enum ROWarningCode { OpenRecommendation="open_recommendation", MonitorInspection="monitor_inspection", ServiceInspection="service_inspection", RoadTestNotPerformed="road_test_not_performed", MissingMileageOut="missing_mileage_out" }

export interface ROCompletionBlocker { id:string; code:ROBlockerCode; section:ROCompletionSection; label:string; description?:string; target?:string; entityId?:string; }
export interface ROCompletionWarning { id:string; code:ROWarningCode; section:ROCompletionSection; label:string; description?:string; target?:string; entityId?:string; }
export interface ROSectionCompletion { complete:boolean; required:number; completed:number; }
export interface ROCompletionState { canComplete:boolean; complete:boolean; blockers:ROCompletionBlocker[]; warnings:ROCompletionWarning[]; sections:{ inspection:ROSectionCompletion; service:ROSectionCompletion; findings:ROSectionCompletion; roadTest:ROSectionCompletion; qualityControl:ROSectionCompletion }; percentComplete:number; }

const hasText=(v:string|null|undefined):v is string=>Boolean(v?.trim());
const serviceDone=(s:ServiceOperationStatus)=>[ServiceOperationStatus.Checked,ServiceOperationStatus.Adjusted,ServiceOperationStatus.Replaced,ServiceOperationStatus.Completed,ServiceOperationStatus.NA].includes(s);

export function getROCompletionState(ro:RepairOrder):ROCompletionState {
 const blockers:ROCompletionBlocker[]=[]; const warnings:ROCompletionWarning[]=[];
 const block=(id:string,code:ROBlockerCode,section:ROCompletionSection,label:string,target?:string,entityId?:string,description?:string)=>blockers.push({id,code,section,label,target,entityId,description});
 const warn=(id:string,code:ROWarningCode,section:ROCompletionSection,label:string,target?:string,entityId?:string,description?:string)=>warnings.push({id,code,section,label,target,entityId,description});
 if(!Number.isFinite(ro.mileageIn)||ro.mileageIn<0) block("ro-mileage-in",ROBlockerCode.MissingMileage,ROCompletionSection.RepairOrder,"Mileage in is required","intake:mileage");
 if(ro.mileageOut==null) warn("ro-mileage-out",ROWarningCode.MissingMileageOut,ROCompletionSection.RepairOrder,"Final mileage has not been recorded","finish:mileage");

 const inspectionItems=(ro.inspections??[]).flatMap(i=>i.items.filter(x=>x.required));
 if(!inspectionItems.length) block("inspection-missing",ROBlockerCode.MissingInspection,ROCompletionSection.Inspection,"Required inspection is missing","intake");
 for(const item of inspectionItems){
  if(item.result==null){block(`inspection-${item.id}`,ROBlockerCode.IncompleteInspectionItem,ROCompletionSection.Inspection,`${item.component} inspection is incomplete`,`intake:${item.id}`,item.id);continue;}
  if(item.result===InspectionResult.Fail) block(`inspection-fail-${item.id}`,ROBlockerCode.FailedInspectionItem,ROCompletionSection.Inspection,`${item.component} has an unresolved inspection failure`,`intake:${item.id}`,item.id);
  if(item.result===InspectionResult.Monitor) warn(`inspection-monitor-${item.id}`,ROWarningCode.MonitorInspection,ROCompletionSection.Inspection,`${item.component} is marked Monitor`,`findings:${item.id}`,item.id);
  if(item.result===InspectionResult.Service) warn(`inspection-service-${item.id}`,ROWarningCode.ServiceInspection,ROCompletionSection.Inspection,`${item.component} requires service`,`findings:${item.id}`,item.id);
 }

 const ops=(ro.serviceOperations??[]).filter(o=>o.required);
 if(!ops.length) block("service-operations-missing",ROBlockerCode.MissingServiceOperation,ROCompletionSection.Service,"Required service operations are missing","service");
 for(const op of ops){
  if(!serviceDone(op.status)) block(`service-${op.id}`,ROBlockerCode.IncompleteServiceOperation,ROCompletionSection.Service,`${op.operation} is incomplete`,`service:${op.id}`,op.id);
  if(op.status===ServiceOperationStatus.NA&&!hasText(op.technicianNote)) block(`service-na-${op.id}`,ROBlockerCode.InvalidServiceNA,ROCompletionSection.Service,`${op.operation} requires an N/A reason`,`service:${op.id}`,op.id);
  if(op.fluid&&op.status!==ServiceOperationStatus.NA&&!op.fluid.finalLevelVerified) block(`fluid-level-${op.id}`,ROBlockerCode.IncompleteServiceOperation,ROCompletionSection.Service,`${op.operation} final fluid level must be verified`,`service:${op.id}`,op.id);
 }

 const findings=ro.findings??[];
 for(const f of findings){
  if(f.correctedDuringService){if(!hasText(f.correctiveAction)) block(`finding-correction-${f.id}`,ROBlockerCode.UnresolvedFinding,ROCompletionSection.Findings,`${f.component} corrective action is missing`,`findings:${f.id}`,f.id);continue;}
  if(!f.recommendationId&&f.status!==FindingStatus.Deferred) block(`finding-${f.id}`,ROBlockerCode.UnresolvedFinding,ROCompletionSection.Findings,`${f.component} finding needs a disposition`,`findings:${f.id}`,f.id,"Create a recommendation, correct the issue, or document that it was deferred.");
 }

 const rt=ro.roadTest;
 if(!rt) block("road-test-missing",ROBlockerCode.MissingRoadTest,ROCompletionSection.RoadTest,"Road test is required","test");
 else {
  if(rt.overallResult==null) block("road-test-incomplete",ROBlockerCode.IncompleteRoadTest,ROCompletionSection.RoadTest,"Road test has not been completed","test");
  if(rt.overallResult===RoadTestResult.Fail) block("road-test-failed",ROBlockerCode.FailedRoadTest,ROCompletionSection.RoadTest,"Road test failed","test",undefined,"Resolve the issue and complete a passing road test before closing the RO.");
  if(rt.overallResult===RoadTestResult.NotPerformed){ if(!hasText(rt.notPerformedReason)) block("road-test-no-reason",ROBlockerCode.MissingRoadTestReason,ROCompletionSection.RoadTest,"Reason required when road test is not performed","test:not-performed-reason"); else warn("road-test-not-performed",ROWarningCode.RoadTestNotPerformed,ROCompletionSection.RoadTest,"Road test was not performed","test",undefined,rt.notPerformedReason); }
  if(rt.overallResult!==RoadTestResult.NotPerformed) for(const item of rt.items.filter(i=>i.required)){ if(item.result==null) block(`road-test-item-${item.id}`,ROBlockerCode.IncompleteRoadTest,ROCompletionSection.RoadTest,`${item.component} road-test check is incomplete`,`test:${item.id}`,item.id); if(item.result===RoadTestItemResult.Abnormal) block(`road-test-abnormal-${item.id}`,ROBlockerCode.FailedRoadTest,ROCompletionSection.RoadTest,`${item.component} was abnormal during road test`,`test:${item.id}`,item.id); }
 }

 const qc=ro.qualityControl;
 if(!qc) block("qc-missing",ROBlockerCode.MissingQC,ROCompletionSection.QualityControl,"Final quality control is required","finish");
 else for(const item of qc.items.filter(i=>i.required)){ if(item.result==null){block(`qc-${item.id}`,ROBlockerCode.IncompleteQCItem,ROCompletionSection.QualityControl,`${item.check} is incomplete`,`finish:${item.id}`,item.id);continue;} if(item.result===QCResult.Fail) block(`qc-fail-${item.id}`,ROBlockerCode.FailedQCItem,ROCompletionSection.QualityControl,`${item.check} failed final QC`,`finish:${item.id}`,item.id); if(item.result===QCResult.NA&&!hasText(item.note)) block(`qc-na-${item.id}`,ROBlockerCode.InvalidQCNA,ROCompletionSection.QualityControl,`${item.check} requires an N/A reason`,`finish:${item.id}`,item.id); }

 for(const r of ro.recommendations??[]) if(r.status===RecommendationStatus.Open||r.status===RecommendationStatus.Deferred) warn(`recommendation-${r.id}`,ROWarningCode.OpenRecommendation,ROCompletionSection.Findings,`${r.component} recommendation remains open`,`findings:recommendation:${r.id}`,r.id,r.description);

 const sectionHasBlock=(s:ROCompletionSection)=>blockers.some(b=>b.section===s);
 const sections={
  inspection:{required:inspectionItems.length,completed:inspectionItems.filter(i=>i.result!=null&&i.result!==InspectionResult.Fail).length,complete:inspectionItems.length>0&&!sectionHasBlock(ROCompletionSection.Inspection)},
  service:{required:ops.length,completed:ops.filter(o=>serviceDone(o.status)&&!(o.status===ServiceOperationStatus.NA&&!hasText(o.technicianNote))&&!(o.fluid&&o.status!==ServiceOperationStatus.NA&&!o.fluid.finalLevelVerified)).length,complete:ops.length>0&&!sectionHasBlock(ROCompletionSection.Service)},
  findings:{required:findings.length,completed:Math.max(0,findings.length-blockers.filter(b=>b.section===ROCompletionSection.Findings).length),complete:!sectionHasBlock(ROCompletionSection.Findings)},
  roadTest:{required:1,completed:rt&&!sectionHasBlock(ROCompletionSection.RoadTest)?1:0,complete:Boolean(rt)&&!sectionHasBlock(ROCompletionSection.RoadTest)},
  qualityControl:{required:qc?.items.filter(i=>i.required).length??0,completed:qc?.items.filter(i=>i.required&&(i.result===QCResult.Pass||(i.result===QCResult.NA&&hasText(i.note)))).length??0,complete:Boolean(qc)&&!sectionHasBlock(ROCompletionSection.QualityControl)}
 };
 const completedSections=Object.values(sections).filter(s=>s.complete).length;
 const canComplete=blockers.length===0;
 return {canComplete,complete:ro.status===RepairOrderStatus.Completed&&canComplete,blockers,warnings,sections,percentComplete:Math.round(completedSections/5*100)};
}

export const canCompleteRepairOrder=(ro:RepairOrder)=>getROCompletionState(ro).canComplete;
