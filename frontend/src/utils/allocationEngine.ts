import type { Student, FacultyUser } from '../types';

/**
 * Intelligent Mentor-Student Allocation Engine
 * Divides and balances student cohorts across available department and institutional faculty.
 */

export interface FacultyWorkload {
  facultyId: string;
  allocatedCount: number;
  totalCohortCount: number;
  workloadPct: number;
  highRiskCount: number;
  medRiskCount: number;
  onTrackCount: number;
  avgAttendance: number;
}

/**
 * Automatically divides students across available faculty members.
 * Strategy:
 * 1. Honors existing explicit `assignedFacultyId` if the faculty still exists.
 * 2. Unassigned students are prioritized to faculty in the matching department.
 * 3. Workloads are balanced across faculty count so that cohorts are evenly distributed (e.g., 15 students across 3 faculty = 5 each).
 */
export function divideStudentsAcrossFaculty(
  students: Student[],
  facultyList: FacultyUser[],
  forceRebalance: boolean = false
): Map<string, string> {
  const allocationMap = new Map<string, string>(); // studentId -> facultyId

  if (!facultyList || facultyList.length === 0 || !students || students.length === 0) {
    return allocationMap;
  }

  const validFacultyIds = new Set(facultyList.map((f) => f._id));
  const facultyCounts = new Map<string, number>();
  facultyList.forEach((f) => facultyCounts.set(f._id, 0));

  const unassignedStudents: Student[] = [];

  // Step 1: Check existing assignments unless force rebalancing
  if (!forceRebalance) {
    for (const student of students) {
      if (student.assignedFacultyId && validFacultyIds.has(student.assignedFacultyId)) {
        allocationMap.set(student.id, student.assignedFacultyId);
        facultyCounts.set(student.assignedFacultyId, (facultyCounts.get(student.assignedFacultyId) || 0) + 1);
      } else {
        unassignedStudents.push(student);
      }
    }
  } else {
    unassignedStudents.push(...students);
  }

  if (unassignedStudents.length === 0) {
    return allocationMap;
  }

  const N = unassignedStudents.length;
  const K = facultyList.length;

  if (forceRebalance) {
    // When force rebalancing, the entire cohort N is distributed strictly evenly across K faculty.
    // Every faculty member will receive either baseQuota or baseQuota + 1 students.
    // When N is evenly divisible (e.g. 21 students across 3 faculty), every faculty gets exactly N / K (7 each).
    const baseQuota = Math.floor(N / K);
    const remainder = N % K;

    // Count students per department to prioritize extra remainder slots (+1) to departments with higher student density
    const deptStudentCounts = new Map<string, number>();
    for (const s of unassignedStudents) {
      deptStudentCounts.set(s.department, (deptStudentCounts.get(s.department) || 0) + 1);
    }

    const facultyTargetQuotas = new Map<string, number>();
    const sortedFacultyForQuota = [...facultyList].sort((a, b) => {
      const aDeptCount = deptStudentCounts.get(a.department) || 0;
      const bDeptCount = deptStudentCounts.get(b.department) || 0;
      if (bDeptCount !== aDeptCount) return bDeptCount - aDeptCount;
      return a.name.localeCompare(b.name);
    });

    sortedFacultyForQuota.forEach((f, idx) => {
      const quota = baseQuota + (idx < remainder ? 1 : 0);
      facultyTargetQuotas.set(f._id, quota);
    });

    const unplacedStudents: Student[] = [];
    const sortedStudents = [...unassignedStudents].sort((a, b) => a.rollNo.localeCompare(b.rollNo));

    // Pass 1: Assign students to their own department faculty who still have capacity below their quota
    for (const s of sortedStudents) {
      const deptFaculty = facultyList.filter(
        (f) =>
          f.department === s.department &&
          (facultyCounts.get(f._id) || 0) < (facultyTargetQuotas.get(f._id) || baseQuota)
      );

      if (deptFaculty.length > 0) {
        const chosen = deptFaculty.reduce((minF, currF) => {
          const minCount = facultyCounts.get(minF._id) || 0;
          const currCount = facultyCounts.get(currF._id) || 0;
          return currCount < minCount ? currF : minF;
        }, deptFaculty[0]);

        allocationMap.set(s.id, chosen._id);
        facultyCounts.set(chosen._id, (facultyCounts.get(chosen._id) || 0) + 1);
      } else {
        unplacedStudents.push(s);
      }
    }

    // Pass 2: Place any remaining students with faculty who still have unfilled quota slots
    for (const s of unplacedStudents) {
      const availableFaculty = facultyList.filter(
        (f) => (facultyCounts.get(f._id) || 0) < (facultyTargetQuotas.get(f._id) || baseQuota)
      );

      if (availableFaculty.length > 0) {
        const chosen = availableFaculty.reduce((minF, currF) => {
          const minCount = facultyCounts.get(minF._id) || 0;
          const currCount = facultyCounts.get(currF._id) || 0;
          return currCount < minCount ? currF : minF;
        }, availableFaculty[0]);

        allocationMap.set(s.id, chosen._id);
        facultyCounts.set(chosen._id, (facultyCounts.get(chosen._id) || 0) + 1);
      }
    }

    return allocationMap;
  }

  // Incremental division for unassigned students (forceRebalance = false)
  const maxQuota = Math.ceil(students.length / K);
  const sortedStudents = [...unassignedStudents].sort((a, b) => a.rollNo.localeCompare(b.rollNo));

  for (const s of sortedStudents) {
    // 1. Try department faculty under maxQuota
    const deptFaculty = facultyList.filter(
      (f) => f.department === s.department && (facultyCounts.get(f._id) || 0) < maxQuota
    );

    let chosen: FacultyUser | null = null;
    if (deptFaculty.length > 0) {
      chosen = deptFaculty.reduce((minF, currF) => {
        const minCount = facultyCounts.get(minF._id) || 0;
        const currCount = facultyCounts.get(currF._id) || 0;
        return currCount < minCount ? currF : minF;
      }, deptFaculty[0]);
    } else {
      chosen = facultyList.reduce((minF, currF) => {
        const minCount = facultyCounts.get(minF._id) || 0;
        const currCount = facultyCounts.get(currF._id) || 0;
        return currCount < minCount ? currF : minF;
      }, facultyList[0]);
    }

    if (chosen) {
      allocationMap.set(s.id, chosen._id);
      facultyCounts.set(chosen._id, (facultyCounts.get(chosen._id) || 0) + 1);
    }
  }

  return allocationMap;
}

