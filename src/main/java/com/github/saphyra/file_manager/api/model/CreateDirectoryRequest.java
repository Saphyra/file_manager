package com.github.saphyra.file_manager.api.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@NoArgsConstructor
@AllArgsConstructor
@Data
@Builder
public class CreateDirectoryRequest {
    private String parent;
    private String name;
}
