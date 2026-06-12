package com.sapphire.domain.application.dto;

public class ApplicationDetailRow extends ApplicationListRow {
    private Long resumeFileId;
    private String resumeOriginalFileName;
    private String coverLetter;
    private String jobLocation;
    private String employmentType;
    private String workType;

    public Long getResumeFileId() {
        return resumeFileId;
    }

    public void setResumeFileId(Long resumeFileId) {
        this.resumeFileId = resumeFileId;
    }

    public String getResumeOriginalFileName() {
        return resumeOriginalFileName;
    }

    public void setResumeOriginalFileName(String resumeOriginalFileName) {
        this.resumeOriginalFileName = resumeOriginalFileName;
    }

    public String getCoverLetter() {
        return coverLetter;
    }

    public void setCoverLetter(String coverLetter) {
        this.coverLetter = coverLetter;
    }

    public String getJobLocation() {
        return jobLocation;
    }

    public void setJobLocation(String jobLocation) {
        this.jobLocation = jobLocation;
    }

    public String getEmploymentType() {
        return employmentType;
    }

    public void setEmploymentType(String employmentType) {
        this.employmentType = employmentType;
    }

    public String getWorkType() {
        return workType;
    }

    public void setWorkType(String workType) {
        this.workType = workType;
    }
}
