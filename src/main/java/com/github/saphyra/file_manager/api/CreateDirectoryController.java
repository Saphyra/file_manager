package com.github.saphyra.file_manager.api;

import com.github.saphyra.file_manager.api.converter.FileToResponseConverter;
import com.github.saphyra.file_manager.api.model.CreateDirectoryRequest;
import com.github.saphyra.file_manager.api.model.FileResponse;
import com.github.saphyra.file_manager.common.Endpoints;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import java.io.File;

import static org.apache.logging.log4j.util.Strings.isBlank;

@RestController
@RequiredArgsConstructor
@Slf4j
public class CreateDirectoryController {
    private final FileToResponseConverter fileToResponseConverter;

    @PutMapping(Endpoints.CREATE_DIRECTORY)
    FileResponse createDirectory(@RequestBody CreateDirectoryRequest request) {
        log.info("Creating directory {}", request);

        if (isBlank(request.getParent())) {
            throw new IllegalArgumentException("Parent is blank.");
        }

        if (isBlank(request.getName())) {
            throw new IllegalArgumentException("Name is blank.");
        }

        File parent = new File(request.getParent());
        if (!parent.exists()) {
            throw new IllegalArgumentException("Parent does not exist.");
        }

        if (!parent.isDirectory()) {
            throw new IllegalArgumentException("Parent is not a directory.");
        }

        File targetFile = new File(parent.getPath() + "/" + request.getName());
        if (targetFile.exists() && targetFile.isDirectory()) {
            throw new IllegalArgumentException("Directory already exists.");
        }

        if (!targetFile.mkdirs()) {
            throw new RuntimeException("Directory was not created.");
        }

        return fileToResponseConverter.convert(targetFile);
    }
}
