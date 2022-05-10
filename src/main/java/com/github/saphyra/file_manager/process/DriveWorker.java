package com.github.saphyra.file_manager.process;

import com.github.saphyra.file_manager.common.ExecutionResult;
import com.github.saphyra.file_manager.common.ExecutorServiceBean;
import com.github.saphyra.file_manager.common.ExecutorServiceBeanFactory;
import com.github.saphyra.file_manager.common.Properties;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.Callable;
import java.util.concurrent.Executors;
import java.util.concurrent.Future;

@Component
@Slf4j
public class DriveWorker {
    private final Map<Character, ExecutorServiceBean> workers;

    DriveWorker(ExecutorServiceBeanFactory executorServiceBeanFactory, Properties properties) {
        Map<Character, ExecutorServiceBean> workers = new HashMap<>();

        properties.getGroups()
            .forEach(strings -> {
                ExecutorServiceBean executorServiceBean = executorServiceBeanFactory.create(Executors.newSingleThreadExecutor());
                strings.forEach(s -> workers.put(s, executorServiceBean));
            });
        this.workers = workers;
    }

    public Future<ExecutionResult<Void>> execute(char driveLetter, Runnable runnable) {
        return workers.get(driveLetter)
            .execute(runnable);
    }

    public <T> Future<ExecutionResult<T>> call(char driveLetter, Callable<T> callable) {
        return workers.get(driveLetter)
            .asyncProcess(callable);
    }
}
