package com.example.tttnbe.exception;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.HashMap;
import java.util.Map;

@RestControllerAdvice   //danh dau class bat loi tu controller nem ra
public class GlobalExceptionHandler {

    //khi nao co CustomException vang ra thi chay vao ham nay
    @ExceptionHandler(CustomException.class)
    public ResponseEntity<Map<String, String>> handleCustomException(CustomException ex) {
        Map<String, String> response = new HashMap<>();
        response.put("error", ex.getMessage());

        //tra ve status 400 va json bao loii
        return ResponseEntity.badRequest().body(response);
    }
}