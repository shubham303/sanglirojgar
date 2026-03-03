"use client";

import { useState, useEffect } from "react";
import {
  fetchJobTypeOptions,
  getJobTypeOptionsSync,
  fetchGroupedJobTypeOptions,
  getGroupedJobTypeOptionsSync,
  JobTypeOption,
  GroupedJobTypeOption,
} from "./job-types-cache";

export function useJobTypes(): JobTypeOption[] {
  const [options, setOptions] = useState<JobTypeOption[]>(getJobTypeOptionsSync);

  useEffect(() => {
    fetchJobTypeOptions().then(setOptions);
  }, []);

  return options;
}

export function useGroupedJobTypes(): GroupedJobTypeOption[] {
  const [grouped, setGrouped] = useState<GroupedJobTypeOption[]>(getGroupedJobTypeOptionsSync);

  useEffect(() => {
    fetchGroupedJobTypeOptions().then(setGrouped);
  }, []);

  return grouped;
}
