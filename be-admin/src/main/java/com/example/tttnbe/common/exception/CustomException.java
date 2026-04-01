package com.example.tttnbe.common.exception;

//ke thua RuntimeException de springboot hieu day la loi co the nem ra luc chay
public class CustomException extends RuntimeException {
    private final int status;

    public CustomException(int status, String message) {
        super(message);
        this.status = status;
    }

    public int getStatus() {
        return status;
    }
}