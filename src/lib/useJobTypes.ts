"use client";

import { useState, useEffect } from "react";
import {
  fetchJobTypeOptions,
  getJobTypeOptionsSync,
  fetchPopularJobTypes,
  getPopularJobTypesSync,
  fetchCategoryGroupedJobTypes,
  getCategoryGroupedJobTypesSync,
  JobTypeOption,
  CategoryGroupedJobTypeOption,
} from "./job-types-cache";

export function useJobTypes(): JobTypeOption[] {
  const [options, setOptions] = useState<JobTypeOption[]>(getJobTypeOptionsSync);

  useEffect(() => {
    fetchJobTypeOptions().then(setOptions);
  }, []);

  return options;
}

export function useCategoryGroupedJobTypes(): CategoryGroupedJobTypeOption[] {
  const [grouped, setGrouped] = useState<CategoryGroupedJobTypeOption[]>(getCategoryGroupedJobTypesSync);

  useEffect(() => {
    fetchCategoryGroupedJobTypes().then(setGrouped);
  }, []);

  return grouped;
}

export function usePopularJobTypes(): JobTypeOption[] {
  const [popular, setPopular] = useState<JobTypeOption[]>(getPopularJobTypesSync);

  useEffect(() => {
    fetchPopularJobTypes().then(setPopular);
  }, []);

  return popular;
}
