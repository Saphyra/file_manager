package com.github.saphyra.file_manager.api;

import com.github.saphyra.file_manager.api.model.MoveRequest;
import com.github.saphyra.file_manager.common.Endpoints;
import com.github.saphyra.file_manager.common.ExecutorServiceBean;
import com.github.saphyra.file_manager.process.MoveProcess;
import com.github.saphyra.file_manager.process.ProcessContext;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import java.io.File;
import java.util.List;

import static org.apache.commons.lang3.StringUtils.isBlank;

@Slf4j
@RequiredArgsConstructor
@RestController
public class MoveController {
    private final ExecutorServiceBean executorServiceBean;
    private final ProcessContext processContext;

    @PostMapping(Endpoints.MOVE_ALL)
    void moveAll(@RequestBody List<MoveRequest> requests) {
        requests.forEach(this::move);
    }

    @PostMapping(Endpoints.MOVE)
    void move(@RequestBody MoveRequest request) {
        log.info("Moving file {}", request);

        if (isBlank(request.getSource())) {
            throw new IllegalArgumentException("Source is blank.");
        }

        if (isBlank(request.getTarget())) {
            throw new IllegalArgumentException("Target is blank.");
        }

        if (request.getTarget().equals(request.getSource())) {
            throw new IllegalArgumentException("It is already there.");
        }

        if (request.getTarget().startsWith(request.getSource())) {
            throw new IllegalArgumentException("You cannot copy something to itself.");
        }

        File source = new File(request.getSource());
        if (!source.exists()) {
            throw new IllegalArgumentException("Source does not exist.");
        }

        File target = new File(request.getTarget());
        if (!target.exists()) {
            throw new IllegalArgumentException("Target does not exist.");
        }

        if (!target.isDirectory()) {
            throw new IllegalArgumentException("Target is not a directory.");
        }

        executorServiceBean.execute(new MoveProcess(source, target, processContext));
    }
}
