package com.bellydanceacademy.lesson;

public enum MoveDirection {
    UP(-1),
    DOWN(1);

    private final int offset;

    MoveDirection(int offset) {
        this.offset = offset;
    }

    int offset() {
        return offset;
    }
}
