package com.sapphire.domain.job.mapper;

import com.sapphire.domain.job.dto.JobPostRow;
import com.sapphire.domain.job.dto.JobDetailRow;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface JobPostMapper {
    List<JobPostRow> findOpenJobs(@Param("limit") int limit);

    JobDetailRow findOpenJobById(@Param("id") Long id);
}
