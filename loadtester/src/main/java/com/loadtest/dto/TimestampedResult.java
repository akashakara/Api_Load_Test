package com.loadtest.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class TimestampedResult {
    private long timestamp;
    private double duration;
}
