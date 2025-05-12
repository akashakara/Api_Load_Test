package com.loadtest.loadtester.model;

import lombok.Data;
import java.util.List;
import java.util.Map;

import com.loadtest.dto.ErrorResponse;
import com.loadtest.dto.TimestampedResult;

@Data
public class LoadTestResult {
    private int success_req;
    private int failed_req;
    private double average_time;
    private double min_time;
    private double max_time;
    private double median_time;
    private double percentile_90;
    private List<Double> response_times;
    private Map<Integer, Integer> status_codes;
    private List<ErrorResponse> error_details;
    private List<TimestampedResult> timeline;
}
