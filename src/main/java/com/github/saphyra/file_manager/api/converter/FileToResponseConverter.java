package com.github.saphyra.file_manager.api.converter;

import com.github.saphyra.file_manager.api.model.FileResponse;
import com.github.saphyra.file_manager.api.model.FileType;
import org.springframework.stereotype.Component;

import java.io.File;

@Component
public class FileToResponseConverter {
    public FileResponse convert(File file) {
        return FileResponse.builder()
            .path(file.getPath())
            .name(file.getName().isEmpty() ? file.getPath() : file.getName())
            .type(file.isDirectory() ? FileType.DIRECTORY : FileType.FILE)
            .lastModified(file.lastModified())
            .size(file.length())
            .build();
    }
}
