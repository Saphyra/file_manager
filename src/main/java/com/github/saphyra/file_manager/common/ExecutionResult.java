package com.github.saphyra.file_manager.common;

import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Data;

import java.util.Optional;

@AllArgsConstructor(access = AccessLevel.PACKAGE)
@Data
public class ExecutionResult<T> {
    private final T value;
    private final Exception exception;
    private final boolean success;

    public T getOrThrow() throws Exception {
        if (success) {
            return value;
        }

        throw Optional.ofNullable(exception)
            .orElseGet(() -> new RuntimeException("Both value and exception was null of this result."));
    }
}
