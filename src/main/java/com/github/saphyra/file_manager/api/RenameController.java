package com.github.saphyra.file_manager.api;

import com.github.saphyra.file_manager.api.converter.FileToResponseConverter;
import com.github.saphyra.file_manager.api.model.FileResponse;
import com.github.saphyra.file_manager.api.model.RenameRequest;
import com.github.saphyra.file_manager.common.Endpoints;
import com.github.saphyra.file_manager.common.FileUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import java.io.File;

import static org.apache.commons.lang3.StringUtils.isBlank;

@RestController
@RequiredArgsConstructor
@Slf4j
public class RenameController {
    private final FileToResponseConverter fileToResponseConverter;

    @PostMapping(Endpoints.RENAME)
    FileResponse rename(@RequestBody RenameRequest renameRequest) {
        log.info("Renaming file {}", renameRequest);

        if (isBlank(renameRequest.getFile())) {
            throw new IllegalArgumentException("File is blank.");
        }

        if (isBlank(renameRequest.getNewName())) {
            throw new IllegalArgumentException("NewName is blank.");
        }

        File file = new File(renameRequest.getFile());
        if (!file.exists()) {
            throw new IllegalArgumentException("File not found.");
        }

        if (FileUtils.isRoot(file)) {
            throw new IllegalArgumentException("Root must not be renamed");
        }

        if (file.getName().equals(renameRequest.getNewName())) {
            log.info("Names are the same.");
            return fileToResponseConverter.convert(file);
        }

        File newFile = new File(file.getParent() + "/" + renameRequest.getNewName());
        if(!file.getParent().equals(newFile.getParent())){
            throw new IllegalArgumentException("Parents are different. Use Move!");
        }

        if (!file.renameTo(newFile)) {
            throw new RuntimeException("File is not renamed.");
        }

        return fileToResponseConverter.convert(newFile);
    }
}
