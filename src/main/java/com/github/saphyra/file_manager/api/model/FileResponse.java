package com.github.saphyra.file_manager.api.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@NoArgsConstructor
@AllArgsConstructor
@Data
@Builder
public class FileResponse {
    private String path;
    private String name;
    private FileType type;
    private Long lastModified;
    private Long size;
}
