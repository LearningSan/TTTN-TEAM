package com.example.tttnbe.exception;

//ke thua RuntimeException de springboot hieu day la loi co the nem ra luc chay
public class CustomException extends RuntimeException {

    public CustomException(String message) {
        super(message); //truyen vao cau thong bao cho class cha ly
    }
}