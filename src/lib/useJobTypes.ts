"use client";

import { useState, useEffect } from "react";
import { fetchJobTypeOptions, getJobTypeOptionsSync, JobTypeOption } from "./job-types-cache";

export function useJobTypes(): JobTypeOption[] {
  const [options, setOptions] = useState<JobTypeOption[]>(getJobTypeOptionsSync);

  useEffect(() => {
    fetchJobTypeOptions().then(setOptions);
  }, []);

  return options;
}
