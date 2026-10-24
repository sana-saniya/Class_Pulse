import type { Student, RiskThresholds, RiskAssessment, RiskLevel } from '../types';

export function assessRisk(student: Student, thresholds: RiskThresholds): RiskAssessment {
  const { attendancePct, scores, backlogs } = student;
  const { mid1, mid2, assignmentsSubmitted, totalAssignments } = scores;
  const { attendanceMin, scoreDropMax, backlogsMax } = thresholds;

  const scoreDrop = mid1 > 0 ? ((mid1 - mid2) / mid1) * 100 : 0;
  const assignmentPct = totalAssignments > 0 ? (assignmentsSubmitted / totalAssignments) * 100 : 100;

  const reasons: string[] = [];

  if (attendancePct < attendanceMin) {
    reasons.push(`Attendance (${attendancePct}%) is below the minimum ${attendanceMin}%`);
  }
  if (scoreDrop > scoreDropMax) {
    reasons.push(`Mid-1 to Mid-2 score dropped by ${scoreDrop.toFixed(1)}% (limit: ${scoreDropMax}%)`);
  }
  if (backlogs > backlogsMax) {
    reasons.push(`${backlogs} pending backlogs exceed the limit of ${backlogsMax}`);
  }
  if (assignmentPct < 60) {
    reasons.push(`Only ${assignmentsSubmitted}/${totalAssignments} assignments submitted`);
  }

  let level: RiskLevel = 'On Track';
  if (reasons.length > 0) {
    const severe =
      attendancePct < 65 ||
      scoreDrop > 30 ||
      backlogs > 3;
    level = severe ? 'High Risk' : 'Medium Risk';
  }

  return { level, reasons, scoreDrop };
}

export function getRiskColor(level: RiskLevel) {
  switch (level) {
    case 'High Risk':   return { bg: 'bg-red-500/10',    text: 'text-red-400',    border: 'border-red-500/30',    dot: 'bg-red-400' };
    case 'Medium Risk': return { bg: 'bg-amber-500/10',  text: 'text-amber-400',  border: 'border-amber-500/30',  dot: 'bg-amber-400' };
    case 'On Track':    return { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/30', dot: 'bg-emerald-400' };
  }
}
