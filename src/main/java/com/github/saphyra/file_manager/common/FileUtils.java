package com.github.saphyra.file_manager.common;

import java.io.File;
import java.util.Arrays;

public class FileUtils {
    public static boolean isRoot(File file) {
        return Arrays.stream(File.listRoots()).map(File::getPath).anyMatch(rootPath -> rootPath.equals(file.getPath()));
    }
}
