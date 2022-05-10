package com.github.saphyra.file_manager.api;

import com.github.saphyra.file_manager.api.model.FileListResponse;
import com.github.saphyra.file_manager.api.model.FileResponse;
import com.github.saphyra.file_manager.api.model.FileType;
import com.github.saphyra.file_manager.api.model.OneParamRequest;
import com.github.saphyra.file_manager.common.Endpoints;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import java.io.File;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import static java.util.Objects.isNull;

@RestController
@Slf4j
public class ListFilesController {
    @PostMapping(Endpoints.GET_FILES)
    FileListResponse getFiles(@RequestBody(required = false) OneParamRequest<String> parent) {
        log.info("Querying content of {}", parent);

        Optional<String> parentValue = Optional.ofNullable(parent)
            .map(OneParamRequest::getValue)
            .filter(s -> !s.isBlank());

        if (parentValue.isPresent()) {
            File parentFile = new File(parent.getValue());
            if (!parentFile.exists()) {
                throw new IllegalArgumentException("File does not exits: " + parent);
            }

            if (!parentFile.isDirectory()) {
                throw new IllegalArgumentException(parentFile + " is not a directory.");
            }

            File[] files = parentFile.listFiles();
            if (isNull(files)) {
                return FileListResponse.builder()
                    .files(Collections.emptyList())
                    .build();
            }

            List<FileResponse> responses = Arrays.stream(files)
                .map(this::convert)
                .collect(Collectors.toList());

            return FileListResponse.builder()
                .parent(parentFile.getParent())
                .files(responses)
                .build();
        } else {
            List<FileResponse> responses = Arrays.stream(File.listRoots())
                .map(this::convert)
                .collect(Collectors.toList());
            return FileListResponse.builder()
                .files(responses)
                .build();
        }
    }

    private FileResponse convert(File file) {
        return FileResponse.builder()
            .path(file.getPath())
            .name(file.getName().isEmpty() ? file.getPath() : file.getName())
            .type(file.isDirectory() ? FileType.DIRECTORY : FileType.FILE)
            .lastModified(file.lastModified())
            .size(file.length())
            .build();
    }
}
