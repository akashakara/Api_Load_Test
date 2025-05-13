package com.loadtest.loadtester.service;

import com.loadtest.dto.ErrorResponse;
import com.loadtest.dto.TimestampedResult;
import com.loadtest.loadtester.model.*;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.http.*;
import java.time.Duration;
import java.util.*;
import java.util.concurrent.*;

@Service
public class LoadTestService {

    public LoadTestResult runLoadTest(LoadTestRequest request) {
        List<Double> responseTimes = Collections.synchronizedList(new ArrayList<>());
        Map<Integer, Integer> statusCodeMap = new ConcurrentHashMap<>();
        List<ErrorResponse> errorResponses = Collections.synchronizedList(new ArrayList<>());
        List<TimestampedResult> timeline = Collections.synchronizedList(new ArrayList<>());

        ExecutorService executor = Executors.newFixedThreadPool(request.getConcurrency());
        HttpClient client = HttpClient.newBuilder().connectTimeout(Duration.ofSeconds(10)).build();

        CountDownLatch latch = new CountDownLatch(request.getNum_requests());

        for (int i = 0; i < request.getNum_requests(); i++) {
            executor.submit(() -> {
                try {
                    HttpRequest.Builder builder = HttpRequest.newBuilder()
                            .uri(URI.create(request.getUrl()))
                            .timeout(Duration.ofSeconds(10));

                    if ("POST".equalsIgnoreCase(request.getMethod()) && request.getBody() != null) {
                        builder.POST(HttpRequest.BodyPublishers.ofString(request.getBody()));
                    } else {
                        builder.GET();
                    }

                    long start = System.currentTimeMillis();
                    HttpResponse<String> response = client.send(builder.build(), HttpResponse.BodyHandlers.ofString());
                    long end = System.currentTimeMillis();

                    double duration = end - start;
                    responseTimes.add(duration);
                    timeline.add(new TimestampedResult(start, duration));

                    statusCodeMap.merge(response.statusCode(), 1, Integer::sum);

                    if (response.statusCode() >= 400) {
                        errorResponses.add(new ErrorResponse(response.statusCode(), response.body()));
                    }

                } catch (Exception e) {
                    errorResponses.add(new ErrorResponse(0, e.getMessage()));
                } finally {
                    latch.countDown();
                }
            });
        }

        try {
            latch.await();
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }

        executor.shutdown();

        return calculateMetrics(responseTimes, statusCodeMap, errorResponses, timeline);
    }

    private LoadTestResult calculateMetrics(List<Double> times, Map<Integer, Integer> statusCodes,List<ErrorResponse> errors, List<TimestampedResult> timeline) {
        LoadTestResult result = new LoadTestResult();

        int success = 0;
        int failed = 0;

        for (Map.Entry<Integer, Integer> entry : statusCodes.entrySet()) {
            if (entry.getKey() >= 200 && entry.getKey() < 400) {
                success += entry.getValue();
            } else {
                failed += entry.getValue();
            }
        }

        result.setSuccess_req(success);
        result.setFailed_req(failed);
        result.setStatus_codes(statusCodes);
        result.setError_details(errors);
        result.setTimeline(timeline);
        result.setResponse_times(times);

        if (!times.isEmpty()) {
            Collections.sort(times);
            double total = times.stream().mapToDouble(Double::doubleValue).sum();
            double avg = total / times.size();
            double min = times.get(0);
            double max = times.get(times.size() - 1);
            double median = times.get(times.size() / 2);
            double p90 = times.get((int) (times.size() * 0.9));

            result.setAverage_time(avg);
            result.setMin_time(min);
            result.setMax_time(max);
            result.setMedian_time(median);
            result.setPercentile_90(p90);
        }

        return result;
    }
}