/**
 * Returns the effective list of students allocated to a given faculty member.
 * Falls back to dynamic balanced allocation if explicit IDs are not yet synced.
 */
export function getAllocatedStudentsForFaculty(
  facultyId: string,
  students: Student[],
  facultyList: FacultyUser[]
): Student[] {
  if (!students || students.length === 0) return [];
  if (!facultyList || facultyList.length === 0) return [];

  // Check if explicit assignments exist
  const totalAssignedExplicit = students.filter((s) => s.assignedFacultyId).length;

  // If explicit assignments exist, filter by assignedFacultyId
  if (totalAssignedExplicit > 0) {
    return students.filter((s) => s.assignedFacultyId === facultyId);
  }

  // Otherwise, calculate the dynamic division
  const allocationMap = divideStudentsAcrossFaculty(students, facultyList, false);
  return students.filter((s) => allocationMap.get(s.id) === facultyId);
}

/**
 * Calculates allocation stats for all faculty in the directory
 */
export function calculateFacultyWorkloads(
  facultyList: FacultyUser[],
  students: Student[]
): Map<string, FacultyWorkload> {
  const workloads = new Map<string, FacultyWorkload>();
  if (!facultyList || facultyList.length === 0) return workloads;

  const validFacultyIds = new Set(facultyList.map((f) => f._id));
  const hasExplicit = students.some((s) => s.assignedFacultyId && validFacultyIds.has(s.assignedFacultyId));
  const allocationMap = hasExplicit
    ? new Map(students.filter((s) => s.assignedFacultyId && validFacultyIds.has(s.assignedFacultyId)).map((s) => [s.id, s.assignedFacultyId!]))
    : divideStudentsAcrossFaculty(students, facultyList, false);

  for (const f of facultyList) {
    const allocated = students.filter((s) => allocationMap.get(s.id) === f._id);
    const count = allocated.length;
    const avgAtt = count > 0 ? +(allocated.reduce((a, s) => a + s.attendancePct, 0) / count).toFixed(1) : 0;
    
    // Quick risk count
    const highRiskCount = allocated.filter((s) => s.attendancePct < 65 || s.backlogs > 3).length;
    const medRiskCount = allocated.filter((s) => (s.attendancePct >= 65 && s.attendancePct < 75) || s.backlogs === 1 || s.backlogs === 2).length;
    const onTrackCount = count - highRiskCount - medRiskCount;

    workloads.set(f._id, {
      facultyId: f._id,
      allocatedCount: count,
      totalCohortCount: students.length,
      workloadPct: students.length > 0 ? Math.round((count / students.length) * 100) : 0,
      highRiskCount,
      medRiskCount,
      onTrackCount,
      avgAttendance: avgAtt,
    });
  }

  return workloads;
}
