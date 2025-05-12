package com.loadtest.loadtester.model;

import lombok.Data;

@Data
public class LoadTestRequest {
    private String url;
    private String method; 
    private String body; 
    private int num_requests;
    private int concurrency;
}
