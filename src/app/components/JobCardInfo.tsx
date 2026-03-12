"use client";

import { Job } from "@/lib/types";
import { formatDateMarathi, formatLocation, formatExperience } from "@/lib/utils";
import { useTranslation } from "@/lib/i18n/LanguageContext";

interface JobCardInfoProps {
  job: Job;
  hideHeader?: boolean;
  showEmployerName?: boolean;
  showDescription?: boolean;
  truncateDescription?: boolean;
  showWorkerCount?: boolean;
  showClickCounts?: boolean;
}

export function JobCardInfo({
  job,
  hideHeader = false,
  showEmployerName = false,
  showDescription = false,
  truncateDescription = false,
  showWorkerCount = false,
  showClickCounts = false,
}: JobCardInfoProps) {
  const { t, lang } = useTranslation();
  return (
    <>
      {!hideHeader && (
        <div className="flex items-start justify-between gap-2">
          <h2 className="text-base font-bold" style={{ color: "#FF6B00" }}>
            {job.job_type_display}
          </h2>
          <span className="text-xs text-gray-400 whitespace-nowrap mt-0.5">
            {formatDateMarathi(job.created_at, lang)}
          </span>
        </div>
      )}
      <div className={`${hideHeader ? "" : "mt-1.5 "}space-y-0.5 text-sm text-gray-600`}>
        <p>
          <span className="font-medium text-gray-500">{t("card.location")}</span> {formatLocation(job.taluka, job.district, lang)}
        </p>
        {showDescription && job.description && (
          <p
            className={`text-gray-500${truncateDescription ? " overflow-hidden" : ""}`}
            style={
              truncateDescription
                ? {
                    display: "-webkit-box",
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical" as const,
                  }
                : undefined
            }
          >
            {job.description}
          </p>
        )}
        {(job.minimum_education || job.experience_years) && (
          <p className="text-xs text-gray-500">
            {[
              job.minimum_education,
              job.experience_years && formatExperience(job.experience_years, lang),
            ].filter(Boolean).join(" · ")}
          </p>
        )}
        <p className="font-semibold text-gray-800">
          ₹ {job.salary}
        </p>
        {showWorkerCount && (
          <p className="text-xs text-gray-400">
            {t("card.workersNeeded")} {job.workers_needed}
          </p>
        )}
        {showEmployerName && (
          <p className="text-gray-400 text-xs">
            {job.employer_name}
          </p>
        )}
        {showClickCounts && (
          <p className="text-xs text-gray-400">
            📞 {job.call_count ?? 0} {t("card.calls")} &nbsp; 💬 {job.whatsapp_count ?? 0} WhatsApp
          </p>
        )}
      </div>
    </>
  );
}
