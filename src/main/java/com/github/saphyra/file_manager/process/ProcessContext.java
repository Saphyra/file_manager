package com.github.saphyra.file_manager.process;

import com.github.saphyra.file_manager.common.ExecutorServiceBean;
import com.github.saphyra.file_manager.common.SleepService;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Getter
public class ProcessContext {
    private final DriveWorker driveWorker;
    private final ExecutorServiceBean executorServiceBean;
    private final BufferSizeProvider bufferSizeProvider;
    private final SleepService sleepService;
}
