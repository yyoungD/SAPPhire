package com.sapphire.domain.file.mapper;

import com.sapphire.domain.file.dto.FileRecord;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface FileMapper {
    void insert(FileRecord fileRecord);

    List<FileRecord> findRecentByUserAndCategory(
            @Param("userId") Long userId,
            @Param("category") String category,
            @Param("limit") int limit
    );

    FileRecord findByIdAndUploader(
            @Param("id") Long id,
            @Param("userId") Long userId
    );

    FileRecord findDownloadableByUser(
            @Param("id") Long id,
            @Param("userId") Long userId
    );
}
