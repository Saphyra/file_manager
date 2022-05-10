package com.github.saphyra.file_manager.common;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

import static java.util.Objects.isNull;

@Component
@RequiredArgsConstructor
public class ExecutorServiceBeanFactory {
    private volatile static ExecutorService DEFAULT_EXECUTOR;

    private final SleepService sleepService;

    public ExecutorServiceBean create() {
        return create(defaultExecutor());
    }

    public ExecutorServiceBean create(ExecutorService executorService) {
        return ExecutorServiceBean.builder()
            .sleepService(sleepService)
            .executor(executorService)
            .build();
    }

    private static synchronized ExecutorService defaultExecutor() {
        if (isNull(DEFAULT_EXECUTOR)) {
            DEFAULT_EXECUTOR = Executors.newCachedThreadPool();
        }

        return DEFAULT_EXECUTOR;
    }
}
