package com.loadtest.loadtester.controller;

import com.loadtest.loadtester.model.LoadTestRequest;
import com.loadtest.loadtester.model.LoadTestResult;
import com.loadtest.loadtester.service.LoadTestService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
public class LoadTestController {

    @Autowired
    private LoadTestService loadTestService;
    @CrossOrigin(origins = "http://localhost:3000")
    @PostMapping("/load-test")
    public ResponseEntity<LoadTestResult> loadTest(@RequestBody LoadTestRequest request) {
        LoadTestResult result = loadTestService.runLoadTest(request);
        return ResponseEntity.ok(result);
    }

}
