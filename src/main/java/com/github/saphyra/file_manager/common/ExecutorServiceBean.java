package com.github.saphyra.file_manager.common;

import com.google.common.collect.Lists;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.NonNull;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import java.util.Collection;
import java.util.List;
import java.util.concurrent.Callable;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Future;
import java.util.function.Consumer;
import java.util.function.Function;
import java.util.stream.Collectors;

@Slf4j
@RequiredArgsConstructor(access = AccessLevel.PRIVATE)
@Builder(access = AccessLevel.PACKAGE)
public class ExecutorServiceBean {
    @NonNull
    private final ExecutorService executor;

    @NonNull
    private final SleepService sleepService;

    public Future<ExecutionResult<Void>> execute(Runnable command) {
        return asyncProcess(() -> {
            command.run();
            return null;
        });
    }

    public <T> Future<ExecutionResult<T>> asyncProcess(Callable<T> command) {
        return executor.submit(wrap(command));
    }

    private <T> Callable<ExecutionResult<T>> wrap(Callable<T> command) {
        return () -> {
            try {
                return new ExecutionResult<>(command.call(), null, true);
            } catch (Exception e) {
                log.error("Unexpected error during processing:", e);
                return new ExecutionResult<>(null, e, false);
            }
        };
    }

    public <I> void forEach(List<I> dataList, Consumer<I> mapper) {
        processCollectionWithWait(dataList, i -> {
            mapper.accept(i);
            return null;
        });
    }

    public <I, R> List<R> processCollectionWithWait(List<I> dataList, Function<I, R> mapper, int parallelism) {
        if (parallelism < 1) {
            throw new IllegalArgumentException("Parallelism must not be lower than 1. It was " + parallelism);
        }

        return Lists.partition(dataList, parallelism)
            .stream()
            .map(part -> processCollectionWithWait(part, mapper))
            .flatMap(Collection::stream)
            .collect(Collectors.toList());
    }

    public <I, R> List<R> processCollectionWithWait(Collection<I> dataList, Function<I, R> mapper) {
        log.debug("Processing {} items...", dataList.size());

        List<Future<ExecutionResult<R>>> futures = dataList.stream()
            .map(i -> executor.submit(wrap(() -> mapper.apply(i))))
            .collect(Collectors.toList());

        long inProgress;
        do {
            inProgress = futures.stream()
                .filter(rFuture -> !rFuture.isDone())
                .count();

            if (inProgress > 0) {
                log.debug("Incomplete tasks: {} out of {}", inProgress, dataList.size());
                sleepService.sleep(1);
            }
        } while (inProgress > 0);

        return futures.stream()
            .map(rFuture -> {
                try {
                    return rFuture.get()
                        .getOrThrow();
                } catch (Exception e) {
                    throw new RuntimeException(e);
                }
            })
            .collect(Collectors.toList());
    }

    public void stop() {
        executor.shutdownNow();
    }
}
