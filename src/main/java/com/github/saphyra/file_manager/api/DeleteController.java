package com.github.saphyra.file_manager.api;

import com.github.saphyra.file_manager.api.model.OneParamRequest;
import com.github.saphyra.file_manager.common.Endpoints;
import com.github.saphyra.file_manager.common.ExecutorServiceBean;
import com.github.saphyra.file_manager.common.FileUtils;
import com.github.saphyra.file_manager.process.DeleteProcess;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import java.io.File;
import java.util.List;

import static org.apache.commons.lang3.StringUtils.isBlank;

@RestController
@RequiredArgsConstructor
@Slf4j
public class DeleteController {
    private final ExecutorServiceBean executorServiceBean;

    @DeleteMapping(Endpoints.DELETE_ALL)
    void delete(@RequestBody List<String> paths) {
        paths.stream()
            .map(OneParamRequest::new)
            .forEach(this::delete);
    }

    @DeleteMapping(Endpoints.DELETE)
    void delete(@RequestBody OneParamRequest<String> request) {
        log.info("Deleting file {}", request);

        if (isBlank(request.getValue())) {
            throw new IllegalArgumentException("File is blank");
        }

        File file = new File(request.getValue());
        if (!file.exists()) {
            throw new IllegalArgumentException("File does not exist.");
        }

        if (FileUtils.isRoot(file)) {
            throw new IllegalArgumentException("Root cannot be deleted.");
        }

        executorServiceBean.execute(new DeleteProcess(file));
    }
}
