package com.sapphire.domain.job.dto;

public class CompanyJobSummary {
    private Integer newApplicantCount;
    private Integer unreadApplicantCount;
    private Integer tomorrowDeadlineJobCount;
    private Integer applicantCount;

    public Integer getNewApplicantCount() {
        return newApplicantCount;
    }

    public void setNewApplicantCount(Integer newApplicantCount) {
        this.newApplicantCount = newApplicantCount;
    }

    public Integer getUnreadApplicantCount() {
        return unreadApplicantCount;
    }

    public void setUnreadApplicantCount(Integer unreadApplicantCount) {
        this.unreadApplicantCount = unreadApplicantCount;
    }

    public Integer getTomorrowDeadlineJobCount() {
        return tomorrowDeadlineJobCount;
    }

    public void setTomorrowDeadlineJobCount(Integer tomorrowDeadlineJobCount) {
        this.tomorrowDeadlineJobCount = tomorrowDeadlineJobCount;
    }

    public Integer getApplicantCount() {
        return applicantCount;
    }

    public void setApplicantCount(Integer applicantCount) {
        this.applicantCount = applicantCount;
    }
}
